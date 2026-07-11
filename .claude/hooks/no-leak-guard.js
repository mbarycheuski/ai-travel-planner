#!/usr/bin/env node
// PreToolUse (Write) — blocks writing travel-guide.html if its content names
// any internal workflow artifact (requirements.md, validation.md, transport.md, …).
const { withWritePayload } = require("./lib/hook-io");

const INTERNAL_ARTIFACT_RE =
  /\b(requirements|execution-plan|transport|weather|accommodation|activities|food|packing|budget|validation|daily-plan|approval|iteration-plan|workflow-state|travel-guide)(-v\d+)?\.(md|json|html)\b/i;

withWritePayload((payload, filePath) => {
  const content = (payload.tool_input && payload.tool_input.content) || "";
  const leak = content.match(INTERNAL_ARTIFACT_RE);
  if (leak) {
    process.stderr.write(
      `Blocked: "travel-guide.html" names the internal workflow artifact "${leak[0]}". ` +
        "The published guide is for the traveler and must never expose internal " +
        "filenames. Rewrite the affected text so the same fact is stated without " +
        'referencing any workflow artifact (e.g. "(flagged in validation.md)" → ' +
        "state the caveat plainly, or drop the parenthetical), then write again.",
    );
    process.exit(2);
  }
  process.exit(0);
});
