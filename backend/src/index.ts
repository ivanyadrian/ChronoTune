import "dotenv/config"; // Load environment variables from .env
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerRoomHandlers } from "./handlers/roomHandler.js";
import { registerGameHandlers } from "./handlers/gameHandler.js";
import { Room } from "./types.js";
import { connectDB } from "./db.js";
import {
  initWeeklyScheduler,
  checkAndResetWeeklyChallenge,
} from "./services/weeklyService.js";
import deezerRoutes from "./routes/deezerRoutes.js";
import weeklyRoutes from "./routes/weeklyRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// In development mode, allow all local network origins (e.g. mobile over WiFi)
const CORS_ORIGIN = process.env.CORS_ORIGIN || true;

// Connect to MongoDB
connectDB().then(async () => {
  // Ensure the weekly challenge is generated/synced at startup
  await checkAndResetWeeklyChallenge();
  // Start the weekly scheduler (Wednesday 12:00 reset)
  initWeeklyScheduler();
});

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json()); // Enable JSON body parsing for POST requests

// API Routes
app.use("/api/deezer-proxy", deezerRoutes);
app.use("/api/weekly-challenge", weeklyRoutes);

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
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
