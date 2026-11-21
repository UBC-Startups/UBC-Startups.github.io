import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { acceptDevHandoff, stopDevSession, withDevSession } from "./dev-session.mjs";
import { launchDevelopment, launchServerTerminal, runCommand } from "./local-dev.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "ubc-dev-session-"));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
    await rm(root, { recursive: true, force: true });
  });
  return root;
}

test("a new session waits for the previous checkout session to stop", async (t) => {
  const root = await fixture(t);
  const events = [];
  let ready;
  const started = new Promise((resolve) => { ready = resolve; });
  const previous = withDevSession(root, async (signal) => {
    ready();
    await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
    await delay(30); // Simulate waiting for Next.js to finish shutting down.
    events.push("previous stopped");
  });
  await started;
  await withDevSession(root, async () => { events.push("replacement started"); });
  await previous;
  assert.deepEqual(events, ["previous stopped", "replacement started"]);
});

test("different checkouts can own independent sessions", async (t) => {
  const root = await fixture(t);
  const other = path.join(root, "other-checkout");
  await mkdir(other);
  await withDevSession(root, async (signal) => {
    await withDevSession(other, async () => {});
    assert.equal(signal.aborted, false);
  });
});

test("a failed startup releases its session for the next attempt", async (t) => {
  const root = await fixture(t);
  await assert.rejects(withDevSession(root, async () => { throw new Error("startup failed"); }), /startup failed/);
  await withDevSession(root, async () => {});
});

test("setup finishes in the current terminal before the server terminal is opened", async (t) => {
  const root = await fixture(t);
  const events = [];
  let server;
  let started;
  const ready = new Promise((resolve) => { started = resolve; });
  await launchDevelopment({ root, reset: true,
    prepare: async (options) => {
      assert.equal(options.reset, true);
      events.push("setup");
    },
    openTerminal: async ({ token }) => {
      events.push("terminal");
      server = acceptDevHandoff(root, token, async (signal) => {
        started();
        await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
      });
      await ready;
    },
  });
  assert.deepEqual(events, ["setup", "terminal"]);
  await stopDevSession(root);
  await server;
});

test("stop during terminal handoff prevents a delayed terminal from starting", async (t) => {
  const root = await fixture(t);
  let opening, release, cancelled;
  const opened = new Promise((resolve) => { opening = resolve; });
  const delayed = new Promise((resolve) => { release = resolve; });
  const aborted = new Promise((resolve) => { cancelled = resolve; });
  let serverStarted = false;
  const launch = launchDevelopment({ root,
    prepare: async ({ signal }) => signal.addEventListener("abort", cancelled, { once: true }),
    openTerminal: async ({ token }) => {
      opening();
      await delayed;
      await assert.rejects(acceptDevHandoff(root, token, async () => { serverStarted = true; }), /cancelled/);
    },
  });
  await opened;
  const stopping = stopDevSession(root);
  await aborted;
  release();
  await Promise.all([launch, stopping]);
  assert.equal(serverStarted, false);
});

test("a stale terminal cannot replace a newer server after its setup was cancelled", async (t) => {
  const root = await fixture(t);
  let oldToken, opening;
  const opened = new Promise((resolve) => { opening = resolve; });
  const oldLaunch = launchDevelopment({ root, prepare: async () => {},
    openTerminal: async ({ token }) => { oldToken = token; opening(); },
  });
  await opened;
  await stopDevSession(root);
  await oldLaunch;
  let server;
  let active = false;
  await launchDevelopment({ root, prepare: async () => {}, openTerminal: async ({ token }) => {
    let started;
    const ready = new Promise((resolve) => { started = resolve; });
    server = acceptDevHandoff(root, token, async (signal) => {
      active = true;
      started();
      await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
      active = false;
    });
    await ready;
  } });
  try {
    await assert.rejects(acceptDevHandoff(root, oldToken, async () => assert.fail("stale server started")), /cancelled/);
    assert.equal(active, true);
  } finally {
    await stopDevSession(root);
    await server;
  }
});

test("failed setup never opens a server terminal", async (t) => {
  const root = await fixture(t);
  let opened = false;
  await assert.rejects(launchDevelopment({ root,
    prepare: async () => { throw new Error("setup failed"); },
    openTerminal: async () => { opened = true; },
  }), /setup failed/);
  assert.equal(opened, false);
});

test("Windows launches a visible console without placing credentials in the command line", async (t) => {
  const root = await fixture(t);
  const script = path.join(root, "folder with spaces", "local-dev.mjs");
  await launchServerTerminal({ root, script, token: "test-token", platform: "win32", env: { SECRET_KEY: "test-secret" },
    run: async (command, args, settings) => {
      assert.equal(command, "powershell.exe");
      const code = Buffer.from(args.at(-1), "base64").toString("utf16le");
      assert.match(code, /Start-Process/);
      assert.match(code, /-WindowStyle Normal/);
      assert.match(code, /--server/);
      assert.ok(!code.includes("test-secret"));
      assert.equal(settings.env.UBC_DEV_SCRIPT, script);
      assert.equal(settings.env.UBC_DEV_TOKEN, "test-token");
    },
  });
});

test("cancelling a command stops its child tree and releases its listening port", { timeout: 15_000 }, async (t) => {
  const root = await fixture(t);
  const readyFile = path.join(root, "ready.json");
  const controller = new AbortController();
  // The direct child owns a grandchild, like the Next CLI and its dev server.
  const serverCode = "const net=require('node:net'),fs=require('node:fs');const s=net.createServer();s.listen(0,'127.0.0.1',()=>fs.writeFileSync(process.argv[1],JSON.stringify({port:s.address().port})));";
  const parentCode = "require('node:child_process').spawn(process.execPath,['-e',process.argv[1],process.argv[2]],{stdio:'inherit'});setInterval(()=>{},1000);";
  const command = runCommand(process.execPath, ["-e", parentCode, serverCode, readyFile], { signal: controller.signal, capture: true });
  const stopped = assert.rejects(command, (error) => error.exitCode === 130);
  let port;
  try {
    for (let attempt = 0; attempt < 200; attempt++) {
      const contents = await readFile(readyFile, "utf8").catch(() => null);
      if (contents) { port = JSON.parse(contents).port; break; }
      await delay(20);
    }
    assert.ok(port, "child server became ready");
  } finally {
    controller.abort();
    await stopped;
  }
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  await new Promise((resolve) => server.close(resolve));
});
