#!/usr/bin/env node
// PreToolUse hook covering two distinct rules from CLAUDE.md:
//
// 1. Freeze rule: once approval.md records status: APPROVED, block further
//    Write/Edit on the exact `final-plan.md` file (force a new version
//    instead of a silent edit of an approved artifact).
// 2. Deterministic human-approval gate: block Write of `travel-guide.html`
//    unless approval.md in the same run directory exists AND its current
//    Status field is APPROVED. This is the enforcement point for "final
//    output generation requires explicit, deterministically verified human
//    approval" — it does not rely on the orchestrator remembering to check.
//
// Note: travel-guide.html is intentionally NOT subject to rule 1. It is a
// mechanical re-render of final-plan.md produced by html-builder-agent right
// after approval is recorded, so approval.md is already APPROVED at the
// moment of that legitimate first write — freezing on that condition would
// block the build itself.
const fs = require('fs');
const path = require('path');

function readApprovalStatus(approvalPath) {
  if (!fs.existsSync(approvalPath)) return null;
  const content = fs.readFileSync(approvalPath, 'utf8');
  const m = content.match(/^Status:\s*(\S+)/im);
  return m ? m[1].toUpperCase() : null;
}

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const toolName = payload.tool_name;
  if (toolName !== 'Write' && toolName !== 'Edit') process.exit(0);

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath) process.exit(0);

  const base = path.basename(filePath);
  const approvalPath = path.join(path.dirname(filePath), 'approval.md');

  if (/^final-plan\.md$/i.test(base)) {
    if (readApprovalStatus(approvalPath) === 'APPROVED') {
      process.stderr.write(
        `Blocked: "${base}" is frozen because approval.md already records status: APPROVED. ` +
          'Do not edit an approved artifact directly. Run a targeted iteration instead: ' +
          'produce a new versioned artifact (e.g. final-plan-v2.md), get it re-approved, ' +
          'then regenerate the approved file.'
      );
      process.exit(2);
    }
    process.exit(0);
  }

  if (/^travel-guide\.html$/i.test(base)) {
    const status = readApprovalStatus(approvalPath);
    if (status !== 'APPROVED') {
      process.stderr.write(
        `Blocked: cannot write "${base}" — final output generation requires a deterministic ` +
          `human approval gate. approval.md ${
            status ? `currently records status: ${status}` : 'does not exist yet'
          }, not APPROVED. Complete Stage 7 approval (write approval.md with Status: APPROVED) ` +
          'before generating the HTML guide.'
      );
      process.exit(2);
    }
    process.exit(0);
  }

  process.exit(0);
});
