/**
 * Backfill dateAdded field for all icons in icons.json using git history.
 *
 * For each icon slug, finds the earliest commit that added files to
 * public/icons/{slug}/ and uses that commit date as dateAdded.
 *
 * Usage: npx tsx scripts/backfill-dates.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(__dirname, "..");
const ICONS_JSON = path.join(ROOT, "src/data/icons.json");

interface IconEntry {
  slug: string;
  title: string;
  dateAdded?: string;
  [key: string]: unknown;
}

function getFirstCommitDates(): Map<string, string> {
  const slugDates = new Map<string, string>();

  // Get all file additions in public/icons/ with commit dates.
  // git log outputs newest-first, so we keep overwriting to end up with
  // the earliest (oldest) date per slug.
  const raw = execSync(
    `git log --all --diff-filter=A --format="COMMIT:%aI" --name-only -- "public/icons/"`,
    { cwd: ROOT, encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }
  );

  let currentDate = "";

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("COMMIT:")) {
      currentDate = trimmed.slice(7, 17); // YYYY-MM-DD
    } else if (trimmed.startsWith("public/icons/") && currentDate) {
      const parts = trimmed.split("/");
      if (parts.length >= 4) {
        const slug = parts[2];
        // Overwrite: since log is newest-first, last write = earliest date
        slugDates.set(slug, currentDate);
      }
    }
  }

  return slugDates;
}

function main() {
  console.log("Loading icons.json...");
  const icons: IconEntry[] = JSON.parse(fs.readFileSync(ICONS_JSON, "utf-8"));
  console.log(`Found ${icons.length} icons`);

  console.log("Extracting git history...");
  const slugDates = getFirstCommitDates();
  console.log(`Found dates for ${slugDates.size} slugs from git`);

  const today = new Date().toISOString().slice(0, 10);
  let backfilled = 0;
  let missing = 0;

  for (const icon of icons) {
    const date = slugDates.get(icon.slug);
    if (date) {
      icon.dateAdded = date;
      backfilled++;
    } else {
      // No git history found - use today as fallback
      icon.dateAdded = today;
      missing++;
      console.log(`  No git history for "${icon.slug}", using ${today}`);
    }
  }

  console.log(`\nBackfilled: ${backfilled}`);
  if (missing > 0) {
    console.log(`No history (using today): ${missing}`);
  }

  // Show 10 most recent
  const sorted = [...icons]
    .filter((i) => i.dateAdded)
    .sort((a, b) => (b.dateAdded as string).localeCompare(a.dateAdded as string));

  console.log("\nMost recently added:");
  for (const icon of sorted.slice(0, 10)) {
    console.log(`  ${icon.dateAdded}  ${icon.title}`);
  }

  fs.writeFileSync(ICONS_JSON, JSON.stringify(icons, null, 2) + "\n");
  console.log("\nWrote updated icons.json");
}

main();
