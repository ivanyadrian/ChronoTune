import { Server, Socket } from "socket.io";
import type { Room, Song } from "../types.js";
import hungarianSongs from "../data/hu_songs.json" with { type: "json" };
import englishSongs from "../data/en_songs.json" with { type: "json" };
import { shuffle } from "../utils/shuffle.js";
import { PLAYBACK_STATE } from "../constants/index.js";
import { WeeklyChallenge } from "../db.js";
import {
  getWeekIdentifier,
  startWeeklyRun,
  pauseWeeklyRun,
  updateWeeklyRunState,
} from "../services/weeklyService.js";

interface CreateRoomData {
  userName: string;
  targetLength: number;
  isSolo?: boolean;
  maxMistakes?: number | null;
  syncMusic?: boolean;
  songLibrary?: "hu" | "en";
  isWeekly?: boolean;
  runId?: string;
  fingerprint?: string;
}

const createPlayerObject = (id: string, name: string) => ({
  id,
  name,
  timeline: [],
  mistakes: 0,
  correctPlacements: 0,
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

// Helper function: Find which room a given socket belongs to
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

// Generate a unique 4-character room code
const generateUniqueRoomCode = (roomsData: Record<string, Room>): string => {
  let code: string;
  do {
    code = Math.random().toString(36).substring(2, 6).toUpperCase();
  } while (roomsData[code]);
  return code;
};

// Validate incoming room creation payload
const validateCreateRoomPayload = (
  socket: Socket,
  data: CreateRoomData,
): boolean => {
  if (
    !data?.userName ||
    data.userName.trim().length === 0 ||
    data.userName.length > 15
  ) {
    socket.emit("error", "Érvénytelen felhasználónév!");
    return false;
  }

  if (!data.isWeekly) {
    if (
      !Number.isInteger(data.targetLength) ||
      data.targetLength < 3 ||
      data.targetLength > 30
    ) {
      socket.emit("error", "Érvénytelen célhossz!");
      return false;
    }
    if (data.maxMistakes !== undefined && data.maxMistakes !== null) {
      if (
        !Number.isInteger(data.maxMistakes) ||
        data.maxMistakes < 1 ||
        data.maxMistakes > 10
      ) {
        socket.emit("error", "Érvénytelen hibahatár!");
        return false;
      }
    }
  }

  if (data.syncMusic !== undefined && typeof data.syncMusic !== "boolean") {
    socket.emit("error", "Érvénytelen szinkronizációs beállítás!");
    return false;
  }

  if (
    data.songLibrary !== undefined &&
    data.songLibrary !== "hu" &&
    data.songLibrary !== "en"
  ) {
    socket.emit("error", "Érvénytelen dalkönyvtár!");
    return false;
  }

  return true;
};

/**
 * Helper: Handle Weekly Challenge room creation & restoration
 */
const handleWeeklyRoomCreation = async (
  socket: Socket,
  code: string,
  data: CreateRoomData,
  roomsData: Record<string, Room>,
) => {
  try {
    const currentWeekId = getWeekIdentifier();
    const startResult = await startWeeklyRun(
      data.userName,
      data.fingerprint || "",
      data.runId,
    );

    if (!startResult.success) {
      socket.emit(
        "error",
        startResult.error || "Nem sikerült elindítani a heti kihívást.",
      );
      return;
    }

    const challenge = await WeeklyChallenge.findOne({
      weekIdentifier: currentWeekId,
    });
    if (!challenge) {
      socket.emit(
        "error",
        "A heti kihívás jelenleg nem elérhető! Kérlek várd meg a generálást.",
      );
      return;
    }

    const existingRun = startResult.existingRun;
    const weeklyElapsedMs = existingRun?.elapsedTimeMs || 0;
    const sessionStartTime = Date.now();

    const newRoom: Room = {
      players: [createPlayerObject(socket.id, data.userName)],
      targetLength: challenge.songs.length - 1,
      deck: [],
      gameStarted: true,
      turnIndex: 0,
      turnLocked: false,
      maxMistakes: null,
      syncMusic: data.syncMusic ?? true,
      songLibrary: "hu",
      activeCard: undefined,
      playbackState: PLAYBACK_STATE.STOPPED,
      currentPlayingDeezerId: null,
      isWeekly: true,
      weeklyElapsedMs,
      sessionStartTime,
      weekIdentifier: currentWeekId,
      weeklyRunId: startResult.runId,
      fingerprint: data.fingerprint || "",
      weeklySessionToken: startResult.sessionToken,
    };

    if (
      existingRun &&
      existingRun.timeline &&
      existingRun.timeline.length > 0
    ) {
      // Restore saved run state
      newRoom.players[0].timeline = existingRun.timeline;
      newRoom.players[0].personalDeck = existingRun.personalDeck || [];
      newRoom.players[0].mistakes = existingRun.mistakes || 0;
      newRoom.players[0].correctPlacements = existingRun.correctPlacements || 0;
      newRoom.players[0].attempts = existingRun.attempts || 0;
      newRoom.activeCard = existingRun.activeCard || undefined;
    } else {
      // Initialize new weekly deck
      const pDeck = [...challenge.songs];
      const rawStartCard = pDeck.pop();
      const startCard = rawStartCard
        ? ({
            ...(rawStartCard.toObject ? rawStartCard.toObject() : rawStartCard),
            isStartCard: true,
          } as Song)
        : undefined;
      newRoom.players[0].personalDeck = pDeck;
      if (startCard) {
        newRoom.players[0].timeline = [startCard];
      }

      // Persist initial state
      updateWeeklyRunState(startResult.runId!, {
        timeline: newRoom.players[0].timeline,
        personalDeck: newRoom.players[0].personalDeck,
        activeCard: undefined,
        mistakes: 0,
        correctPlacements: 0,
        attempts: 0,
      }).catch((err) => console.error("Hiba az aktív futás mentésekor:", err));
    }

    roomsData[code] = newRoom;

    socket.emit("game_started", {
      players: newRoom.players,
      currentTurn: socket.id,
      roomCode: code,
      maxMistakes: newRoom.maxMistakes,
      targetLength: newRoom.targetLength,
      isSolo: true,
      isWeekly: true,
      weekIdentifier: currentWeekId,
      runId: startResult.runId,
      weeklyElapsedMs,
    });

    if (newRoom.activeCard) {
      const card = newRoom.activeCard;
      socket.emit("new_card_drawn", {
        id: card.id,
        title: card.title,
        artist: card.artist,
        deezerId: card.deezerId,
        cover: card.cover,
        userName: newRoom.players[0].name,
        playerId: socket.id,
      });
    }
  } catch (error) {
    console.error("Hiba a heti kihívás szoba létrehozásakor:", error);
    socket.emit("error", "Nem sikerült elindítani a heti kihívást.");
  }
};

/**
 * Helper: Handle Standard (Solo or Multiplayer) room creation
 */
const handleStandardRoomCreation = (
  io: Server,
  socket: Socket,
  code: string,
  data: CreateRoomData,
  roomsData: Record<string, Room>,
) => {
  const maxMistakes = data.maxMistakes !== undefined ? data.maxMistakes : null;
  const songLibrary = data.songLibrary ?? "hu";
  const songs = songLibrary === "en" ? englishSongs : hungarianSongs;

  const newRoom: Room = {
    players: [createPlayerObject(socket.id, data.userName)],
    targetLength: data.targetLength,
    deck: shuffle(songs as Song[]),
    gameStarted: data.isSolo || false,
    turnIndex: 0,
    turnLocked: false,
    maxMistakes,
    syncMusic: data.syncMusic ?? true,
    songLibrary,
    activeCard: undefined,
    playbackState: PLAYBACK_STATE.STOPPED,
    currentPlayingDeezerId: null,
  };

  roomsData[code] = newRoom;

  if (data.isSolo) {
    const pDeck = generatePersonalDeck(
      songs as Song[],
      newRoom.targetLength + 1,
    );
    newRoom.players[0].personalDeck = pDeck;
    const rawStartCard = newRoom.players[0].personalDeck.pop();
    const startCard = rawStartCard
      ? { ...rawStartCard, isStartCard: true }
      : undefined;
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
    io.to(code).emit(
      "update_players",
      newRoom.players.map((p) => p.name),
    );
    socket.emit("room_config_updated", {
      targetLength: newRoom.targetLength,
      maxMistakes: newRoom.maxMistakes,
      syncMusic: newRoom.syncMusic,
      songLibrary: newRoom.songLibrary,
    });
  }
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
    if (
      room.isWeekly &&
      room.weeklyRunId &&
      room.sessionStartTime !== undefined
    ) {
      pauseWeeklyRun(
        room.weeklyRunId,
        room.sessionStartTime,
        room.weeklyElapsedMs || 0,
      ).catch((err) =>
        console.error("Hiba a heti futás szüneteltetésekor:", err),
      );
    }
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
      songLibrary: room.songLibrary,
    });
  }

  if (room.gameStarted) {
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
  socket.on("create_room", async (data: CreateRoomData) => {
    if (!validateCreateRoomPayload(socket, data)) return;

    const code = generateUniqueRoomCode(roomsData);
    socket.join(code);

    if (data.isWeekly) {
      await handleWeeklyRoomCreation(socket, code, data, roomsData);
    } else {
      handleStandardRoomCreation(io, socket, code, data, roomsData);
    }
  });

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

    if (
      !data?.userName ||
      data.userName.trim().length === 0 ||
      data.userName.length > 15
    ) {
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
      songLibrary: room.songLibrary,
    });

    io.to(data.code).emit(
      "update_players",
      room.players.map((p) => p.name),
    );
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
      songLibrary?: "hu" | "en";
    }) => {
      const room = roomsData[data.roomCode];
      if (!room) return;
      if (room.players[0].id !== socket.id) return;

      if (data.targetLength !== undefined) {
        if (
          !Number.isInteger(data.targetLength) ||
          data.targetLength < 3 ||
          data.targetLength > 30
        ) {
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
        if (
          data.maxMistakes !== null &&
          (!Number.isInteger(data.maxMistakes) ||
            data.maxMistakes < 1 ||
            data.maxMistakes > 10)
        ) {
          socket.emit("error", "Érvénytelen hibahatár!");
          return;
        }
        room.maxMistakes = data.maxMistakes;
      }
      if (data.songLibrary !== undefined) {
        if (data.songLibrary !== "hu" && data.songLibrary !== "en") {
          socket.emit("error", "Érvénytelen dalkönyvtár!");
          return;
        }
        room.songLibrary = data.songLibrary;
      }

      io.to(data.roomCode).emit("room_config_updated", {
        targetLength: room.targetLength,
        maxMistakes: room.maxMistakes,
        syncMusic: room.syncMusic,
        songLibrary: room.songLibrary,
      });
    },
  );

  // --- START GAME ---
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

    const songs = room.songLibrary === "en" ? englishSongs : hungarianSongs;

    room.gameStarted = true;
    room.turnIndex = 0;
    room.turnLocked = false;
    room.deck = shuffle(songs as Song[]);

    // Every player gets a deck
    room.players.forEach((player) => {
      const pDeck = generatePersonalDeck(
        songs as Song[],
        room.targetLength + 1,
      );
      player.personalDeck = pDeck;
      const rawStartCard = player.personalDeck.pop();
      const startCard = rawStartCard
        ? { ...rawStartCard, isStartCard: true }
        : undefined;
      if (startCard) {
        player.timeline = [startCard];
      }
      // Reset stats
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
