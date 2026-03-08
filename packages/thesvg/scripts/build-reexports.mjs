#!/usr/bin/env node

/**
 * Generate re-export modules that proxy @the-svg/icons.
 * This lets `import x from "thesvg/github"` work by re-exporting
 * from `@the-svg/icons/github`.
 */

import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const ICONS_DIST = resolve(ROOT, "../icons/dist");

mkdirSync(DIST, { recursive: true });

// Get all icon slugs from the @the-svg/icons dist
const jsFiles = readdirSync(ICONS_DIST)
  .filter((f) => f.endsWith(".js") && f !== "index.js" && f !== "types.js");

let count = 0;

for (const file of jsFiles) {
  const slug = file.replace(".js", "");

  // ESM re-export
  writeFileSync(
    join(DIST, `${slug}.js`),
    `export * from "@the-svg/icons/${slug}";\nexport { default } from "@the-svg/icons/${slug}";\n`,
  );

  // CJS re-export
  writeFileSync(
    join(DIST, `${slug}.cjs`),
    `"use strict";\nmodule.exports = require("@the-svg/icons/${slug}");\n`,
  );

  // DTS re-export
  writeFileSync(
    join(DIST, `${slug}.d.ts`),
    `export * from "@the-svg/icons/${slug}";\nexport { default } from "@the-svg/icons/${slug}";\n`,
  );

  count++;
}

// Barrel re-exports
writeFileSync(
  join(DIST, "index.js"),
  `export * from "@the-svg/icons";\n`,
);
writeFileSync(
  join(DIST, "index.cjs"),
  `"use strict";\nmodule.exports = require("@the-svg/icons");\n`,
);
writeFileSync(
  join(DIST, "index.d.ts"),
  `export * from "@the-svg/icons";\n`,
);

// Types re-export
writeFileSync(
  join(DIST, "types.d.ts"),
  `export type { IconModule, IconVariants } from "@the-svg/icons";\n`,
);

console.log(`Built ${count} re-export modules.`);
