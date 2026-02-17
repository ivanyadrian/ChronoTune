import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerRoomHandlers } from "./handlers/roomHandler.js";
import { registerGameHandlers } from "./handlers/gameHandler.js";
import { Room } from "./types.js";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// A központi adatbázis (memóriában)
const roomsData: Record<string, Room> = {};

io.on("connection", (socket) => {
  console.log("Új kliens kapcsolódott:", socket.id);

  // A handlerek regisztrálása - átadjuk nekik az io-t, a socketet és az adatokat
  registerRoomHandlers(io, socket, roomsData);
  registerGameHandlers(io, socket, roomsData);

  socket.on("disconnect", () => {
    console.log("Kliens lecsatlakozott:", socket.id);
    // Itt később megírhatod a logikát, ami eltávolítja a játékost a szobából
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Szerver fut a http://localhost:${PORT} címen`);
});
