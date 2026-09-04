# ChronoTune - Frontend Client

The frontend client for **ChronoTune**, built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## Overview & Architecture

- **Framework:** React 19 with functional components and modern hooks.
- **Styling:** Tailwind CSS v4 with custom responsive animations (visualizers, vinyl rotation, card flips).
- **Real-time Engine:** Socket.io client with decoupled custom hooks:
  - `useRoomSocket`: Room creation, joining, and lobby synchronization.
  - `useGameplaySocket`: Turn-based card placements, verification results, and state updates.
  - `useAudioSyncSocket`: Music playback state and timestamp synchronization across clients.
- **Localization (i18n):** Context-driven instant translation between English (`en`) and Hungarian (`hu`).
- **Player Identification:** Browser fingerprinting (`@fingerprintjs/fingerprintjs`) for seamless, frictionless weekly challenge participation without mandatory registration.

---

## Component & View Structure

- `src/views/GameBoard`: Main game screen with interactive timeline, hand deck, and status metrics.
- `src/views/Lobby`: Pre-game multiplayer waiting room with settings configuration and room link sharing.
- `src/views/Menu`: Mode selection (Solo, Multiplayer, Weekly Challenge) and rule customization steps.
- `src/views/WeeklyChallenge`: Dedicated weekly challenge view with rules, active run tracker, and global leaderboard.
- `src/views/GameResult`: Game conclusion screen displaying player placements and accuracy statistics.
- `src/components/`: Reusable UI modules (e.g. `MusicPlayer`, `TimeLine`, `SongCard`, `Leaderboard`, `Toast`).

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type-check and production build
npm run build
```
