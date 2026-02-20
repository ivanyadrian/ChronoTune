import { Server, Socket } from "socket.io";
import type { Room } from "../types.ts";
import { hungarianSongs } from "../data/songs.js";

export const registerRoomHandlers = (io: Server, socket: Socket, roomsData: Record<string, Room>,) => {
 
  // Szoba létrehozása
  socket.on("create_room", async (data: { userName: string, targetLength: number }) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    socket.join(code);

    roomsData[code] = {
      players: [{ id: socket.id, name: data.userName, timeline: [] }],
      targetLength: data.targetLength || 10,
      deck: [],
      gameStarted: false,
      turnIndex: 0,
      turnLocked: false,
    };

    socket.emit("room_created", code);
    socket.emit("is_host", true);

    const names = roomsData[code].players.map((p) => p.name);
    io.to(code).emit("update_players", names);
  });

  // Csatlakozás szobához
  socket.on("join_room", (data: { code: string; userName: string }) => {
    const room = roomsData[data.code];
    if (room) {
      socket.join(data.code);
      room.players.push({ id: socket.id, name: data.userName, timeline: [] });

      socket.emit("joined_success", data.code);
      const names = room.players.map((p) => p.name);
      io.to(data.code).emit("update_players", names);
    } else {
      socket.emit("error", "Nincs ilyen szoba!");
    }
  });

  // Játék indítása
 socket.on("start_game", (code: string) => {
  const room = roomsData[code];
  if (room) {
    console.log(`Játék indítása statikus dalokkal a(z) ${code} szobában.`);
    
    room.gameStarted = true;
    room.turnIndex = 0;
    
    // Megkeverjük a statikus listát
    room.deck = [...hungarianSongs].sort(() => Math.random() - 0.5);

    // Kezdőkártyák osztása
    room.players.forEach((player) => {
      const startCard = room.deck.pop();
      if (startCard) player.timeline = [startCard];
    });

    io.to(code).emit("game_started", {
      players: room.players,
      currentTurn: room.players[0].id,
    });
  }
});
};
