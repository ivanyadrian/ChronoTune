const fs = require('fs');
const path = require('path');

// Ellenőrizd az útvonalakat!
const INPUT_FILE = path.join(__dirname, '../backend/src/data/spotify_export.json');
const OUTPUT_FILE = path.join(__dirname, '../backend/src/data/songs.ts');

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

async function getDeezerData(artist, title) {
    const query = `artist:"${artist.split(',')[0]}" track:"${title.replace(/\(.*?\)|\[.*?\]/g, '').trim()}"`;
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.data || data.data.length === 0) return null;

        // Legrelevánsabb találat
        const track = data.data[0];

        const trackRes = await fetch(`https://api.deezer.com/track/${track.id}`);
        const trackData = await trackRes.json();

        return {
            deezerId: track.id.toString(),
            fullDate: trackData.release_date,
            cover: trackData.album.cover_big,
        };
    } catch (e) {
        return null;
    }
}

async function start() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error("Hiányzik az input fájl!");
        return;
    }

    const songs = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

    const finalSongs = [];

    // Duplikátum ellenőrzés
    const seenIds = new Set();
    const seenTracks = new Set();

    console.log(`Adatgyűjtés indítása...`);

    for (let i = 0; i < songs.length; i++) {
        const s = songs[i];

        process.stdout.write(`🎵 [${i + 1}/${songs.length}] ${s.artist} - ${s.title}... `);

        const details = await getDeezerData(s.artist, s.title);

        if (!details || !details.deezerId) {
            console.log("❌ Kihagyva (nincs találat)");
            await new Promise(r => setTimeout(r, 200));
            continue;
        }

        // Deezer ID alapján
        if (seenIds.has(details.deezerId)) {
            console.log(`⚠️ Duplikátum (Deezer ID: ${details.deezerId})`);
            await new Promise(r => setTimeout(r, 200));
            continue;
        }

        // Előadó + cím alapján
        const key = `${cleanArtist(s.artist)}|${cleanTitle(s.title)}`;

        if (seenTracks.has(key)) {
            console.log("⚠️ Duplikátum (előadó + cím)");
            await new Promise(r => setTimeout(r, 200));
            continue;
        }

        seenIds.add(details.deezerId);
        seenTracks.add(key);

        const [year, month, day] = details.fullDate.split('-').map(Number);

        finalSongs.push({
            id: finalSongs.length,
            artist: s.artist,
            title: s.title,
            deezerId: details.deezerId,
            cover: details.cover,
            fullDate: details.fullDate,
            year,
            month,
            day
        });

        console.log(`✅ Megvan (ID: ${details.deezerId})`);

        // Deezer rate limit elkerülése
        await new Promise(r => setTimeout(r, 200));
    }

    const fileContent = `export const songs = ${JSON.stringify(finalSongs, null, 2)};`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);

    console.log(`\n✅ Kész! ${finalSongs.length} egyedi dal mentve.`);
}

start();