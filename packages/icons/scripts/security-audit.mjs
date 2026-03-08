#!/usr/bin/env node

/**
 * Security audit for @thesvg/icons dist output.
 * Scans generated JS/CJS files for unsafe patterns before publish.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");

const RULES = [
  {
    name: "eval",
    regex: /\beval\s*\(/g,
    message: "eval() detected - dynamic code execution not allowed",
  },
  {
    name: "new-function",
    regex: /\bnew\s+Function\s*\(/g,
    message: "new Function() detected - dynamic code execution not allowed",
  },
  {
    name: "inner-html",
    regex: /\.innerHTML\s*=/g,
    message: "innerHTML assignment detected",
  },
  {
    name: "document-write",
    regex: /\bdocument\.write\s*\(/g,
    message: "document.write() detected",
  },
  {
    name: "script-tag",
    regex: /<script[\s>]/gi,
    message: "Embedded <script> tag detected in SVG data",
  },
  {
    name: "event-handler",
    regex: /\bon(load|error|click|mouseover|focus)\s*=/gi,
    message: "Inline event handler detected in SVG data",
  },
  {
    name: "xlink-href-js",
    regex: /xlink:href\s*=\s*["']javascript:/gi,
    message: "javascript: URI in xlink:href detected",
  },
  {
    name: "fetch-import",
    regex: /\b(fetch|import)\s*\(/g,
    message: "Runtime fetch/import detected - icons should be static data only",
    allowlist: [/index\.cjs$/], // CJS barrel uses require()
  },
  {
    name: "require-external",
    regex: /require\s*\(\s*["'][^.]/g,
    message: "External require detected - icons should have zero dependencies",
    allowlist: [/index\.cjs$/], // barrel requires local files
  },
];

async function collectFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/\.(js|cjs|mjs)$/.test(entry.name)) continue;
    files.push(path.join(dir, entry.name));
  }
  return files;
}

function getLineNumber(source, index) {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (source.charCodeAt(i) === 10) line++;
  }
  return line;
}

async function main() {
  try {
    await fs.access(DIST);
  } catch {
    console.error("[security-audit] dist/ not found. Run build first.");
    process.exitCode = 1;
    return;
  }

  const files = await collectFiles(DIST);
  console.log(`[security-audit] Scanning ${files.length} files...`);

  const findings = [];

  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    const relPath = path.relative(ROOT, file);

    for (const rule of RULES) {
      rule.regex.lastIndex = 0;
      let match = rule.regex.exec(source);
      while (match) {
        const isAllowed = (rule.allowlist ?? []).some((p) => p.test(relPath));
        if (!isAllowed) {
          findings.push({
            file: relPath,
            line: getLineNumber(source, match.index),
            rule: rule.name,
            message: rule.message,
          });
        }
        match = rule.regex.exec(source);
      }
    }
  }

  if (findings.length > 0) {
    console.error(`[security-audit] FAIL - ${findings.length} issues found:`);
    for (const f of findings) {
      console.error(`  ${f.file}:${f.line} [${f.rule}] ${f.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`[security-audit] PASS (${files.length} files clean)`);
}

main().catch((err) => {
  console.error("[security-audit] Error:", err);
  process.exitCode = 1;
});
