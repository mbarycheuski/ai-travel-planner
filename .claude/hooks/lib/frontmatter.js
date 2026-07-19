import fs from "fs";
import { DocumentStatus } from "./workflow-artifacts.js";

const FRONTMATTER_BLOCK_REGEX = /^﻿?---\r?\n([\s\S]*?)\r?\n---/;
const FRONTMATTER_LINE_REGEX = /^([A-Za-z0-9_]+):\s*(.*?)\s*$/;
const QUOTED_VALUE_REGEX = /^["']|["']$/g;

export function parseFrontmatter(content) {
  const block = FRONTMATTER_BLOCK_REGEX.exec(content || "");
  if (!block) return {};
  const fields = {};
  for (const line of block[1].split(/\r?\n/)) {
    const kv = FRONTMATTER_LINE_REGEX.exec(line);
    if (kv) fields[kv[1]] = kv[2].replace(QUOTED_VALUE_REGEX, "");
  }
  return fields;
}

export function readFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return parseFrontmatter(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

export function documentStatus(fields) {
  const raw = String(fields.documentStatus || fields.documentstatus || "")
    .trim()
    .toLowerCase();
  return Object.values(DocumentStatus).includes(raw) ? raw : "";
}
