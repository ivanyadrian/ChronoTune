/**
 * filter_covers.js
 * ---------------------------------------------------------------------
 * Iterates through a song catalog (e.g. en_songs.json) and filters out
 * non-original recordings (covers, tributes, and re-recordings).
 *
 * Workflow:
 *  1. Fetches Deezer metadata for each track via /track/{id}
 *  2. Compares the Deezer artist name against the expected catalog artist
 *  3. If there is a mismatch (cover suspected), searches for the original recording
 *  4. Outputs three files:
 *     - en_songs_cleaned.json  -> Cleaned catalog containing only verified tracks
 *     - cover_report.json      -> Detailed diagnostic report of replaced/dropped tracks
 *     - cover_checkpoint.json  -> Resumable state checkpoint
 *
 * Usage:
 *   node scripts/filter_covers.js
 * ---------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

// File paths
const INPUT_FILE = path.join(__dirname, "../backend/src/data/en_songs.json");
const OUTPUT_CLEAN = path.join(
  __dirname,
  "../backend/src/data/en_songs_cleaned.json",
);
const OUTPUT_REPORT = path.join(
  __dirname,
  "../backend/src/data/cover_report.json",
);
const CHECKPOINT_FILE = path.join(
  __dirname,
  "../backend/src/data/cover_checkpoint.json",
);

// Pipeline configuration
const CONCURRENCY = 5; // Concurrent API requests
const CHECKPOINT_EVERY = 200; // Save checkpoint every N tracks
const MAX_RETRIES = 4; // Maximum retry attempts for API errors
const RATE_LIMIT_RPS = 8; // Max requests per second (Deezer limit ~10 req/s)

// Similarity threshold: similarity >= threshold is considered a valid match
// (handles casing and minor naming differences: "TOTO" vs "Toto", "a-ha" vs "A-Ha", etc.)
const ARTIST_MATCH_THRESHOLD = 0.6;

/**
 * Global Rate Limiter (Token Bucket)
 */
const rateLimiter = (() => {
  const intervalMs = 1000 / RATE_LIMIT_RPS;
  let lastCall = 0;
  const queue = [];
  let running = false;

  function tick() {
    if (queue.length === 0) {
      running = false;
      return;
    }
    const now = Date.now();
    const wait = Math.max(0, lastCall + intervalMs - now);
    setTimeout(() => {
      lastCall = Date.now();
      const resolve = queue.shift();
      resolve();
      tick();
    }, wait);
  }

  return () =>
    new Promise((resolve) => {
      queue.push(resolve);
      if (!running) {
        running = true;
        tick();
      }
    });
})();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------
// Text Normalization & String Similarity
// ---------------------------------------------------------------------

/**
 * Normalizes artist name for fuzzy comparison:
 * - Lowercase
 * - Strips feat/ft/vs tokens
 * - Strips special characters
 * - Collapses consecutive whitespace
 */
function normalizeArtist(name) {
  return name
    .toLowerCase()
    .replace(/\bfeat\.?|ft\.?|vs\.?/gi, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes word-level Jaccard similarity coefficient (range: 0 to 1).
 */
function jaccardSimilarity(a, b) {
  const setA = new Set(a.split(" ").filter(Boolean));
  const setB = new Set(b.split(" ").filter(Boolean));
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

/**
 * Validates whether the actual artist matches the expected catalog artist.
 * Returns true if:
 *  - Exact match after normalization, or
 *  - Substring match in either direction, or
 *  - First word match with length > 2 (e.g. "Rick Astley" vs "Rick Astley & The Band"), or
 *  - Jaccard similarity >= ARTIST_MATCH_THRESHOLD
 */
function artistMatches(expected, actual) {
  const normExpected = normalizeArtist(expected);
  const normActual = normalizeArtist(actual);

  if (normExpected === normActual) return true;
  if (normActual.includes(normExpected) || normExpected.includes(normActual))
    return true;

  const firstWordExpected = normExpected.split(" ")[0];
  const firstWordActual = normActual.split(" ")[0];
  if (firstWordExpected.length > 2 && firstWordExpected === firstWordActual)
    return true;

  const similarity = jaccardSimilarity(normExpected, normActual);
  return similarity >= ARTIST_MATCH_THRESHOLD;
}

// ---------------------------------------------------------------------
// Deezer API Integration
// ---------------------------------------------------------------------

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    await rateLimiter();
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const waitMs = Math.pow(2, attempt) * 1500;
        if (attempt < retries) {
          await sleep(waitMs);
          continue;
        }
        return null;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      if (attempt < retries) {
        await sleep(600 * (attempt + 1));
        continue;
      }
      return null;
    }
  }
  return null;
}

/**
 * Fetches track metadata by Deezer ID.
 */
async function getTrackInfo(deezerId) {
  const data = await fetchWithRetry(`https://api.deezer.com/track/${deezerId}`);
  if (!data || data.error) return null;

  return {
    deezerArtist: data.artist?.name ?? "",
    deezerTrackTitle: data.title ?? "",
    releaseDate: data.release_date ?? null,
    albumTitle: data.album?.title ?? "",
    albumId: data.album?.id ?? null,
  };
}

/**
 * Attempts to locate the original recording by querying Deezer for the expected artist.
 */
async function findOriginalTrack(expectedArtist, title) {
  const cleanTitle = title.replace(/\(.*?\)|\[.*?\]/g, "").trim();
  const mainArtist = expectedArtist.split(",")[0].trim();
  const query = `artist:"${mainArtist}" track:"${cleanTitle}"`;
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`;

  const data = await fetchWithRetry(url);
  if (!data?.data?.length) return null;

  for (const track of data.data) {
    if (!track.preview) continue;
    if (!artistMatches(expectedArtist, track.artist?.name ?? "")) continue;

    // Fetch detailed metadata to obtain release date
    const detail = await fetchWithRetry(
      `https://api.deezer.com/track/${track.id}`,
    );
    if (!detail?.release_date) continue;

    return {
      deezerId: track.id.toString(),
      preview: track.preview,
      cover: detail.album?.cover_big ?? null,
      fullDate: detail.release_date,
    };
  }

  return null;
}

// ---------------------------------------------------------------------
// Worker Pool & Checkpoint I/O
// ---------------------------------------------------------------------

async function processWithConcurrency(items, handler, concurrency) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      await handler(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

function saveCheckpoint(data) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 2), "utf8");
}

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf8"));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------
// Main Pipeline Execution
// ---------------------------------------------------------------------

async function start() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error("[Cover Filter] Error: Input file not found:", INPUT_FILE);
    return;
  }

  const allSongs = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  console.log(
    `[Cover Filter] Loaded ${allSongs.length} tracks from ${INPUT_FILE}\n`,
  );

  // Checkpoint restore support
  let startFrom = 0;
  let cleanSongs = [];
  let reportItems = [];

  const checkpoint = loadCheckpoint();
  if (checkpoint) {
    startFrom = checkpoint.processedUpTo ?? 0;
    cleanSongs = checkpoint.cleanSongs ?? [];
    reportItems = checkpoint.reportItems ?? [];
    console.log(
      `[Cover Filter] Checkpoint restored: Resuming from track ${startFrom} (${cleanSongs.length} clean, ${reportItems.length} report entries so far)\n`,
    );
  }

  const remaining = allSongs.slice(startFrom);
  console.log(
    `[Cover Filter] Processing ${remaining.length} tracks with ${CONCURRENCY} workers (rate limit: ${RATE_LIMIT_RPS} req/s)...\n`,
  );
  console.log("─".repeat(80));

  let processed = 0;
  const stats = {
    original: 0, // Original recording verified, kept
    coverFixed: 0, // Cover detected, replaced with verified original
    coverDropped: 0, // Cover detected, no original found, removed
    apiError: 0, // Transient API error, kept for safety
  };

  const startTime = Date.now();

  async function handleSong(song, localIdx) {
    const globalIdx = startFrom + localIdx;
    const label = `[${globalIdx + 1}/${allSongs.length}] ${song.artist} - "${song.title}"`;

    // 1. Fetch current Deezer track metadata
    const trackInfo = await getTrackInfo(song.deezerId);

    if (!trackInfo) {
      // API error -> preserve track conservatively
      console.log(`[Warning] ${label} -> API error, preserved`);
      cleanSongs.push({ ...song, _note: "api_error_kept" });
      reportItems.push({ ...song, verdict: "api_error", action: "kept" });
      stats.apiError++;
    } else if (artistMatches(song.artist, trackInfo.deezerArtist)) {
      // Artist verified -> original recording
      console.log(
        `[Verified] ${label} -> Original (Deezer: "${trackInfo.deezerArtist}")`,
      );
      cleanSongs.push(song);
      stats.original++;
    } else {
      // Mismatch -> potential cover recording
      console.log(`[Mismatch] ${label}`);
      console.log(
        `   -> Expected: "${song.artist}" | Deezer: "${trackInfo.deezerArtist}"`,
      );

      // 2. Search for original release
      const original = await findOriginalTrack(song.artist, song.title);

      if (original) {
        const [year, month, day] = original.fullDate.split("-").map(Number);
        const fixedSong = {
          ...song,
          deezerId: original.deezerId,
          preview: original.preview,
          cover: original.cover,
          fullDate: original.fullDate,
          year,
          month,
          day,
          _note: "fixed_original_found",
        };
        cleanSongs.push(fixedSong);
        reportItems.push({
          originalSong: song,
          verdict: "cover_fixed",
          action: "replaced",
          deezerArtistWas: trackInfo.deezerArtist,
          newDeezerId: original.deezerId,
          newDate: original.fullDate,
        });
        console.log(
          `   -> Original found: ID ${original.deezerId} | Date: ${original.fullDate}`,
        );
        stats.coverFixed++;
      } else {
        // No original found -> discard track
        reportItems.push({
          originalSong: song,
          verdict: "cover_dropped",
          action: "removed",
          deezerArtistWas: trackInfo.deezerArtist,
          reason: "no_original_found",
        });
        console.log(`   -> No original found: Track removed`);
        stats.coverDropped++;
      }
    }

    processed++;

    // Periodic checkpoint save
    if (processed % CHECKPOINT_EVERY === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = (processed / elapsed).toFixed(1);
      const eta = ((remaining.length - processed) / parseFloat(rate)).toFixed(
        0,
      );

      console.log("\n" + "─".repeat(80));
      console.log(
        `[Progress] ${startFrom + processed}/${allSongs.length} tracks processed`,
      );
      console.log(
        `   Original: ${stats.original} | Fixed: ${stats.coverFixed} | Dropped: ${stats.coverDropped} | API Errors: ${stats.apiError}`,
      );
      console.log(`   Rate: ${rate} tracks/s | ETA: ~${eta}s`);
      console.log("─".repeat(80) + "\n");

      saveCheckpoint({
        processedUpTo: startFrom + processed,
        cleanSongs,
        reportItems,
      });
    }
  }

  await processWithConcurrency(remaining, handleSong, CONCURRENCY);

  // Re-index sequential ID field
  const reindexed = cleanSongs.map((s, i) => ({ ...s, id: i }));

  fs.writeFileSync(OUTPUT_CLEAN, JSON.stringify(reindexed, null, 2), "utf8");
  fs.writeFileSync(OUTPUT_REPORT, JSON.stringify(reportItems, null, 2), "utf8");

  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n" + "=".repeat(80));
  console.log("[Complete] Cover filtering and catalog clean-up finished.");
  console.log("=".repeat(80));
  console.log(`Output clean catalog:  ${OUTPUT_CLEAN}`);
  console.log(`Output report file:    ${OUTPUT_REPORT}`);
  console.log("");
  console.log(`Summary Statistics:`);
  console.log(`   Total input tracks:            ${allSongs.length}`);
  console.log(`   Original recordings:           ${stats.original}`);
  console.log(`   Fixed (cover -> original):     ${stats.coverFixed}`);
  console.log(`   Dropped covers:                ${stats.coverDropped}`);
  console.log(`   API errors (preserved):        ${stats.apiError}`);
  console.log(`   Final catalog track count:     ${reindexed.length}`);
  console.log(`   Execution time:                ${totalTime}s`);
  console.log("=".repeat(80));
}

start().catch((err) => {
  console.error("[Cover Filter] Fatal error:", err);
  process.exit(1);
});
