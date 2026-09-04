#!/usr/bin/env node

/**
 * count_by_artist.js
 * ---------------------------------------------------------------------
 * Analyzes track distribution by artist in a song dataset.
 *
 * Usage:
 *   node scripts/count_by_artist.js [path/to/dataset.json]
 * Example:
 *   node scripts/count_by_artist.js backend/src/data/en_songs.json
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

// Aggregate track count by artist
const counts = {};
for (const song of data) {
  const artist = song.artist ?? song.artist_name ?? "Unknown";
  counts[artist] = (counts[artist] ?? 0) + 1;
}

// Sort artists descending by track count
const sorted = Object.keys(counts)
  .sort((a, b) => counts[b] - counts[a])
  .map((artist) => ({ artist, count: counts[artist] }));

const maxCount = Math.max(...sorted.map((r) => r.count));
const barWidth = 40;
const fileName = path.basename(FILE);

console.log(`\nTrack count by artist - ${fileName}\n`);
console.log(`${"Artist".padEnd(35)} ${"Count".padStart(6)}  Distribution`);
console.log("─".repeat(80));

for (const { artist, count } of sorted) {
  const bar = "█".repeat(Math.round((count / maxCount) * barWidth));
  // Truncate long artist names to maintain table alignment
  const shortArtist =
    artist.length > 33 ? artist.substring(0, 30) + "..." : artist;
  console.log(`${shortArtist.padEnd(35)} ${String(count).padStart(6)}  ${bar}`);
}

console.log("─".repeat(80));
console.log(
  `${"TOTAL (All tracks)".padEnd(35)} ${String(data.length).padStart(6)}`,
);
