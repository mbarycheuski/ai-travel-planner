#!/usr/bin/env node
// PreToolUse (Write) — SINGLE RESPONSIBILITY: no internal-artifact leakage in
// the published guide.
//
// travel-guide.html is for the traveler and must never name an internal
// workflow artifact (requirements.md, validation.md, transport.md, …). Facts
// flow through to the guide; internal filenames do not. A phrase like
// "(flagged in validation.md)" is a defect, not content.
const path = require('path');

const INTERNAL_ARTIFACT_RE =
  /\b(requirements|execution-plan|transport|accommodation|activities|food|packing|budget|validation|daily-plan|approval|iteration-plan|workflow-state|travel-guide)(-v\d+)?\.(md|json|html)\b/i;

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  if (payload.tool_name !== 'Write') process.exit(0);

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath) process.exit(0);
  if (!/^travel-guide\.html$/i.test(path.basename(filePath))) process.exit(0);

  const content = (payload.tool_input && payload.tool_input.content) || '';
  const leak = content.match(INTERNAL_ARTIFACT_RE);
  if (leak) {
    process.stderr.write(
      `Blocked: "travel-guide.html" names the internal workflow artifact "${leak[0]}". ` +
        'The published guide is for the traveler and must never expose internal ' +
        'filenames. Rewrite the affected text so the same fact is stated without ' +
        'referencing any workflow artifact (e.g. "(flagged in validation.md)" → ' +
        'state the caveat plainly, or drop the parenthetical), then write again.'
    );
    process.exit(2);
  }
  process.exit(0);
});
