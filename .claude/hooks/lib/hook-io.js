// Shared stdin/JSON payload handling for PreToolUse/PostToolUse hooks.
const path = require("path");

function readPayload(handler) {
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

// Fail-open readPayload variant scoped to Write calls targeting travel-guide.html.
function withWritePayload(handler) {
  readPayload((payload) => {
    if (payload.tool_name !== "Write") process.exit(0);
    const filePath = payload.tool_input && payload.tool_input.file_path;
    if (!filePath || !/^travel-guide\.html$/i.test(path.basename(filePath))) {
      process.exit(0);
    }
    handler(payload, filePath);
  });
}

module.exports = { readPayload, withWritePayload };
