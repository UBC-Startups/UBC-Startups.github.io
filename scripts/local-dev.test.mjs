import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assertAppPortAvailable,
  localAppEnvironment,
  runCommand,
  prepareEnvironment,
  runNextServer,
  stopLocalDevelopment,
} from "./local-dev.mjs";
import { withDevSession } from "./dev-session.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "ubc-local-dev-"));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, "web"));
  await writeFile(path.join(root, ".env.example"), "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=\nSUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=\n");
  for (const [directory, name] of [[root, "supabase"], [path.join(root, "web"), "next"]]) {
    await writeFile(path.join(directory, "package.json"), JSON.stringify({ name }));
    await writeFile(path.join(directory, "package-lock.json"), "{}");
    await mkdir(path.join(directory, "node_modules", name), { recursive: true });
    await writeFile(path.join(directory, "node_modules", name, "package.json"), JSON.stringify({ bin: { [name]: "cli.js" } }));
    await writeFile(path.join(directory, "node_modules", name, "cli.js"), "");
  }
  const env = {
    npm_execpath: path.join(root, "npm-cli.js"),
    SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: "local-client",
    SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET: "local-oauth-secret",
  };
  const status = {
    API_URL: "http://127.0.0.1:54321", PUBLISHABLE_KEY: "local-public",
    SECRET_KEY: "local-secret", STUDIO_URL: "http://127.0.0.1:54323",
  };
  const calls = [];
  const options = {
    root, env, checkPort: async () => {},
    run: async (command, args, settings) => {
      calls.push({ command, args, ...settings });
      return args.includes("status") ? JSON.stringify(status) : "";
    },
  };
  return { root, status, calls, options };
}

test("explicit reset clears only the local DB and returns local credentials", async (t) => {
  const f = await fixture(t);
  f.options.env.NEXT_PUBLIC_SUPABASE_URL = "https://hosted.example.com";
  f.options.env.SUPABASE_SECRET_KEY = "hosted-secret";
  const env = await prepareEnvironment({ ...f.options, reset: true });
  const commands = f.calls.filter((call) => !call.args.includes("ci"));
  assert.deepEqual(commands.map((call) => call.args.slice(1, 4)), [
    ["stop", "--workdir", f.root], ["start", "--workdir", f.root], ["db", "reset", "--yes"],
    ["status", "--output", "json"],
  ]);
  const reset = commands[2];
  assert.ok(reset.args.includes("--yes"));
  assert.ok(!reset.args.some((arg) => /^--(?:remote|linked|db-url|local)(?:=|$)/.test(arg)));
  assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, f.status.API_URL);
  assert.equal(env.SUPABASE_SECRET_KEY, "local-secret");
  assert.equal(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, "local-public");
  assert.equal(env.APP_ORIGIN, "http://127.0.0.1:3000");
  assert.ok(commands[1].capture && commands[3].capture);
});

test("default startup applies pending migrations locally without resetting or reseeding", async (t) => {
  const f = await fixture(t);
  await prepareEnvironment(f.options);
  const migration = f.calls.find((call) => call.args?.slice(1, 3).join(" ") === "migration up");
  assert.ok(migration);
  assert.ok(!migration.args.some((arg) => /^--(?:remote|linked|db-url|local)(?:=|$)/.test(arg)));
  assert.ok(!f.calls.some((call) => call.args?.includes("reset")));
});

test("the server terminal reads local settings and launches Next.js without reinstalling or resetting", async (t) => {
  const f = await fixture(t);
  await runNextServer(f.options);
  assert.equal(f.calls.length, 2);
  const next = f.calls[1];
  assert.deepEqual(next.args.slice(1), ["dev", "--hostname", "127.0.0.1", "--port", "3000"]);
  assert.equal(next.env.NEXT_PUBLIC_SUPABASE_URL, f.status.API_URL);
  assert.equal(next.env.SUPABASE_SECRET_KEY, "local-secret");
  assert.equal(next.cwd, path.join(f.root, "web"));
});

test("stop restores Supabase tooling removed by an interrupted root install, then stops the backend", async (t) => {
  const f = await fixture(t);
  const metadata = path.join(f.root, "node_modules", "supabase", "package.json");
  let installing;
  const enteredInstall = new Promise((resolve) => { installing = resolve; });
  const setup = withDevSession(f.root, async (signal) => {
    await unlink(metadata);
    installing();
    await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
  }, { phase: "setup" });
  await enteredInstall;
  await stopLocalDevelopment({ ...f.options, run: async (command, args, settings) => {
    f.calls.push({ command, args, ...settings });
    if (args.includes("ci")) await writeFile(metadata, JSON.stringify({ bin: { supabase: "cli.js" } }));
  } });
  await setup;
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.calls[0].args, [f.options.env.npm_execpath, "ci", "--include=dev", "--prefer-offline"]);
  assert.deepEqual(f.calls[1].args.slice(1), ["stop", "--workdir", f.root]);
});

test("stop also repairs an install whose package metadata exists but executable is missing", async (t) => {
  const f = await fixture(t);
  const binary = path.join(f.root, "node_modules", "supabase", "cli.js");
  await unlink(binary);
  await stopLocalDevelopment({ ...f.options, run: async (command, args) => {
    f.calls.push({ command, args });
    if (args.includes("ci")) await writeFile(binary, "");
  } });
  assert.equal(f.calls.length, 2);
  assert.ok(f.calls[0].args.includes("ci"));
  assert.equal(f.calls[1].args[1], "stop");
});

test("stop shuts down the managed app before stopping Supabase without installing or resetting", async (t) => {
  const f = await fixture(t);
  let ready;
  const started = new Promise((resolve) => { ready = resolve; });
  let appStopped = false;
  const session = withDevSession(f.root, async (signal) => {
    ready();
    await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
    appStopped = true;
  });
  await started;
  await stopLocalDevelopment({ ...f.options, run: async (command, args) => {
    assert.equal(appStopped, true);
    assert.deepEqual(args.slice(1), ["stop", "--workdir", f.root]);
    f.calls.push({ command, args });
  } });
  await session;
  assert.equal(f.calls.length, 1);
});

test("startup stops after a failed reset", async (t) => {
  const f = await fixture(t);
  const run = f.options.run;
  f.options.run = async (command, args, settings) => {
    if (args.includes("reset")) throw new Error("migration failed");
    return run(command, args, settings);
  };
  await assert.rejects(prepareEnvironment({ ...f.options, reset: true }), /migration failed/);
  assert.ok(!f.calls.some((call) => call.args?.includes("dev")));
});

test("a port owned by an unrelated process prevents installation and any database reset", async (t) => {
  const f = await fixture(t);
  await assert.rejects(prepareEnvironment({
    ...f.options, checkPort: async () => { throw new Error("port busy"); },
  }), /port busy/);
  assert.equal(f.calls.length, 0);
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await assert.rejects(assertAppPortAvailable(server.address().port), /another process/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("startup creates a missing env template and preserves an existing env file", async (t) => {
  const f = await fixture(t);
  await prepareEnvironment(f.options);
  assert.equal(await readFile(path.join(f.root, ".env"), "utf8"), await readFile(path.join(f.root, ".env.example"), "utf8"));
  const existing = "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=existing\nSUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=existing-secret\n";
  await writeFile(path.join(f.root, ".env"), existing);
  await prepareEnvironment(f.options);
  assert.equal(await readFile(path.join(f.root, ".env"), "utf8"), existing);
});

test("only loopback status URLs are accepted, with legacy local key fallback", () => {
  for (const API_URL of [undefined, "https://project.supabase.co", "file:///tmp/db", "http://user:pass@localhost"]) {
    assert.throws(() => localAppEnvironment({ API_URL }, {}));
  }
  const env = localAppEnvironment({ API_URL: "http://localhost:54321", ANON_KEY: "anon", SERVICE_ROLE_KEY: "service" }, {});
  assert.equal(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, "anon");
  assert.equal(env.SUPABASE_SECRET_KEY, "service");
  assert.ok(!Object.keys(env).some((key) => key.startsWith("NEXT_PUBLIC_") && env[key] === "service"));
  assert.throws(() => localAppEnvironment({ API_URL: "http://127.0.0.1:54321" }, {}), /missing local API keys/);
});

test("every startup installs locked root and web dependencies", async (t) => {
  const f = await fixture(t);
  await prepareEnvironment(f.options);
  await prepareEnvironment({ ...f.options, reset: true });
  const installs = f.calls.filter((call) => call.args.includes("ci"));
  assert.deepEqual(installs.map((call) => call.cwd), [f.root, path.join(f.root, "web"), f.root, path.join(f.root, "web")]);
  for (const call of installs) {
    assert.deepEqual(call.args, [f.options.env.npm_execpath, "ci", "--include=dev"]);
  }
});

test("a failed dependency install prevents backend startup and reset", async (t) => {
  const f = await fixture(t);
  await assert.rejects(prepareEnvironment({
    ...f.options,
    run: async () => { throw new Error("install failed"); },
  }), /install failed/);
  assert.equal(f.calls.length, 0);
});

test("command execution supports paths with spaces, captures output and reports failures", async () => {
  assert.equal(await runCommand(process.execPath, ["-e", "process.stdout.write(process.argv[1])", "space in argument"], { capture: true }), "space in argument");
  await assert.rejects(runCommand(process.execPath, ["-e", "process.exit(7)"], { capture: true }), /Command failed \(exit 7\)/);
});
