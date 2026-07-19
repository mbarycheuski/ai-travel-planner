#!/usr/bin/env node
// PreToolUse (Write) — blocks travel-guide.html unless the latest daily plan
// records documentStatus: approved. Assumes html-builder writes the file
// exactly once; an in-place Edit would need Edit coverage too.
import fs from "fs";
import path from "path";
import { readFrontmatter, documentStatus } from "./lib/frontmatter.js";
import { withWritePayload } from "./lib/hook-io.js";
import {
  TRAVEL_GUIDE_FILE_REGEX,
  DocumentStatus,
} from "./lib/workflow-artifacts.js";

const DAILY_PLAN_FILE_REGEX = /^daily-plan(?:-v(\d+))?\.md$/i;
const DEFAULT_VERSION = 1;

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
    const m = DAILY_PLAN_FILE_REGEX.exec(f);
    if (!m) continue;
    const version = m[1] ? Number(m[1]) : DEFAULT_VERSION;
    if (version >= best) {
      best = version;
      name = f;
      status = documentStatus(readFrontmatter(path.join(dir, f)));
    }
  }
  return { status, name };
}

withWritePayload((payload, filePath) => {
  const { status, name } = latestDailyPlanStatus(path.dirname(filePath));
  if (status !== DocumentStatus.APPROVED) {
    process.stderr.write(
      `Blocked: cannot write "travel-guide.html" — publishing requires a deterministic ` +
        `human-approval gate. The latest daily plan (${name || "daily-plan.md"}) ` +
        `${status ? `records documentStatus: ${status}` : "has no documentStatus"}, not "approved". ` +
        "Record traveler approval by setting documentStatus: approved on the daily plan first.",
    );
    process.exit(2);
  }
  process.exit(0);
}, TRAVEL_GUIDE_FILE_REGEX);
