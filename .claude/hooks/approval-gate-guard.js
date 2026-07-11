#!/usr/bin/env node
// PreToolUse (Write) — blocks writing travel-guide.html unless the latest
// daily-plan(-vN).md in the run directory records documentStatus: approved.
// Assumes html-builder writes travel-guide.html exactly once (per CLAUDE.md);
// if that ever becomes an in-place Edit, this gate needs Edit coverage too.
const fs = require("fs");
const path = require("path");
const { readFrontmatter, documentStatus } = require("./lib/frontmatter");
const { withWritePayload } = require("./lib/hook-io");

function latestDailyPlanStatus(dir) {
  let best = 0;
  let status = null;
  let name = null;
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return { status, name };
  }
  for (const f of entries) {
    const m = /^daily-plan(?:-v(\d+))?\.md$/i.exec(f);
    if (!m) continue;
    const v = m[1] ? Number(m[1]) : 1;
    if (v >= best) {
      best = v;
      name = f;
      status = documentStatus(readFrontmatter(path.join(dir, f)));
    }
  }
  return { status, name };
}

withWritePayload((payload, filePath) => {
  const { status, name } = latestDailyPlanStatus(path.dirname(filePath));
  if (status !== "approved") {
    process.stderr.write(
      `Blocked: cannot write "travel-guide.html" — publishing requires a deterministic ` +
        `human-approval gate. The latest daily plan (${name || "daily-plan.md"}) ` +
        `${status ? `records documentStatus: ${status}` : "has no documentStatus"}, not "approved". ` +
        "Record traveler approval by setting documentStatus: approved on the daily plan first.",
    );
    process.exit(2);
  }
  process.exit(0);
});
