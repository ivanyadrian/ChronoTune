#!/usr/bin/env node

/**
 * count_by_year.js
 * ---------------------------------------------------------------------
 * Analyzes track distribution by release year in a song dataset.
 *
 * Usage:
 *   node scripts/count_by_year.js [path/to/dataset.json]
 * Example:
 *   node scripts/count_by_year.js backend/src/data/en_songs.json
 * ---------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

// Dataset file can be passed as an argument; defaults to en_songs.json
const arg = process.argv[2];
const FILE = arg
  ? path.resolve(arg)
  : path.join(__dirname, "../backend/src/data/en_songs.json");

if (!fs.existsSync(FILE)) {
  console.error(`Error: File not found: ${FILE}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));

// Aggregate track counts by release year
const counts = {};
for (const song of data) {
  // Supports both raw exports (release_year) and normalized catalogs (year)
  const year = song.release_year ?? song.year ?? "Unknown";
  counts[year] = (counts[year] ?? 0) + 1;
}

// Sort chronologically ascending
const sorted = Object.keys(counts)
  .sort((a, b) => Number(a) - Number(b))
  .map((year) => ({ year, count: counts[year] }));

const maxCount = Math.max(...sorted.map((r) => r.count));
const barWidth = 40;
const fileName = path.basename(FILE);

console.log(`\nTrack count by release year - ${fileName}\n`);
console.log(`${"Year".padEnd(8)} ${"Count".padStart(6)}  Distribution`);
console.log("─".repeat(60));

for (const { year, count } of sorted) {
  const bar = "█".repeat(Math.round((count / maxCount) * barWidth));
  console.log(`${String(year).padEnd(8)} ${String(count).padStart(6)}  ${bar}`);
}

console.log("─".repeat(60));
console.log(`${"TOTAL".padEnd(8)} ${String(data.length).padStart(6)}`);
