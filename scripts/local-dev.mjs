import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { access, copyFile, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";
import { acceptDevHandoff, handoffDevSession, stopDevSession } from "./dev-session.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

function printDevLinks(appUrl, studioUrl) {
  console.log(`\n${styleText("bold", "  LOCAL DEVELOPMENT")}`);
  console.log(styleText("dim", "  -----------------------------------------------"));
  console.log(`  App               ${styleText(["bold", "underline", "cyan"], appUrl)}`);
  if (studioUrl) console.log(`  Supabase Studio   ${styleText(["bold", "underline", "green"], studioUrl)}`);
  console.log(`${styleText("dim", "  -----------------------------------------------")}\n`);
}

// Run JS entry points directly so paths with spaces also work on Windows.
export function runCommand(command, args, { cwd, env, capture = false, signal } = {}) {
  signal?.throwIfAborted();
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd, env, windowsHide: true, detached: process.platform !== "win32",
      stdio: capture ? ["inherit", "pipe", "inherit"] : "inherit",
    });
    let stdout = "";
    let interrupted = false;
    if (capture) child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    const terminate = (terminationSignal = "SIGTERM") => {
      if (interrupted) return;
      interrupted = true;
      if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
      if (process.platform === "win32") {
        // Next.js and npm spawn children; terminate the whole owned tree.
        const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
        killer.once("error", reject);
      } else {
        try { process.kill(-child.pid, terminationSignal); } catch (error) {
          if (error.code !== "ESRCH") reject(error);
        }
      }
    };
    const abort = () => terminate();
    signal?.addEventListener("abort", abort, { once: true });
    const signals = new Map(["SIGINT", "SIGTERM", "SIGHUP"].map((name) => [name, () => terminate(name)]));
    for (const [signal, forward] of signals) process.on(signal, forward);
    const cleanup = () => {
      for (const [signal, forward] of signals) process.off(signal, forward);
      signal?.removeEventListener("abort", abort);
    };
    child.once("error", (error) => { cleanup(); reject(error); });
    child.once("close", (code, signal) => {
      cleanup();
      if (code === 0 && !interrupted) return resolve(stdout);
      const error = new Error(signal || interrupted ? "Stopped. Supabase remains running." : `Command failed (exit ${code}).`);
      error.exitCode = signal || interrupted ? 130 : code || 1;
      reject(error);
    });
  });
}

async function packageBinary(directory, name) {
  const base = path.join(directory, "node_modules", name);
  const metadata = JSON.parse(await readFile(path.join(base, "package.json"), "utf8"));
  const binary = path.join(base, typeof metadata.bin === "string" ? metadata.bin : metadata.bin[name]);
  await access(binary);
  return binary;
}

// After stopping our previous session, leave unrelated port users alone.
export async function assertAppPortAvailable(port = 3000) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", () => reject(new Error(`Port ${port} belongs to another process. Stop it manually first.`)));
    server.listen(port, "127.0.0.1", () => server.close(resolve));
  });
}

export function localAppEnvironment(status, inherited) {
  const url = new URL(status.API_URL);
  if (!["http:", "https:"].includes(url.protocol) ||
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || url.username || url.password) {
    throw new Error("Supabase status must return a local API URL.");
  }
  const publishableKey = status.PUBLISHABLE_KEY || status.ANON_KEY;
  const secretKey = status.SECRET_KEY || status.SERVICE_ROLE_KEY;
  if (!publishableKey || !secretKey) throw new Error("Supabase status is missing local API keys.");
  return {
    ...inherited,
    NODE_ENV: "development",
    NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    SUPABASE_SECRET_KEY: secretKey,
    APP_ORIGIN: "http://127.0.0.1:3000",
    PORT: "3000",
  };
}

export async function prepareEnvironment({
  reset = false, root = repositoryRoot, env = process.env, run = runCommand,
  checkPort = assertAppPortAvailable, signal,
} = {}) {
  await checkPort();
  // Supabase itself reads .env and validates the OAuth configuration.
  await copyFile(path.join(root, ".env.example"), path.join(root, ".env"), constants.COPYFILE_EXCL)
    .catch((error) => { if (error.code !== "EEXIST") throw error; });
  const web = path.join(root, "web");
  if (!env.npm_execpath) throw new Error("Start this script through npm run dev.");
  for (const directory of [root, web]) {
    console.log(`Installing locked dependencies in ${directory}...`);
    await run(process.execPath, [env.npm_execpath, "ci", "--include=dev"], { cwd: directory, env, signal });
  }
  const cli = await packageBinary(root, "supabase");
  const supabase = (args, capture = false) => run(process.execPath, [cli, ...args, "--workdir", root], {
    cwd: root, env, capture, signal,
  });
  // Restart services too, so config.toml and root .env changes take effect.
  console.log("Refreshing local Supabase services...");
  await supabase(["stop"]);
  console.log("Starting local Supabase. Docker must be running and root .env must contain Google OAuth credentials.");
  // The CLI's startup summary contains keys; only its progress on stderr is shown.
  await supabase(["start"], true);
  console.log(reset ? "Resetting LOCAL database from this branch. Local accounts and data will be cleared." : "Applying pending local migrations (preserving existing data)...");
  // CLI v3 targets the local stack unless --remote is explicitly supplied.
  await supabase(reset ? ["db", "reset", "--yes"] : ["migration", "up"]);
  const status = JSON.parse(await supabase(["status", "--output", "json"], true));
  const appEnv = localAppEnvironment(status, env);
  printDevLinks(appEnv.APP_ORIGIN, status.STUDIO_URL);
  return appEnv;
}

export async function runNextServer({ root = repositoryRoot, env = process.env, run = runCommand, signal } = {}) {
  const cli = await packageBinary(root, "supabase");
  const status = JSON.parse(await run(process.execPath, [cli, "status", "--output", "json", "--workdir", root], { cwd: root, env, capture: true, signal }));
  const web = path.join(root, "web");
  const appEnv = localAppEnvironment(status, env);
  printDevLinks(appEnv.APP_ORIGIN, status.STUDIO_URL);
  console.log("Next.js live logs. npm run dev stop stops Next.js and Supabase.");
  await run(process.execPath, [await packageBinary(web, "next"), "dev", "--hostname", "127.0.0.1", "--port", "3000"], { cwd: web, env: appEnv, signal });
}

export async function stopLocalDevelopment({ root = repositoryRoot, env = process.env, run = runCommand } = {}) {
  await stopDevSession(root);
  let cli;
  try { cli = await packageBinary(root, "supabase"); } catch (error) {
    if (error.code !== "ENOENT") throw error;
    // An interrupted npm ci may have removed the executable needed to stop Docker.
    if (!env.npm_execpath) throw new Error("Run npm ci in the root to restore Supabase tooling, then retry stop.");
    console.log("Restoring root tooling after an interrupted install...");
    await run(process.execPath, [env.npm_execpath, "ci", "--include=dev", "--prefer-offline"], { cwd: root, env });
    cli = await packageBinary(root, "supabase");
  }
  await run(process.execPath, [cli, "stop", "--workdir", root], { cwd: root, env });
  console.log("Local dev environment stopped. Database data is retained.");
}

export async function launchServerTerminal({
  root = repositoryRoot, env = process.env, run = runCommand,
  platform = process.platform, script = fileURLToPath(import.meta.url), token, signal,
} = {}) {
  signal?.throwIfAborted();
  if (platform === "win32") {
    // Use environment values instead of interpolating paths or secrets into shell code.
    const command = "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; Start-Process -FilePath $env:UBC_DEV_NODE -ArgumentList @(('\"' + $env:UBC_DEV_SCRIPT + '\"'), '--server', $env:UBC_DEV_TOKEN) -WorkingDirectory $env:UBC_DEV_ROOT -WindowStyle Normal";
    await run("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(command, "utf16le").toString("base64")], {
      cwd: root, env: { ...env, UBC_DEV_NODE: process.execPath, UBC_DEV_SCRIPT: script, UBC_DEV_ROOT: root, UBC_DEV_TOKEN: token }, signal,
    });
  } else if (platform === "darwin") {
    const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
    const command = `cd ${quote(root)} && exec ${quote(process.execPath)} ${quote(script)} --server ${quote(token)}`;
    await run("osascript", ["-e", `tell application "Terminal" to do script ${JSON.stringify(command)}`], { cwd: root, env, signal });
  } else {
    // On Linux, use the desktop's terminal emulator (override for non-Debian desktops).
    const child = spawn(env.DEV_TERMINAL || "x-terminal-emulator", ["-e", process.execPath, script, "--server", token], {
      cwd: root, env, detached: true, stdio: "ignore",
    });
    await new Promise((resolve, reject) => { child.once("spawn", resolve); child.once("error", reject); });
    child.unref();
  }
  console.log("Backend setup complete. Next.js is starting in a separate terminal with live logs.");
  console.log("Stop everything: npm run dev stop");
}

export async function launchDevelopment({ root = repositoryRoot, reset = false, prepare = prepareEnvironment, openTerminal = launchServerTerminal } = {}) {
  await handoffDevSession(root,
    (signal) => prepare({ root, reset, signal }),
    (token, signal) => openTerminal({ root, token, signal }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const main = async () => {
    if (args.length === 1 && args[0] === "--help") {
      console.log("npm run dev preserves local data, applies pending migrations, then opens Next.js in a separate terminal.\nnpm run dev:reset resets local data from migrations and seeds.\nnpm run dev stop stops Next.js and Supabase.\nRequires Node from web/.nvmrc, Docker, and root .env Google OAuth credentials.");
    } else if (args.length === 1 && args[0] === "stop") {
      await stopLocalDevelopment();
    } else if (args.length === 2 && args[0] === "--server") {
      process.title = "UBC Startups - Next.js";
      await acceptDevHandoff(repositoryRoot, args[1], (signal) => runNextServer({ signal }));
    } else if (args.length === 0 || (args.length === 1 && args[0] === "--reset")) {
      await launchDevelopment({ reset: args.includes("--reset") });
    } else {
      throw new Error("Usage: npm run dev | npm run dev:reset | npm run dev stop");
    }
  };
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = error.exitCode ?? 1;
  });
}
