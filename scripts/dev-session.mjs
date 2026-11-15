import { createHash } from "node:crypto";
import { createConnection, createServer } from "node:net";
import { unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// A local pipe identifies the runner for this checkout without storing a PID
// that could later belong to an unrelated process.
function sessionPipe(root) {
  const directory = process.platform === "win32" ? path.resolve(root).toLowerCase() : path.resolve(root);
  const name = `ubc-dev-${createHash("sha256").update(directory).digest("hex").slice(0, 20)}`;
  return process.platform === "win32" ? `\\\\.\\pipe\\${name}` : path.join(os.tmpdir(), `${name}.sock`);
}

async function stopPrevious(pipe) {
  await new Promise((resolve, reject) => {
    const socket = createConnection(pipe);
    socket.setTimeout(15_000, () => socket.destroy(new Error("The previous dev session did not stop. Stop it manually and retry.")));
    socket.once("connect", () => {
      console.log("Stopping the previous dev session for this checkout...");
      socket.write("stop\n");
    });
    socket.once("end", resolve);
    socket.once("error", async (error) => {
      if (!["ENOENT", "ECONNREFUSED"].includes(error.code)) return reject(error);
      // A crashed Unix process can leave its socket file behind.
      try {
        if (error.code === "ECONNREFUSED" && process.platform !== "win32") await unlink(pipe);
        resolve();
      } catch (cleanupError) {
        reject(cleanupError);
      }
    });
  });
}

export async function withDevSession(root, start) {
  const pipe = sessionPipe(root);
  await stopPrevious(pipe);
  const controller = new AbortController();
  let finished;
  const server = createServer((socket) => {
    socket.setTimeout(15_000, () => socket.destroy());
    socket.once("error", () => {});
    socket.once("data", async (request) => {
      if (request.toString().trim() !== "stop") return socket.end();
      controller.abort();
      await finished;
      socket.end();
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
