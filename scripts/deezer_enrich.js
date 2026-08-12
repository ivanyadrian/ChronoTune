const fs = require('fs');
const path = require('path');

// Ellenőrizd az útvonalakat!
const INPUT_FILE = path.join(__dirname, '../backend/src/data/most_streamed_songs.json');
const OUTPUT_FILE = path.join(__dirname, '../backend/src/data/weekly_songs.json');
const CHECKPOINT_FILE = path.join(__dirname, '../backend/src/data/songs_checkpoint.json');

// --- Beállítások ---
const CONCURRENCY = 5;          // egyszerre ennyi dal feldolgozása (nem több!)
const CHECKPOINT_EVERY = 100;   // ennyi dalanként checkpoint mentés
const MAX_RETRIES = 4;          // hányszor próbálkozzon újra rate limit / hiba esetén
const RATE_LIMIT_RPS = 8;       // max kérés/másodperc (Deezer limit ~10, biztonsági margin)
// ------------------

// ---- Globális Rate Limiter (Token Bucket) ----
// Biztosítja, hogy összesen max RATE_LIMIT_RPS kérés menjen ki másodpercenként,
// függetlenül a párhuzamos workerek számától.
const rateLimiter = (() => {
    const intervalMs = 1000 / RATE_LIMIT_RPS;
    let lastCall = 0;
    const queue = [];
    let running = false;

    function tick() {
        if (queue.length === 0) { running = false; return; }
        const now = Date.now();
        const wait = Math.max(0, lastCall + intervalMs - now);
        setTimeout(() => {
            lastCall = Date.now();
            const resolve = queue.shift();
            resolve();
            tick();
        }, wait);
    }

    return () => new Promise(resolve => {
        queue.push(resolve);
        if (!running) { running = true; tick(); }
    });
})();

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function cleanTitle(title) {
    return title
        .replace(/\(.*?\)|\[.*?\]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function cleanArtist(artist) {
    return artist
        .split(',')[0]
        .trim()
        .toLowerCase();
}

// Fetch wrapper – retry logikával és 429 kezeléssel
async function fetchWithRetry(url, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        await rateLimiter(); // globális rate limit token várás

        try {
            const res = await fetch(url);

            if (res.status === 429) {
                const waitMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s
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
                await sleep(500 * (attempt + 1));
                continue;
            }
            return null;
        }
    }
    return null;
}

async function getDeezerData(artist, title) {
    const query = `artist:"${artist.split(',')[0]}" track:"${title.replace(/\(.*?\)|\[.*?\]/g, '').trim()}"`;
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;

    const data = await fetchWithRetry(url);
    if (!data || !data.data || data.data.length === 0) return { status: 'not_found' };

    const track = data.data[0];
    if (!track.preview) return { status: 'no_preview' };

    const trackData = await fetchWithRetry(`https://api.deezer.com/track/${track.id}`);
    if (!trackData || !trackData.release_date) return { status: 'no_date' };

    return {
        status: 'ok',
        deezerId: track.id.toString(),
        preview: track.preview,
        fullDate: trackData.release_date,
        cover: trackData.album?.cover_big ?? null,
    };
}

// Párhuzamos feldolgozó pool
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

async function start() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('❌ Hiányzik az input fájl:', INPUT_FILE);
        return;
    }

    const songs = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`📂 ${songs.length} dal betöltve.`);

    // Resume támogatás
    let finalSongs = [];
    const seenIds = new Set();
    const seenTracks = new Set();
    let startFrom = 0;

    if (fs.existsSync(CHECKPOINT_FILE)) {
        try {
            const checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
            finalSongs = checkpoint.songs ?? [];
            startFrom = checkpoint.processedUpTo ?? 0;

            for (const s of finalSongs) {
                seenIds.add(s.deezerId);
                seenTracks.add(`${cleanArtist(s.artist)}|${cleanTitle(s.title)}`);
            }

            console.log(`♻️  Checkpoint: folytatás a(z) ${startFrom}. daltól (${finalSongs.length} már megvan)`);
        } catch {
            console.warn('⚠️  Checkpoint olvasási hiba – elölről indul.');
            startFrom = 0;
        }
    }

    const remaining = songs.slice(startFrom);
    console.log(`🚀 Feldolgozás: ${remaining.length} dal, ${CONCURRENCY} párhuzamos worker, max ${RATE_LIMIT_RPS} req/s\n`);

    let processed = 0;
    let added = 0;
    let skipped = 0;
    const startTime = Date.now();

    // Stats: miért lett kihagyva
    const skipReasons = { not_found: 0, no_preview: 0, no_date: 0, dup_id: 0, dup_track: 0 };

    async function handleSong(s, localIdx) {
        const globalIdx = startFrom + localIdx;
        const label = `[${globalIdx + 1}/${songs.length}] ${s.artist} - ${s.title}`;

        const result = await getDeezerData(s.artist, s.title);

        if (result.status !== 'ok') {
            console.log(`❌ ${label} → ${result.status}`);
            skipReasons[result.status] = (skipReasons[result.status] ?? 0) + 1;
            skipped++;
        } else if (seenIds.has(result.deezerId)) {
            console.log(`⚠️  ${label} → dup_id`);
            skipReasons.dup_id++;
            skipped++;
        } else {
            const key = `${cleanArtist(s.artist)}|${cleanTitle(s.title)}`;
            if (seenTracks.has(key)) {
                console.log(`⚠️  ${label} → dup_track`);
                skipReasons.dup_track++;
                skipped++;
            } else {
                seenIds.add(result.deezerId);
                seenTracks.add(key);

                const [year, month, day] = result.fullDate.split('-').map(Number);

                finalSongs.push({
                    id: finalSongs.length,
                    artist: s.artist,
                    title: s.title,
                    deezerId: result.deezerId,
                    preview: result.preview,
                    cover: result.cover,
                    fullDate: result.fullDate,
                    year,
                    month,
                    day,
                });

                console.log(`✅ ${label} → OK (ID: ${result.deezerId})`);
                added++;
            }
        }

        processed++;

        // Checkpoint mentés
        if (processed % CHECKPOINT_EVERY === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = (processed / elapsed).toFixed(1);
            const eta = ((remaining.length - processed) / rate).toFixed(0);
            console.log(`\n📊 ${startFrom + processed}/${songs.length} | ✅ ${finalSongs.length} megvan | ⏱ ${rate} dal/s | ETA: ~${eta}s`);
            console.log(`   Kihagyva: nem_található=${skipReasons.not_found} | nincs_preview=${skipReasons.no_preview} | duplikátum=${skipReasons.dup_id + skipReasons.dup_track}\n`);

            fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({
                processedUpTo: startFrom + processed,
                songs: finalSongs,
            }, null, 2), 'utf8');
        }
    }

    await processWithConcurrency(remaining, handleSong, CONCURRENCY);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalSongs, null, 2), 'utf8');

    if (fs.existsSync(CHECKPOINT_FILE)) fs.unlinkSync(CHECKPOINT_FILE);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Kész! ${finalSongs.length} egyedi dal mentve → ${OUTPUT_FILE}`);
    console.log(`⏱️  Idő: ${totalTime}s | Kihagyva összesen: ${skipped}`);
    console.log(`   Okok: nem_találva=${skipReasons.not_found} | nincs_preview=${skipReasons.no_preview} | nincs_dátum=${skipReasons.no_date} | duplikátum=${skipReasons.dup_id + skipReasons.dup_track}`);
}

start();