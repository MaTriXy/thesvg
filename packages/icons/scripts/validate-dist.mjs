#!/usr/bin/env node

/**
 * Pre-publish validation for @thesvg/icons.
 * Checks: file count, bundle budget, required files, import sanity.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");

// Budget: warn if total dist exceeds 50MB (icon strings are large)
const BUDGET_WARN_MB = 50;
const BUDGET_FAIL_MB = 100;

async function main() {
  const errors = [];
  const warnings = [];

  // 1. Check required files exist
  const required = ["LICENSE", "README.md", "package.json"];
  for (const file of required) {
    try {
      await fs.access(path.join(ROOT, file));
    } catch {
      errors.push(`Missing required file: ${file}`);
    }
  }

  // 2. Check dist exists and has files
  let distFiles;
  try {
    distFiles = await fs.readdir(DIST);
  } catch {
    errors.push("dist/ directory not found. Run build first.");
    report(errors, warnings);
    return;
  }

  const jsFiles = distFiles.filter((f) => f.endsWith(".js"));
  const cjsFiles = distFiles.filter((f) => f.endsWith(".cjs"));
  const dtsFiles = distFiles.filter((f) => f.endsWith(".d.ts"));

  // Should have index + types + per-icon files
  if (jsFiles.length < 100) {
    errors.push(`Too few ESM files: ${jsFiles.length} (expected 3000+)`);
  }
  if (cjsFiles.length < 100) {
    errors.push(`Too few CJS files: ${cjsFiles.length} (expected 3000+)`);
  }
  if (dtsFiles.length < 100) {
    errors.push(`Too few DTS files: ${dtsFiles.length} (expected 3000+)`);
  }

  // ESM and CJS counts should match
  if (jsFiles.length !== cjsFiles.length) {
    warnings.push(
      `ESM/CJS mismatch: ${jsFiles.length} .js vs ${cjsFiles.length} .cjs`,
    );
  }

  // 3. Check barrel files exist
  const barrels = ["index.js", "index.cjs", "index.d.ts", "types.d.ts"];
  for (const barrel of barrels) {
    if (!distFiles.includes(barrel)) {
      errors.push(`Missing barrel: dist/${barrel}`);
    }
  }

  // 4. Bundle budget
  let totalSize = 0;
  for (const file of distFiles) {
    const stat = await fs.stat(path.join(DIST, file));
    totalSize += stat.size;
  }
  const sizeMB = totalSize / 1024 / 1024;

  if (sizeMB > BUDGET_FAIL_MB) {
    errors.push(`Bundle too large: ${sizeMB.toFixed(1)}MB (max ${BUDGET_FAIL_MB}MB)`);
  } else if (sizeMB > BUDGET_WARN_MB) {
    warnings.push(`Bundle size: ${sizeMB.toFixed(1)}MB (budget: ${BUDGET_WARN_MB}MB)`);
  }

  // 5. Spot check: import well-known icons to verify modules work
  const sampleNames = ["github.js", "google.js", "vercel.js", "apple.js"];
  const candidates = sampleNames.filter((n) => jsFiles.includes(n));
  // Fallback to first non-barrel if none of the well-known names exist
  if (candidates.length === 0) {
    const fallback = jsFiles.find((f) => f !== "index.js" && f !== "types.js");
    if (fallback) candidates.push(fallback);
  }
  for (const sampleIcon of candidates) {
    try {
      const mod = await import(path.join(DIST, sampleIcon));
      if (!mod.slug || !mod.title) {
        errors.push(`Sample icon ${sampleIcon} missing required exports (slug/title)`);
      }
    } catch (err) {
      errors.push(`Sample icon ${sampleIcon} failed to import: ${err.message}`);
    }
  }

  // 6. Check package.json exports
  const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
  if (!pkg.exports) {
    errors.push("package.json missing exports field");
  }
  if (pkg.sideEffects !== false) {
    warnings.push("package.json sideEffects should be false for tree-shaking");
  }

  report(errors, warnings);

  console.log(`\nStats:`);
  console.log(`  ESM files:  ${jsFiles.length}`);
  console.log(`  CJS files:  ${cjsFiles.length}`);
  console.log(`  DTS files:  ${dtsFiles.length}`);
  console.log(`  Total size: ${sizeMB.toFixed(1)}MB`);
}

function report(errors, warnings) {
  if (warnings.length > 0) {
    console.warn(`\n[validate] Warnings:`);
    for (const w of warnings) console.warn(`  - ${w}`);
  }

  if (errors.length > 0) {
    console.error(`\n[validate] FAIL - ${errors.length} errors:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  console.log(`\n[validate] PASS`);
}

main().catch((err) => {
  console.error("[validate] Error:", err);
  process.exitCode = 1;
});
