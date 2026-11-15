import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { copyFile, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withDevSession } from "./dev-session.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

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
    const signals = new Map(["SIGINT", "SIGTERM"].map((name) => [name, () => terminate(name)]));
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
  return path.join(base, typeof metadata.bin === "string" ? metadata.bin : metadata.bin[name]);
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

export async function startLocalDevelopment({
  resume = false, root = repositoryRoot, env = process.env, run = runCommand,
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
  console.log(resume ? "Applying pending local migrations..." : "Resetting LOCAL database from this branch. Local accounts and data will be cleared.");
  await supabase(resume ? ["migration", "up", "--local"] : ["db", "reset", "--local", "--yes"]);
  const status = JSON.parse(await supabase(["status", "--output", "json"], true));
  const appEnv = localAppEnvironment(status, env);
  console.log(`App: ${appEnv.APP_ORIGIN}`);
  if (status.STUDIO_URL) console.log(`Supabase Studio: ${status.STUDIO_URL}`);
  console.log("Ctrl+C stops Next.js. npm run dev:stop stops Supabase.");
  await run(process.execPath, [await packageBinary(web, "next"), "dev", "--hostname", "127.0.0.1", "--port", "3000"], {
    cwd: web, env: appEnv, signal,
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--help") {
    console.log("npm run dev resets the local DB; npm run dev:resume preserves data.\nRequires Node from web/.nvmrc, Docker, and Google OAuth credentials in root .env.");
  } else if (args.length > 1 || args.some((arg) => arg !== "--resume")) {
    console.error("Usage: npm run dev [-- --resume]");
    process.exitCode = 1;
  } else {
    withDevSession(repositoryRoot, (signal) => startLocalDevelopment({ resume: args.includes("--resume"), signal })).catch((error) => {
      console.error(error.message);
      process.exitCode = error.exitCode ?? 1;
    });
  }
}
