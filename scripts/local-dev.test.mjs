import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assertAppPortAvailable,
  localAppEnvironment,
  runCommand,
  startLocalDevelopment,
} from "./local-dev.mjs";

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

test("default startup resets only the local DB before launching Next with local credentials", async (t) => {
  const f = await fixture(t);
  f.options.env.NEXT_PUBLIC_SUPABASE_URL = "https://hosted.example.com";
  f.options.env.SUPABASE_SECRET_KEY = "hosted-secret";
  await startLocalDevelopment(f.options);
  const commands = f.calls.filter((call) => !call.args.includes("ci"));
  assert.deepEqual(commands.map((call) => call.args.slice(1, 4)), [
    ["stop", "--workdir", f.root], ["start", "--workdir", f.root], ["db", "reset", "--local"],
    ["status", "--output", "json"], ["dev", "--hostname", "127.0.0.1"],
  ]);
  const reset = commands[2];
  assert.ok(reset.args.includes("--yes"));
  assert.ok(!reset.args.includes("--linked") && !reset.args.includes("--db-url"));
  const next = commands.at(-1);
  assert.equal(next.env.NEXT_PUBLIC_SUPABASE_URL, f.status.API_URL);
  assert.equal(next.env.SUPABASE_SECRET_KEY, "local-secret");
  assert.equal(next.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, "local-public");
  assert.equal(next.env.APP_ORIGIN, "http://127.0.0.1:3000");
  assert.equal(next.cwd, path.join(f.root, "web"));
  assert.ok(commands[1].capture && commands[3].capture);
});

test("resume applies pending migrations locally without resetting or seeding", async (t) => {
  const f = await fixture(t);
  await startLocalDevelopment({ ...f.options, resume: true });
  assert.ok(f.calls.some((call) => call.args?.slice(1, 4).join(" ") === "migration up --local"));
  assert.ok(!f.calls.some((call) => call.args?.includes("reset")));
});

test("startup stops after a failed reset", async (t) => {
  const f = await fixture(t);
  const run = f.options.run;
  f.options.run = async (command, args, settings) => {
    if (args.includes("reset")) throw new Error("migration failed");
    return run(command, args, settings);
  };
  await assert.rejects(startLocalDevelopment(f.options), /migration failed/);
  assert.ok(!f.calls.some((call) => call.args?.includes("dev")));
});

test("a port owned by an unrelated process prevents installation and any database reset", async (t) => {
  const f = await fixture(t);
  await assert.rejects(startLocalDevelopment({
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
  await startLocalDevelopment(f.options);
  assert.equal(await readFile(path.join(f.root, ".env"), "utf8"), await readFile(path.join(f.root, ".env.example"), "utf8"));
  const existing = "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=existing\nSUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=existing-secret\n";
  await writeFile(path.join(f.root, ".env"), existing);
  await startLocalDevelopment(f.options);
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
  await startLocalDevelopment(f.options);
  await startLocalDevelopment({ ...f.options, resume: true });
  const installs = f.calls.filter((call) => call.args.includes("ci"));
  assert.deepEqual(installs.map((call) => call.cwd), [f.root, path.join(f.root, "web"), f.root, path.join(f.root, "web")]);
  for (const call of installs) {
    assert.deepEqual(call.args, [f.options.env.npm_execpath, "ci", "--include=dev"]);
  }
});

test("a failed dependency install prevents backend startup and reset", async (t) => {
  const f = await fixture(t);
  await assert.rejects(startLocalDevelopment({
    ...f.options,
    run: async () => { throw new Error("install failed"); },
  }), /install failed/);
  assert.equal(f.calls.length, 0);
});

test("command execution supports paths with spaces, captures output and reports failures", async () => {
  assert.equal(await runCommand(process.execPath, ["-e", "process.stdout.write(process.argv[1])", "space in argument"], { capture: true }), "space in argument");
  await assert.rejects(runCommand(process.execPath, ["-e", "process.exit(7)"], { capture: true }), /Command failed \(exit 7\)/);
});
