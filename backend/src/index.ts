import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerRoomHandlers } from "./handlers/roomHandler.js";
import { registerGameHandlers } from "./handlers/gameHandler.js";
import { Room } from "./types.js";

const app = express();

/**
 * CORS (Cross-Origin Resource Sharing) engedélyezése.
 * Ez szükséges ahhoz, hogy a frontend (pl. localhost:5173) 
 * kéréseket küldhessen a backendnek (localhost:3001).
 */
app.use(cors());

/**
 * DEEZER PROXY ENDPOINT
 * A böngészők biztonsági okokból (CORS) gyakran blokkolják, ha a frontend 
 * közvetlenül hívja a Deezer API-t. Ez a szerveroldali proxy "átveszi" a kérést, 
 * lekéri az adatot a Deezertől, és továbbítja a kliensnek.
 */
app.get('/api/deezer-proxy/:trackId', async (req, res) => {
  const { trackId } = req.params;

  try {
    const response = await fetch(`https://api.deezer.com/track/${trackId}`);
    if (!response.ok) throw new Error('Deezer API hiba');

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy hiba:", error);
    res.status(500).json({ error: 'Nem sikerült elérni a Deezert' });
  }
});

// HTTP szerver létrehozása az Express alkalmazásból
const httpServer = createServer(app);

/**
 * SOCKET.IO INICIALIZÁLÁSA
 * Itt konfiguráljuk a valós idejű kommunikációt.
 * Fontos: Az origin-t később érdemes lesz környezeti változóra (ENV) cserélni élesítéskor.
 */
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // A frontended címe
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/**
 * IN-MEMORY ADATBÁZIS
 * Ez tárolja az összes aktív szobát és azok állapotát (pakli, játékosok, kártyák).
 * Figyelem: Szerver újraindításkor ez kiürül (ezt oldjuk majd meg később Redis-szel).
 */
const roomsData: Record<string, Room> = {};

// SOCKET ESEMÉNYEK KEZELÉSE
io.on("connection", (socket) => {
  console.log("Új kliens kapcsolódott:", socket.id);

  /**
   * ESEMÉNYKEZELŐK REGISZTRÁLÁSA
   * Szétválasztjuk a szobakezelést (lobby) és a játékmenetet (gameplay) 
   */
  registerRoomHandlers(io, socket, roomsData);
  registerGameHandlers(io, socket, roomsData);

  socket.on("disconnect", () => {
    console.log("Kliens lecsatlakozott:", socket.id);
  });
});

// SZERVER INDÍTÁSA
const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Szerver fut a http://localhost:${PORT} címen`);
});