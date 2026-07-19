import fs from "fs";
import path from "path";

const LOCK_RETRY_MS = 25;
const LOCK_TIMEOUT_MS = 5000;

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // busy-wait: Node has no sync sleep primitive, and hooks are short-lived
    // one-shot processes so this doesn't compete with other work.
  }
}

// Serializes concurrent hook invocations that read-modify-write the same
// file (e.g. multiple parallel-stage agents writing workflow-state.json at
// once). Uses an exclusive-create lockfile as a simple cross-process mutex.
export function withFileLock(lockPath, fn) {
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  let fd;
  for (;;) {
    try {
      fd = fs.openSync(lockPath, "wx");
      break;
    } catch (err) {
      if (err.code !== "EEXIST" || Date.now() > deadline) throw err;
      sleepSync(LOCK_RETRY_MS);
    }
  }

  fs.closeSync(fd);
  try {
    return fn();
  } finally {
    try {
      fs.unlinkSync(lockPath);
    } catch {
      // already removed; nothing to clean up
    }
  }
}

export function readPayload(handler) {
  let input = "";
  process.stdin.on("data", (d) => (input += d));
  process.stdin.on("end", () => {
    let payload;
    try {
      payload = JSON.parse(input);
    } catch {
      process.exit(0);
    }
    handler(payload);
  });
}

export function withWritePayload(handler, fileNamePattern) {
  readPayload((payload) => {
    if (payload.tool_name !== "Write") process.exit(0);
    const filePath = payload.tool_input && payload.tool_input.file_path;
    if (!filePath || !fileNamePattern.test(path.basename(filePath))) {
      process.exit(0);
    }
    handler(payload, filePath);
  });
}
