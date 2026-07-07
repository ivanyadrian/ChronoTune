import { Server, Socket } from "socket.io";
import type { Room } from "../types.js";
import  hungarianSongs from "../data/songs.json" with { type: "json" };
import { shuffle } from "../utils/shuffle.js";
import type { Song } from "../types.js";
import { PLAYBACK_STATE } from "../constants/index.js";

const createPlayerObject = (id: string, name: string) => ({
  id,
  name,
  timeline: [],
  mistakes: 0,
  attempts: 0,
  personalDeck: [],
  score: 0,
  winStreak: 0,
  loseStreak: 0,
  pendingIndex: null,
});

// Helper function: Generate a deck of unique years for a player
const generatePersonalDeck = (songs: Song[], targetLength: number): Song[] => {
  const shuffled = shuffle([...songs]);
  const deck: Song[] = [];
  const usedYears = new Set<number>();

  for (const song of shuffled) {
    if (!usedYears.has(song.year)) {
      deck.push(song);
      usedYears.add(song.year);
    }
    if (deck.length === targetLength) break;
  }
  return deck;
};

// --- HELPER FUNCTION: Find which room a given socket belongs to ---
const findRoomBySocketId = (
  socketId: string,
  roomsData: Record<string, Room>,
): [string, Room] | null => {
  for (const [code, room] of Object.entries(roomsData)) {
    if (room.players.some((p) => p.id === socketId)) {
      return [code, room];
    }
  }
  return null;
};

/**
 * LEAVE LOGIC
 */
export const handleLeaveRoom = (
  io: Server,
  socket: Socket,
  roomsData: Record<string, Room>,
) => {
  const found = findRoomBySocketId(socket.id, roomsData);
  if (!found) return;

  const [roomCode, room] = found;
  const playerIndex = room.players.findIndex((p) => p.id === socket.id);
  if (playerIndex === -1) return;

  const wasHost = playerIndex === 0;
  const leavingPlayer = room.players[playerIndex];
  const wasActiveTurn =
    room.gameStarted && room.players[room.turnIndex]?.id === socket.id;

  // Remove player
  room.players.splice(playerIndex, 1);
  socket.leave(roomCode);

  if (wasActiveTurn) {
    room.activeCard = undefined;
  }

  // If room becomes empty → delete it
  if (room.players.length === 0) {
    delete roomsData[roomCode];
    return;
  }

  // Notify others
  io.to(roomCode).emit("player_left", { playerName: leavingPlayer.name });

  // Transfer host
  if (wasHost) {
    const newHost = room.players[0];
    io.to(newHost.id).emit("is_host", true);
    io.to(newHost.id).emit("room_config_updated", {
      targetLength: room.targetLength,
      maxMistakes: room.maxMistakes,
      syncMusic: room.syncMusic,
    });
  }

  if (room.gameStarted) {
    // Fix turnIndex
    if (playerIndex < room.turnIndex) {
      room.turnIndex--;
    }
    if (room.turnIndex >= room.players.length) {
      room.turnIndex = 0;
    }

    room.turnLocked = false;
    io.to(roomCode).emit("turn_changed", {
      currentTurn: room.players[room.turnIndex].id,
      players: room.players,
    });
  } else {
    const names = room.players.map((p) => p.name);
    io.to(roomCode).emit("update_players", names);
  }
};

export const registerRoomHandlers = (
  io: Server,
  socket: Socket,
  roomsData: Record<string, Room>,
) => {
  // LEAVE
  socket.on("leave_room", () => handleLeaveRoom(io, socket, roomsData));
  socket.on("disconnect", () => handleLeaveRoom(io, socket, roomsData));

  // --- CREATE ROOM ---
  socket.on(
    "create_room",
     (data: {
      userName: string;
      targetLength: number;
      isSolo?: boolean;
      maxMistakes?: number | null;
      syncMusic?: boolean;
    }) => {
      // Name & targetLength validation
      if (!data?.userName || data.userName.trim().length === 0 || data.userName.length > 20) {
        socket.emit("error", "Érvénytelen felhasználónév!");
        return;
      }
      if (!Number.isInteger(data.targetLength) || data.targetLength < 3 || data.targetLength > 30) {
        socket.emit("error", "Érvénytelen célhossz!");
        return;
      }
      if (data.maxMistakes !== undefined && data.maxMistakes !== null) {
        if (!Number.isInteger(data.maxMistakes) || data.maxMistakes < 1 || data.maxMistakes > 10) {
          socket.emit("error", "Érvénytelen hibahatár!");
          return;
        }
      }
      if (data.syncMusic !== undefined && typeof data.syncMusic !== "boolean") {
        socket.emit("error", "Érvénytelen szinkronizációs beállítás!");
        return;
      }

      let code: string;
      do {
        code = Math.random().toString(36).substring(2, 6).toUpperCase();
      } while (roomsData[code]); // Check that the code is unique
      
      socket.join(code);

      const maxMistakes = data.maxMistakes !== undefined ? data.maxMistakes : null;

      const newRoom: Room = {
        players: [createPlayerObject(socket.id, data.userName)],
        targetLength: data.targetLength,
        deck: shuffle(hungarianSongs),
        gameStarted: data.isSolo || false,
        turnIndex: 0,
        turnLocked: false,
        maxMistakes,
        syncMusic: data.syncMusic ?? true,
        activeCard: undefined,
        playbackState: PLAYBACK_STATE.STOPPED,
        currentPlayingDeezerId: null,
      };

      roomsData[code] = newRoom;

      if (data.isSolo) {
        // Solo mode - initialization only, gameplay is handled by gameHandlers
        const pDeck = generatePersonalDeck(
          hungarianSongs,
          newRoom.targetLength + 1,
        );
        newRoom.players[0].personalDeck = pDeck;
        const startCard = newRoom.players[0].personalDeck.pop();
        if (startCard) newRoom.players[0].timeline = [startCard];

        socket.emit("game_started", {
          players: newRoom.players,
          currentTurn: socket.id,
          roomCode: code,
          maxMistakes: newRoom.maxMistakes,
          targetLength: newRoom.targetLength,
          isSolo: true,
        });
      } else {
        socket.emit("room_created", code);
        socket.emit("is_host", true);
        io.to(code).emit("update_players", newRoom.players.map(p => p.name));
        socket.emit("room_config_updated", {
          targetLength: newRoom.targetLength,
          maxMistakes: newRoom.maxMistakes,
          syncMusic: newRoom.syncMusic,
        });
      }
    },
  );

  // --- JOIN ROOM ---
  socket.on("join_room", (data: { code: string; userName: string }) => {
    const room = roomsData[data.code];

    if (!room) {
      socket.emit("error", "A szoba nem található!");
      return;
    }

    if (room.gameStarted) {
      socket.emit("error", "A játék már folyamatban van!");
      return;
    }

    if (!data?.userName || data.userName.trim().length === 0 || data.userName.length > 20) {
      socket.emit("error", "Érvénytelen felhasználónév!");
      return;
    }
    

    const nameTaken = room.players.some(
      (p) => p.name.toLowerCase() === data.userName.toLowerCase(),
    );
    if (nameTaken) {
      socket.emit("error", "Ezt a nevet már használja valaki!");
      return;
    }

    socket.join(data.code);
    room.players.push(createPlayerObject(socket.id, data.userName));
    socket.emit("joined_success", data.code);
    socket.emit("room_config_updated", {
      targetLength: room.targetLength,
      maxMistakes: room.maxMistakes,
      syncMusic: room.syncMusic,
    });

    io.to(data.code).emit("update_players", room.players.map(p => p.name));
    socket.to(data.code).emit("player_joined", data.userName);
  });

  // --- UPDATE SETTINGS ---
  socket.on(
    "update_room_config",
    (data: {
      roomCode: string;
      targetLength?: number;
      syncMusic?: boolean;
      maxMistakes?: number | null;
    }) => {
      const room = roomsData[data.roomCode];
      if (!room) return;
      if (room.players[0].id !== socket.id) return;

      if (data.targetLength !== undefined) {
        if (!Number.isInteger(data.targetLength) || data.targetLength < 3 || data.targetLength > 30) {
          socket.emit("error", "Érvénytelen célhossz!");
          return;
        }
        room.targetLength = data.targetLength;
      }
      if (data.syncMusic !== undefined) {
        if (typeof data.syncMusic !== "boolean") {
          socket.emit("error", "Érvénytelen szinkronizációs beállítás!");
          return;
        }
        room.syncMusic = data.syncMusic;
      }
      if (data.maxMistakes !== undefined) {
        if (data.maxMistakes !== null && (!Number.isInteger(data.maxMistakes) || data.maxMistakes < 1 || data.maxMistakes > 10)) {
          socket.emit("error", "Érvénytelen hibahatár!");
          return;
        }
        room.maxMistakes = data.maxMistakes;
      }

      io.to(data.roomCode).emit("room_config_updated", {
        targetLength: room.targetLength,
        maxMistakes: room.maxMistakes,
        syncMusic: room.syncMusic,
      });
    },
  );

  // --- START GAME (initialization only, no gameplay!) ---
  socket.on("start_game", (code: string) => {
    const room = roomsData[code];
    if (!room) return;

    if (room.players[0].id !== socket.id) {
      socket.emit("error", "Csak a szobagazda indíthatja el a játékot!");
      return;
    }

    if (room.players.length < 2) {
      socket.emit("error", "Legalább 2 játékos kell a többjátékos módhoz!");
      return;
    }

    room.gameStarted = true;
    room.turnIndex = 0;
    room.turnLocked = false;
    room.deck = shuffle(hungarianSongs);

    // Every player gets a deck
    room.players.forEach((player) => {
      const pDeck = generatePersonalDeck(
        hungarianSongs,
        room.targetLength + 1,
      );
      player.personalDeck = pDeck;
      const startCard = player.personalDeck.pop();
      if (startCard) {
        player.timeline = [startCard];
      }
      // Reset streaks
      player.winStreak = 0;
      player.loseStreak = 0;
      player.mistakes = 0;
      player.attempts = 0;
      player.score = 0;
    });

    io.to(code).emit("game_started", {
      players: room.players,
      currentTurn: room.players[0].id,
      roomCode: code,
      isSolo: false,
    });
  });
};