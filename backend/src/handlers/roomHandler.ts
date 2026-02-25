import { Server, Socket } from "socket.io";
import type { Room } from "../types.js";
import { hungarianSongs } from "../data/songs.js";
import { shuffle } from "../utils/shuffle.js";

//Szobakezelésért felelős socket eseménykezelők regisztrálása.

export const registerRoomHandlers = (io: Server, socket: Socket, roomsData: Record<string, Room>) => {

  // --- SZOBA LÉTREHOZÁSA (CREATE ROOM) ---
  socket.on("create_room", async (data: { userName: string, targetLength: number, isSolo?: boolean }) => {
    
    // Egyedi 4 karakteres szobakód generálása (pl. A1B2)
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    socket.join(code);

    // Új szoba alapbeállításokkal
    const newRoom: Room = {
      players: [{ id: socket.id, name: data.userName, timeline: [], mistakes: 0 }],
      targetLength: data.targetLength || 10,
      deck: shuffle(hungarianSongs), // Pakli megkeverése már a létrehozáskor
      gameStarted: data.isSolo || false, // Solo módban nincs lobby
      turnIndex: 0,
      turnLocked: false,
    };

    roomsData[code] = newRoom;

    // EGYJÁTÉKOS (SOLO) MÓD LOGIKÁJA
    if (data.isSolo) {
      const startCard = newRoom.deck.pop();
      if (startCard) newRoom.players[0].timeline = [startCard];

      socket.emit("game_started", {
        players: newRoom.players,
        currentTurn: socket.id,
        roomCode: code 
      });
    } else {

      // TÖBBJÁTÉKOS (MULTI) MÓD LOGIKÁJA
      socket.emit("room_created", code);
      socket.emit("is_host", true); // Aki létrehozza, az lesz a host
      
      const names = newRoom.players.map((p) => p.name);
      io.to(code).emit("update_players", names); // Frissítjük a várólistát mindenkinél
    }
  });

  // --- CSATLAKOZÁS SZOBÁHOZ (JOIN ROOM) ---
  socket.on("join_room", (data: { code: string; userName: string }) => {
    const room = roomsData[data.code];
    
    // Ellenőrizzük, hogy létezik-e a szoba
    if (room) {
      // Ha a játék már megy, nem engedünk be új embert
      if (room.gameStarted) {
        socket.emit("error", "A játék már folyamatban van!");
        return;
      }

      socket.join(data.code);
      // Új játékos hozzáadása
      room.players.push({ id: socket.id, name: data.userName, timeline: [], mistakes: 0 });

      socket.emit("joined_success", data.code);
      
      // Mindenkit értesítünk az új játékosról
      const names = room.players.map((p) => p.name);
      io.to(data.code).emit("update_players", names);
    } else {
      socket.emit("error", "A szoba nem található!");
    }
  });

  // --- JÁTÉK INDÍTÁSA (START GAME - Csak Multiplayer esetén) ---
  socket.on("start_game", (code: string) => {
    const room = roomsData[code];
    if (room) {
      // Biztonsági ellenőrzés: Csak a host (első játékos) indíthatja el
      if (room.players[0].id !== socket.id) {
        socket.emit("error", "Csak a szobagazda indíthatja el a játékot!");
        return;
      }

      room.gameStarted = true;
      room.turnIndex = 0;

      /** * Kezdőállapot beállítása:
       * 1. Újrakeverjük a paklit a biztonság kedvéért.
       * 2. Minden játékosnak osztunk egy kezdőkártyát az idővonala alapjának.
       */
      room.deck = shuffle(hungarianSongs);

      room.players.forEach((player) => {
        const startCard = room.deck.pop();
        if (startCard) {
          player.timeline = [startCard];
        }
      });

      // Értesítjük az összes klienst, hogy váltsanak a játéktérre (GameBoard)
      io.to(code).emit("game_started", {
        players: room.players,
        currentTurn: room.players[0].id,
      });
    }
  });
};