import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  registerRoomHandlers,
  handleLeaveRoom,
} from "./handlers/roomHandler.js";
import { registerGameHandlers } from "./handlers/gameHandler.js";
import { Room } from "./types.js";

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

/**
 * Enable CORS (Cross-Origin Resource Sharing).
 * This is required so the frontend (e.g. localhost:5173)
 * can send requests to the backend (localhost:3001).
 */
app.use(cors());

/**
 * DEEZER PROXY ENDPOINT
 * Browsers often block direct API calls from the frontend due to CORS.
 * This server-side proxy intercepts the request,
 * fetches the data from Deezer, and forwards it to the client.
 */
app.get("/api/deezer-proxy/:trackId", async (req, res) => {
  const { trackId } = req.params;

  if (!/^\d+$/.test(trackId)) {
    return res.status(400).json({ error: "Érvénytelen track ID formátum" });
  }

  try {
    const response = await fetch(`https://api.deezer.com/track/${trackId}`);

    if (!response.ok) {
      console.error(
        `Deezer API hiba: ${response.status} - ${response.statusText}`,
      );
      return res.status(response.status).json({
        error: "Deezer API hiba",
        status: response.status,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy hiba:", error);
    res.status(500).json({ error: "Nem sikerült elérni a Deezert" });
  }
});

// Create HTTP server from the Express application
const httpServer = createServer(app);

/**
 * INITIALIZE SOCKET.IO
 * Configure real-time communication here.
 * Important: The origin should be replaced with an environment variable (ENV) during deployment.
 */
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/**
 * IN-MEMORY DATABASE
 * Stores all active rooms and their state (deck, players, cards).
 * Note: This clears on server restart (to be solved later with Redis for persistence).
 */
const roomsData: Record<string, Room> = {};

// HANDLE SOCKET EVENTS
io.on("connection", (socket) => {
  /**
   * REGISTER EVENT HANDLERS
   * Separate room management (lobby) and gameplay handlers
   */
  registerRoomHandlers(io, socket, roomsData);
  registerGameHandlers(io, socket, roomsData);
});

// START SERVER
// httpServer.listen(PORT, () => {
//   console.log(`Szerver fut a http://localhost:${PORT} címen`);
// });
