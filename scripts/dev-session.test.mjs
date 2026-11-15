import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { withDevSession } from "./dev-session.mjs";
import { runCommand } from "./local-dev.mjs";

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
