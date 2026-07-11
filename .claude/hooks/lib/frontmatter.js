// Minimal flat `key: value` frontmatter reader shared by the workflow hooks.
const fs = require("fs");

function parseFrontmatter(content) {
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---/.exec(content || "");
  if (!m) return {};
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*?)\s*$/.exec(line);
    if (kv) fields[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

function readFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return parseFrontmatter(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function documentStatus(fields) {
  return String(fields.documentStatus || fields.documentstatus || "")
    .trim()
    .toLowerCase();
}

module.exports = { parseFrontmatter, readFrontmatter, documentStatus };
