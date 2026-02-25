const fs = require('fs');
const path = require('path');

// Ellenőrizd az útvonalakat!
const INPUT_FILE = path.join(__dirname, '../backend/src/data/spotify_export.json');
const OUTPUT_FILE = path.join(__dirname, '../backend/src/data/songs.ts');

async function getDeezerData(artist, title) {
    const cleanTitle = title.replace(/\(.*?\)|\[.*?\]/g, '').trim();
    const query = `artist:"${artist.split(',')[0]}" track:"${cleanTitle}"`;
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.data || data.data.length === 0) return null;

        // Kiválasztjuk a legrelevánsabb találatot
        const track = data.data[0];
        
        // Itt nem hívunk be a /track/{id} végpontra, mert a search megadja az ID-t, a dátumot és a borítót is.
        const trackRes = await fetch(`https://api.deezer.com/track/${track.id}`);
        const trackData = await trackRes.json();

        return {
            deezerId: track.id.toString(),    // A stabil ID
            fullDate: trackData.release_date, // Megbízható dátum a track adatlapról
            cover: trackData.album.cover_big, // Borító
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

    console.log(`Adatgyűjtés indítása...`);

    for (let i = 0; i < songs.length; i++) {
        const s = songs[i];
        process.stdout.write(`🎵 [${i + 1}/${songs.length}] ${s.artist} - ${s.title}... `);

        const details = await getDeezerData(s.artist, s.title);

        if (details && details.deezerId) {
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
        } else {
            console.log(`❌ Kihagyva (nincs találat)`);
        }
        
        // Deezer rate limit elkerülése
        await new Promise(r => setTimeout(r, 200));
    }

    const fileContent = `export const songs = ${JSON.stringify(finalSongs, null, 2)};`;
    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`\n Kész! ${finalSongs.length} dal mentve.`);
}

start();