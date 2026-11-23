import { createHash, randomUUID } from "node:crypto";
import { createConnection, createServer } from "node:net";
import { unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// A local pipe identifies the runner for this checkout without storing a PID
// that could later belong to an unrelated process.
function sessionPipe(root, phase = "server") {
  const directory = process.platform === "win32" ? path.resolve(root).toLowerCase() : path.resolve(root);
  const name = `ubc-dev-${createHash("sha256").update(directory).digest("hex").slice(0, 20)}${phase === "server" ? "" : `-${phase}`}`;
  return process.platform === "win32" ? `\\\\.\\pipe\\${name}` : path.join(os.tmpdir(), `${name}.sock`);
}

async function request(pipe, message) {
  return new Promise((resolve, reject) => {
    const socket = createConnection(pipe);
    let response = "";
    socket.on("data", (chunk) => { response += chunk; });
    socket.setTimeout(15_000, () => socket.destroy(new Error("The previous dev session did not stop. Stop it manually and retry.")));
    socket.once("connect", () => {
      socket.write(`${message}\n`);
    });
    socket.once("end", () => resolve(response.trim()));
    socket.once("error", async (error) => {
      if (!["ENOENT", "ECONNREFUSED"].includes(error.code)) return reject(error);
      // A crashed Unix process can leave its socket file behind.
      try {
        if (error.code === "ECONNREFUSED" && process.platform !== "win32") await unlink(pipe);
        resolve("");
      } catch (cleanupError) {
        reject(cleanupError);
      }
    });
  });
}

async function stopPrevious(pipe) {
  const response = await request(pipe, "stop");
  if (response) await waitForExit(Number(response));
}

async function waitForExit(pid) {
  // In-process tests share a PID; separate runners must finish exiting so
  // Windows releases their working directory.
  if (!Number.isSafeInteger(pid) || pid <= 0 || pid === process.pid) return;
  for (let attempt = 0; attempt < 200; attempt++) {
    try { process.kill(pid, 0); } catch (error) {
      if (error.code === "ESRCH") return;
      throw error;
    }
    await delay(25);
  }
  throw new Error("The previous dev runner has not exited. Stop it manually and retry.");
}

export async function stopDevSession(root) {
  await stopPrevious(sessionPipe(root, "setup"));
  await stopPrevious(sessionPipe(root));
}

export async function withDevSession(root, start, { phase = "server", replace = true, onRequest } = {}) {
  const pipe = sessionPipe(root, phase);
  if (replace) await stopPrevious(pipe);
  const controller = new AbortController();
  let finished;
  const server = createServer((socket) => {
    socket.setTimeout(15_000, () => socket.destroy());
    socket.once("error", () => {});
    socket.once("data", async (request) => {
      const message = request.toString().trim();
      if (message !== "stop") {
        return socket.end(onRequest?.(message, controller.signal) ? "accepted" : "rejected");
      }
      controller.abort();
      await finished;
      socket.end(String(process.pid));
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(pipe, resolve);
  });
  try {
    finished = Promise.resolve().then(() => start(controller.signal));
    // Requests wait for shutdown even if the interrupted command rejects.
    const result = finished;
    finished = result.catch(() => {});
    await result;
  } catch (error) {
    if (!controller.signal.aborted) throw error;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

// Setup keeps its control endpoint until the new server has registered. A
// late terminal must validate this token before it can claim a server session.
export async function handoffDevSession(root, prepare, openTerminal) {
  const token = randomUUID();
  let acceptServer;
  const registered = new Promise((resolve) => { acceptServer = resolve; });
  await withDevSession(root, async (signal) => {
    await stopPrevious(sessionPipe(root));
    await prepare(signal);
    signal.throwIfAborted();
    await openTerminal(token, signal);
    signal.throwIfAborted();
    const timeout = AbortSignal.timeout(15_000);
    const waiting = AbortSignal.any([signal, timeout]);
    await new Promise((resolve, reject) => {
      const abort = () => reject(new Error(signal.aborted ? "Startup cancelled." : "The server terminal did not register within 15 seconds."));
      waiting.addEventListener("abort", abort, { once: true });
      registered.then(() => { waiting.removeEventListener("abort", abort); resolve(); });
    });
  }, {
    phase: "setup",
    onRequest: (message, signal) => {
      if (signal.aborted) return false;
      if (message === `check ${token}`) return true;
      if (message === `ready ${token}`) { acceptServer(); return true; }
      return false;
    },
  });
}

export async function acceptDevHandoff(root, token, start) {
  const setup = sessionPipe(root, "setup");
  if (!token || await request(setup, `check ${token}`) !== "accepted") {
    throw new Error("Startup was cancelled or replaced before this terminal opened.");
  }
  // A delayed terminal must never replace an already-running server.
  await withDevSession(root, async (signal) => {
    if (await request(setup, `ready ${token}`) !== "accepted") {
      throw new Error("Startup was cancelled during terminal handoff.");
    }
    signal.throwIfAborted();
    await start(signal);
  }, { replace: false });
}
