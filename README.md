<div align="center">

# ChronoTune

**A real-time multiplayer music timeline guessing game inspired by the popular board game _Hitster_.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-chrono--tune.vercel.app-blueviolet?style=for-the-badge)](https://chrono-tune.vercel.app/)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[**Magyar nyelvű leírás (Hungarian version)**](README.hu.md)

</div>

---

## Project Purpose & About

**ChronoTune** is a full-stack, real-time web application developed as a portfolio showcase project to demonstrate practical proficiency in modern web technologies, scalable full-stack architecture, and real-time state synchronization for software engineering internship opportunities.

Inspired by the tabletop card game **Hitster**, players listen to music clips and must arrange songs chronologically on their personal timeline without knowing the exact release year beforehand. The app combines live audio playback, interactive drag-and-drop gameplay, room-based multiplayer synchronization, and a scheduled weekly competitive challenge.

---

## Key Features

- **Real-time Multiplayer & Solo Rooms:**
  - Instant room creation and joining via room codes or clipboard links.
  - Customizable game rules: target timeline length, allowed mistake limit, music synchronization, and song library selection (Hungarian or International).
- **Hitster-style Gameplay:**
  - Turn-based mechanics with synchronized 30-second song previews.
  - Interactive timeline card placement with instant validation and reveal animations (year, month, day, artist, album cover).
  - Streak tracking, mistake penalty mechanics, and game-over states.
- **Weekly Challenge (Solo Asynchronous Mode):**
  - Curated 20-song weekly challenge automatically rotated every Wednesday at 12:00 PM (Europe/Budapest) via a backend scheduler.
  - Global leaderboard ranking based on correct placements, mistake count, and elapsed time.
  - Session token validation and multi-tab anti-cheat prevention.
- **Dual-Language Support (i18n):**
  - Seamless, instantaneous switching between English and Hungarian interfaces.
- **Extensive Music Database:**
  - Thousands of curated Hungarian and International tracks with automated enrichment pipelines.

---

## Technical Details & Implementation

### 1. Real-Time Room & State Synchronization (Socket.io)

- Multiplayer room state (player decks, timelines, turn progression, and playback status) is synchronized event-driven in real time.
- Handlers are separated into dedicated domain modules for cleaner architecture: lobby management (`roomHandler.ts`) and game rule validation (`gameHandler.ts`).

### 2. Deezer API Proxy with Automatic Music Fallback

- Requests are routed through an Express server proxy (`/api/deezer-proxy/:trackId`) to bypass browser CORS constraints and ensure reliable audio delivery.
- **Automatic fallback resolution:** If a track's 30-second preview link is unavailable or expired on Deezer, the proxy dynamically searches Deezer by artist and sanitized title to resolve an active release, preventing game interruptions.

### 3. Weekly Challenge & Anti-Cheat System

- **Scheduled reset:** Challenges rotate automatically every Wednesday at 12:00 PM (Europe/Budapest timezone) using `node-cron`.
- **Fair play & verification:** Players are identified seamlessly without friction via browser fingerprinting (`@fingerprintjs/fingerprintjs`). Active runs are validated with unique server-side `sessionToken`s, preventing multi-tab score tampering.
- **Optimized queries:** Leaderboard sorting and lookups are accelerated using compound MongoDB indexes (`weekIdentifier`, `correctPlacements`, `timeInSeconds`).

### 4. Data Pipeline & Curation (`scripts/`)

- Dedicated standalone Node.js utility scripts process and maintain the song catalogs:
  - `spotify_exporter.js`: Playlist track extraction.
  - `deezer_enrich.js`: Attaches Deezer IDs, cover artwork, release dates, and preview audio URLs.
  - `filter_covers.js`: Automated heuristic filtering to discard covers, tribute versions, and live takes.
  - `count_by_year.js` & `count_by_artist.js`: Dataset distribution analysis to ensure gameplay balance.

---

## Tech Stack

### Frontend

- **Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Real-time:** [Socket.io Client](https://socket.io/docs/v4/client-api/)
- **Icons & UI:** [Lucide React](https://lucide.dev/)
- **Audio & Media:** Deezer 30s Audio Previews (HTML5 Audio API)
- **Utilities:** `@fingerprintjs/fingerprintjs`, `react-copy-to-clipboard`

### Backend

- **Runtime & Framework:** [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **WebSockets:** [Socket.io](https://socket.io/)
- **Database & ODM:** [MongoDB Atlas](https://www.mongodb.com/atlas), [Mongoose](https://mongoosejs.com/)
- **Scheduling:** [node-cron](https://github.com/node-cron/node-cron)
- **Date Utilities:** [Day.js](https://day.js.org/)

---

## Project Structure

```text
ChronoTune/
├── backend/
│   ├── src/
│   │   ├── constants/       # Game configuration constants & playback states
│   │   ├── data/            # Pre-processed song catalogs (en, hu, weekly)
│   │   ├── handlers/        # Socket.io domain handlers (roomHandler, gameHandler)
│   │   ├── routes/          # REST endpoints (Deezer proxy, weekly challenge)
│   │   ├── services/        # Business logic (weekly challenge scheduler & state)
│   │   ├── utils/           # Helper functions (shuffle, array utils)
│   │   ├── db.ts            # Mongoose schemas, models, and connection logic
│   │   ├── types.ts         # Shared TypeScript interfaces (Room, Player, Song)
│   │   └── index.ts         # Express & Socket.io server bootstrap
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Modals, Icons, Navbar)
│   │   ├── context/         # React Contexts (Language, GameState)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization dictionaries (HU / EN)
│   │   ├── views/           # Screen views (GameBoard, Lobby, Menu, WeeklyChallenge)
│   │   ├── App.tsx          # Root view routing & global event bindings
│   │   └── main.tsx         # Application entry point
│   └── package.json
├── scripts/                 # Data scraping, parsing, and enrichment pipelines
└── package.json             # Root monorepo orchestration scripts
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB instance)

### 1. Clone the repository

```bash
git clone https://github.com/ivanyadrian/ChronoTune.git
cd ChronoTune
```

### 2. Install dependencies

Install all dependencies for both backend and frontend with a single command from the root directory:

```bash
npm run install:all
```

_(Alternatively: run `cd backend && npm install` and `cd frontend && npm install`)_

### 3. Configure environment variables (.env)

1. Create a `.env` file in the `backend` directory based on `backend/.env.example`:
   ```env
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173
   ```
2. _(Optional)_ The frontend defaults to `http://localhost:3001`. If you want to connect to a different address (e.g. testing from mobile over Wi-Fi), create a `.env.local` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### 4. Run the application

Start both the backend and frontend development servers concurrently from the root directory:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start playing!

---

## License

This project is open-source and available under the [MIT License](LICENSE).
