<div align="center">

# ChronoTune

**Valós idejű többjátékos zenei idővonal-építő játék a népszerű _Hitster_ társasjáték alapján.**

[![Élő játék](https://img.shields.io/badge/Próbáld_ki_élőben-chrono--tune.vercel.app-blueviolet?style=for-the-badge)](https://chrono-tune.vercel.app/)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[**English documentation**](README.md)

</div>

---

## A projekt célja & bemutatása

A **ChronoTune** egy full-stack, valós idejű webalkalmazás, amely bemutatja a modern webes technológiák gyakorlati alkalmazását, a skálázható architektúratervezést és a valós idejű állapotkezelést.

A játékot a nagy sikerű **Hitster** kártyajáték inspirálta: a játékosok belehallgatnak a zenékbe, és a feladatuk az, hogy kronológiai sorrendbe rendezzék a dalokat a saját idővonalukon (timeline), anélkül, hogy előre látnák a megjelenési évet. A projekt egyesíti az élő audió streaminget, a szoba-alapú valós idejű multiplayer szinkronizációt, valamint egy ütemezett, csalásbiztos heti kihívást globális ranglétrával.

---

## Főbb funkciók

- **Valós idejű többjátékos (Multiplayer) & Egyéni (Solo) szobák:**
  - Azonnali szobakészítés és csatlakozás szobakóddal vagy vágólapra másolható linkkel.
  - Rugalmas játékszabályok: cél-idővonal hossza, megengedett hibák száma, zenei szinkronizáció és dalcsomag kiválasztása (magyar vagy nemzetközi slágerek).
- **Hitster-stílusú játékmenet:**
  - Körökre osztott logika 30 másodperces szinkronizált zenei előnézetekkel.
  - Interaktív kártyaelhelyezés az idővonalra, azonnali ellenőrzéssel és leleplező animációval (évszám, pontos dátum, előadó, albumborító).
  - Nyerési/vesztési szériák (streaks), hibaszámláló és játékvége állapotok.
- **Heti Kihívás (Weekly Challenge - Solo aszinkron játékmód):**
  - Gondosan összeállított 20 számos heti kihívás, amely minden szerdán 12:00-kor (Budapest időzóna szerint) automatikusan rotálódik a háttérben.
  - Globális ranglista (Leaderboard) helyes elhelyezések, hibák száma és eltelt idő alapján.
  - Munkamenet-token (session token) védelem és több böngészőfüles csalásmegelőzés.
- **Kétnyelvű kezelőfelület (i18n):**
  - Zökkenőmentes, azonnali váltás a magyar és az angol nyelv között.
- **Kiterjedt zenei adatbázis:**
  - Több ezer feldolgozott magyar és nemzetközi zeneszám saját adatbővítő pipeline-nal.

---

## Technikai részletek és megvalósítás

### 1. Valós idejű szobakezelés és játékmenet (Socket.io)

- A többjátékos szobák állapota (játékosok paklijai, idősávok, körváltások és audió állapot) eseményvezérelten, valós időben szinkronizálódik a kliensek között.
- A kód átláthatósága érdekében a lobbi-kezelés (`roomHandler.ts`) és a játéklogika (`gameHandler.ts`) különválasztott modulokban kapott helyet.

### 2. Deezer API proxy és automata zenei fallback

- A böngészős CORS korlátok és a stabil elérés érdekében a kliens kérései egy szerveroldali Express proxy-n keresztül futnak (`/api/deezer-proxy/:trackId`).
- **Automata fallback keresés:** Ha egy dal 30 másodperces előnézeti audió linkje nem elérhető vagy lejárt a Deezeren, a proxy automatikusan rákeres az előadó és számcím alapján egy működő kiadásra, így a játékmenet nem akad meg.

### 3. Heti kihívás és ranglista (Csalásvédelem & Ütemezés)

- **Ütemezett rotáció:** A kihívás dalkészlete minden szerdán 12:00-kor (Budapest időzóna szerint) automatikusan frissül a `node-cron` segítségével.
- **Azonosítás és verseny tisztaság:** Kötelező regisztráció helyett böngésző ujjlenyomat (`@fingerprintjs/fingerprintjs`) azonosítja a játékosokat. A futamok egyedi szerveroldali `sessionToken`-t kapnak, kizárva a több lapon párhuzamosan megnyitott csalási kísérleteket.
- **Optimalizált lekérdezések:** A ranglista gyors megjelenítését összetett MongoDB indexek (`weekIdentifier`, `correctPlacements`, `timeInSeconds`) biztosítják.

### 4. Adatelőkészítés és tisztítás (`scripts/`)

- A daltárak összeállítását és szűrését önálló Node.js segédprogramok végzik:
  - `spotify_exporter.js`: Lejátszási listák kinyerése.
  - `deezer_enrich.js`: Deezer azonosítók, borítóképek, megjelenési dátumok és előnézetek csatolása.
  - `filter_covers.js`: Feldolgozások, tribute verziók és élő felvételek kiszűrése.
  - `count_by_year.js` & `count_by_artist.js`: Évtizedes és előadói eloszlások ellenőrzése a kiegyensúlyozott játékélményért.

---

## Alkalmazott technológiák

### Frontend

- **Keretrendszer & Nyelv:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Stílus:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Valós idejű kommunikáció:** [Socket.io Client](https://socket.io/docs/v4/client-api/)
- **Ikonok & UI:** [Lucide React](https://lucide.dev/)
- **Audió:** Deezer 30 mp-es audió előnézetek (HTML5 Audio API)
- **Egyéb:** `@fingerprintjs/fingerprintjs`, `react-copy-to-clipboard`

### Backend

- **Környezet & Keretrendszer:** [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **WebSockets:** [Socket.io](https://socket.io/)
- **Adatbázis & ORM/ODM:** [MongoDB Atlas](https://www.mongodb.com/atlas), [Mongoose](https://mongoosejs.com/)
- **Ütemezés:** [node-cron](https://github.com/node-cron/node-cron)
- **Dátumkezelés:** [Day.js](https://day.js.org/)

---

## Mappastruktúra

```text
ChronoTune/
├── backend/
│   ├── src/
│   │   ├── constants/       # Játékbeállítási konstansok és lejátszási állapotok
│   │   ├── data/            # Előre feldolgozott dalkatalógusok (en, hu, weekly)
│   │   ├── handlers/        # Socket.io handlerek (roomHandler, gameHandler)
│   │   ├── routes/          # REST végpontok (Deezer proxy, weekly challenge)
│   │   ├── services/        # Üzleti logika (weekly challenge rotáció & állapot)
│   │   ├── utils/           # Segédfüggvények (shuffle, tömbfunkciók)
│   │   ├── db.ts            # Mongoose sémák, modellek és MongoDB kapcsolat
│   │   ├── types.ts         # Megosztott TypeScript interfészek (Room, Player, Song)
│   │   └── index.ts         # Express & Socket.io szerver belépési pont
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Újrafelhasználható komponensek (Modálok, Ikonok, Fejléc)
│   │   ├── context/         # React Context-ek (Nyelvválasztó, Játékállapot)
│   │   ├── hooks/           # Egyedi React hook-ok
│   │   ├── i18n/            # Fordítási szótárak (HU / EN)
│   │   ├── views/           # Játék nézetek (GameBoard, Lobby, Menu, WeeklyChallenge)
│   │   ├── App.tsx          # Fő routing és eseménykezelők
│   │   └── main.tsx         # Kliens belépési pont
│   └── package.json
├── scripts/                 # Adatkinyerő és -tisztító scriptek
└── package.json             # Gyökér szkriptek (monorepo vezérlés)
```

---

## Telepítés és helyi futtatás

### Előfeltételek

- [Node.js](https://nodejs.org/) (legalább v18 ajánlott)
- Egy elérhető [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) adatbázis (vagy helyi MongoDB)

### 1. Repository klónozása

```bash
git clone https://github.com/ivanyadrian/ChronoTune.git
cd ChronoTune
```

### 2. Csomagok telepítése

A gyökérkönyvtárból egyetlen paranccsal telepíthető az összes szükséges backend és frontend függőség:

```bash
npm run install:all
```

_(Vagy manuálisan belépve a könyvtárakba: `cd backend && npm install`, majd `cd frontend && npm install`)_

### 3. Környezeti változók (.env)

1. Hozz létre egy `.env` fájlt a `backend` könyvtárban a `backend/.env.example` mintájára:
   ```env
   PORT=3001
   MONGODB_URI=a_te_mongodb_kapcsolati_sztringed
   CORS_ORIGIN=http://localhost:5173
   ```
2. _(Opcionális)_ A frontend alapértelmezetten a `http://localhost:3001` backend címhez csatlakozik. Ha ezt módosítani szeretnéd (pl. helyi hálózaton tesztelnéd telefonról), hozz létre egy `.env.local` fájlt a `frontend` könyvtárban:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### 4. Alkalmazás indítása

A projekt gyökeréből egyetlen paranccsal egyszerre elindítható a backend és a frontend fejlesztői szerver:

```bash
npm run dev
```

Ezután a játék elérhető a böngészőben: [http://localhost:5173](http://localhost:5173)

---

## Licenc

A projekt az [MIT Licenc](LICENSE) alatt érhető el.
