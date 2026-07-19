#!/usr/bin/env node
// PreToolUse (Write) — blocks travel-guide.html from naming an internal
// workflow artifact (requirements.md, validation.md, transport.md, …).
import { withWritePayload } from "./lib/hook-io.js";
import {
  ARTIFACT_NAMES,
  WORKFLOW_STATE_FILENAME,
  TRAVEL_GUIDE_FILE_REGEX,
} from "./lib/workflow-artifacts.js";

const WORKFLOW_STATE_BASENAME = WORKFLOW_STATE_FILENAME.replace(/\.json$/, "");
// travel-guide.html is the public artifact itself, not an internal one to
// hide — excluding it lets the guide self-reference its own filename.
const INTERNAL_ARTIFACT_NAMES = [
  ...ARTIFACT_NAMES,
  WORKFLOW_STATE_BASENAME,
].filter((name) => name !== "travel-guide");
const INTERNAL_ARTIFACT_REGEX = new RegExp(
  `\\b(${INTERNAL_ARTIFACT_NAMES.join("|")})(-v\\d+)?\\.(md|json|html)\\b`,
  "i",
);

withWritePayload((payload, filePath) => {
  const content = (payload.tool_input && payload.tool_input.content) || "";
  const leak = content.match(INTERNAL_ARTIFACT_REGEX);
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
}, TRAVEL_GUIDE_FILE_REGEX);
