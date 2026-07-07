// src/handlers/gameHandler.ts
import { Server, Socket } from "socket.io";
import type { Room, Song } from "../types.js";
import { shuffle } from "../utils/shuffle.js";
import  hungarianSongs  from "../data/songs.json" with { type: "json" };
import { SCORES, PLAYBACK_STATE, ERROR_CODES } from "../constants/index.js";

// Helper function for sending errors
const emitError = (socket: Socket, code: string, message: string) => {
  socket.emit("game_error", { code, message, timestamp: Date.now() });
};

// Helper function for sending messages
const emitMessage = (socket: Socket, type: string, text: string) => {
  socket.emit("game_message", { type, text });
};

const getAuthorizedTurnContext = (
  socket: Socket,
  roomCode: string,
  roomsData: Record<string, Room>,
) => {
  const room = roomsData[roomCode];
  if (!room || !room.gameStarted) {
    emitError(socket, ERROR_CODES.GAME_NOT_STARTED, "A játek még nem indult el!");
    return null;
  }

  const isSocketInRoom = socket.rooms.has(roomCode);
  const currentPlayer = room.players[room.turnIndex];
  const isPlayerInRoomState = room.players.some((p) => p.id === socket.id);

  if (!isSocketInRoom || !isPlayerInRoomState || !currentPlayer) {
    emitError(socket, ERROR_CODES.ROOM_NOT_FOUND, "Nem vagy a szobaban!");
    return null;
  }

  if (socket.id !== currentPlayer.id) {
    emitError(socket, ERROR_CODES.NOT_YOUR_TURN, `${currentPlayer.name} van soron!`);
    return null;
  }

  return { room, currentPlayer };
};

export const registerGameHandlers = (
  io: Server,
  socket: Socket,
  roomsData: Record<string, Room>,
) => {

  // ------------------------ DRAW CARD ------------------------
  socket.on("draw_card", (roomCode: string) => {
    try {
      const context = getAuthorizedTurnContext(socket, roomCode, roomsData);
      if (!context) return;

      const { room, currentPlayer } = context;

      if (room.activeCard) {
        emitError(socket, ERROR_CODES.ALREADY_HAS_ACTIVE_CARD, "Mar huztal egy kartyat! Helyezd el vagy dobd el.");
        return;
      }

      const pDeck = currentPlayer.personalDeck;
      if (!pDeck || pDeck.length === 0) {
        emitError(socket, ERROR_CODES.NO_MORE_CARDS, "Nincs tobb kartya a pakliban!");
        return;
      }

      const nextCard = pDeck.pop();
      if (!nextCard) {
        emitError(socket, ERROR_CODES.SERVER_ERROR, "Hiba tortent a kartyahuzas soran");
        return;
      }

      room.activeCard = nextCard;
      room.playbackState = PLAYBACK_STATE.STOPPED;

      io.to(roomCode).emit("music_playback_toggled", {
        deezerId: nextCard.deezerId,
        state: PLAYBACK_STATE.STOPPED,
      });

      io.to(roomCode).emit("new_card_drawn", {
        id: nextCard.id,
        title: nextCard.title,
        artist: nextCard.artist,
        deezerId: nextCard.deezerId,
        cover: nextCard.cover,
        userName: currentPlayer.name,
        playerId: currentPlayer.id,
      });

    } catch (error) {
      console.error("[draw_card] Critical error:", error);
      emitError(socket, ERROR_CODES.SERVER_ERROR, "Szerver hiba történt a kártyahúzás során");
    }
  });

  // ------------------------ PLACE CARD ------------------------
  socket.on("place_card", (data: { roomCode: string; cardId: number; index: number }) => {
    let shouldClearCard = false;
    
    try {
      const context = getAuthorizedTurnContext(socket, data.roomCode, roomsData);
      if (!context) return;

      const { room, currentPlayer } = context;

      // Validations
      if (!Number.isInteger(data.index) || data.index < 0 || data.index > currentPlayer.timeline.length) {
        emitError(socket, ERROR_CODES.INVALID_INDEX, `Érvénytelen pozíció: ${data.index}`);
        return;
      }

      const fullCard = room.activeCard;
      if (!fullCard) {
        emitError(socket, ERROR_CODES.NO_ACTIVE_CARD, "Nincs aktiv kártya! Először huzz egyet.");
        return;
      }

      if (fullCard.id !== data.cardId) {
        emitError(socket, ERROR_CODES.CARD_NOT_FOUND, "A kártya ID nem egyezik az aktiv kártyaival!");
        return;
      }

      // Clear pending state (notify others)
      currentPlayer.pendingIndex = null;
      io.to(data.roomCode).emit("player_pending_updated", {
        playerId: currentPlayer.id,
        index: null,
      });

      // Validation and scoring
      const { timeline } = currentPlayer;
      let delta = 0;
      let bonusPoints = 0;
      let isCorrect = true;

      // Check if placed in the correct position
      if (data.index > 0 && timeline[data.index - 1].year > fullCard.year) {
        isCorrect = false;
      }
      if (data.index < timeline.length && timeline[data.index].year < fullCard.year) {
        isCorrect = false;
      }

      // Scoring
      if (isCorrect) {
        currentPlayer.timeline.splice(data.index, 0, fullCard);
        delta = SCORES.CORRECT_PLACE;
        currentPlayer.winStreak++;
        currentPlayer.loseStreak = 0;

        if (currentPlayer.winStreak >= SCORES.STREAK_THRESHOLD) {
          bonusPoints = SCORES.BASE_BONUS +
            (currentPlayer.winStreak - SCORES.STREAK_THRESHOLD) * SCORES.BONUS_INCREMENT;
          delta += bonusPoints;
        }
        currentPlayer.score += delta;

        // If placed correctly, remove the card from active cards
        shouldClearCard = true;

      } else {
        currentPlayer.mistakes++;
        currentPlayer.winStreak = 0;
        currentPlayer.loseStreak++;

        delta = SCORES.MISTAKE_PENALTY;

        if (currentPlayer.loseStreak >= SCORES.STREAK_THRESHOLD) {
          const extraPenalty = SCORES.EXTRA_PENALTY_BASE +
            (currentPlayer.loseStreak - SCORES.STREAK_THRESHOLD) * SCORES.EXTRA_PENALTY_MULTIPLIER;
          delta -= extraPenalty;
          bonusPoints = extraPenalty;
        }

        currentPlayer.score = Math.max(0, currentPlayer.score + delta);

        shouldClearCard = true; // The card must be removed from active cards, even if placed incorrectly
      }

      currentPlayer.attempts++;
      room.turnLocked = false;

      // Game over check
      const isLastPlayerInRound = room.turnIndex === room.players.length - 1;
      const isLastRoundImminent = isLastPlayerInRound && currentPlayer.attempts === room.targetLength - 1;
      const isMistakeLimitReached = room.maxMistakes !== null && currentPlayer.mistakes >= room.maxMistakes;
      const isGameLengthReached = isLastPlayerInRound && currentPlayer.attempts >= room.targetLength;
      const isGameOver = isMistakeLimitReached || isGameLengthReached;

      // Send result to everyone
      io.to(data.roomCode).emit("placement_result", {
        success: isCorrect,
        playerName: currentPlayer.name,
        activePlayerId: currentPlayer.id,
        cardYear: fullCard.year,
        cardMonth: fullCard.month,
        cardDay: fullCard.day,
        fullDate: fullCard.fullDate,
        players: room.players,
        pointsEarned: delta,
        bonusPoints: bonusPoints,
        isLastRoundImminent,
        isGameOver,
      });

      // Game Over handling with SNAPSHOT
      if (isGameOver) {
        // Lock the game immediately to prevent race conditions
        room.gameStarted = false;

        // SNAPSHOT: Save the data BEFORE setTimeout
        let gameOverPayload: any;

        if (isMistakeLimitReached) {
          gameOverPayload = {
            winnerName: null,
            finalTimeline: [...currentPlayer.timeline], // COPY
            lost: true,
            mistakes: currentPlayer.mistakes,
            score: currentPlayer.score,
            allPlayers: [...room.players], // COPY
          };
        } else if (isGameLengthReached) {
          // Perfect Game Bonus
          room.players.forEach((p) => {
            if (p.mistakes === 0) p.score += SCORES.PERFECT_GAME_BONUS;
          });

          const maxScore = Math.max(...room.players.map((p) => p.score));
          const winners = room.players.filter((p) => p.score === maxScore);

          gameOverPayload = {
            winnerNames: winners.map((w) => w.name),
            winnerName: winners[0].name,
            finalTimeline: [...winners[0].timeline], // COPY
            score: maxScore,
            allPlayers: [...room.players], // COPY
          };
        }

        // ⏳ Delay with SNAPSHOT
        setTimeout(() => {
          // 🔒 Security check: Does the room STILL exist?
          const currentRoom = roomsData[data.roomCode];
          if (!currentRoom) return;

          // ✅ Send SNAPSHOT (data hasn't changed)
          io.to(data.roomCode).emit("game_over", gameOverPayload);
        }, SCORES.GAME_OVER_DELAY_MS);
      }

    } catch (error) {
      console.error("[place_card] Critical error:", error);
      emitError(socket, ERROR_CODES.SERVER_ERROR, "Szerver hiba történt a kártya elhelyezése során");
    } finally {
      if (shouldClearCard && roomsData[data?.roomCode]?.activeCard) {
        roomsData[data.roomCode].activeCard = undefined;
      }
    }
  });

  // ------------------------ DISCARD CARD ------------------------
  socket.on("discard_card", (roomCode: string) => {
    try {
      const context = getAuthorizedTurnContext(socket, roomCode, roomsData);
      if (!context) return;

      const { room, currentPlayer } = context;

      if (!room.activeCard) {
        emitError(socket, ERROR_CODES.NO_ACTIVE_CARD, "Nincs mit eldobni!");
        return;
      }

      currentPlayer.score = Math.max(0, currentPlayer.score + SCORES.DISCARD_PENALTY);

      const oldCard = room.activeCard;
      room.activeCard = undefined;

      const pDeck = currentPlayer.personalDeck;
      if (!pDeck) return;

      // Collect used IDs
      const usedIds = new Set<number>();
      room.players.forEach((p) => {
        p.timeline.forEach((s) => usedIds.add(s.id));
        p.personalDeck.forEach((s) => usedIds.add(s.id));
      });

      const usedYears = new Set<number>();
      currentPlayer.timeline.forEach((s) => usedYears.add(s.year));
      pDeck.forEach((s) => usedYears.add(s.year));

      // Search for new card
      let newCard: Song | undefined;
      const shuffledGlobal = shuffle([...hungarianSongs]);
      for (const song of shuffledGlobal) {
        if (!usedIds.has(song.id) && !usedYears.has(song.year)) {
          newCard = song;
          break;
        }
      }

      if (newCard) {
        pDeck.push(newCard);
      } else {
        emitMessage(socket, "warning", "Nincs több új kártya a pakliban!");
      }

      currentPlayer.personalDeck = pDeck;

      io.to(roomCode).emit("music_playback_toggled", {
        deezerId: oldCard.deezerId,
        state: PLAYBACK_STATE.STOPPED,
      });

      io.to(roomCode).emit("card_discarded", {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        players: room.players,
        pointsEarned: SCORES.DISCARD_PENALTY,
      });

    } catch (error) {
      console.error("[discard_card] Critical error:", error);
      emitError(socket, ERROR_CODES.SERVER_ERROR, "Szerver hiba tortent a kartyaeldobas soran");
    }
  });

  // ------------------------ REQUEST NEXT TURN ------------------------
  socket.on("request_next_turn", (roomCode: string) => {
    try {
      const context = getAuthorizedTurnContext(socket, roomCode, roomsData);
      if (!context) return;

      const { room } = context;

      if (room.turnLocked) {
        emitError(socket, ERROR_CODES.ACTION_IN_PROGRESS, "Már folyamatban van a körváltás!");
        return;
      }

      // Check if the player has already acted
      if (room.activeCard) {
        emitError(socket, ERROR_CODES.NO_ACTIVE_CARD, "Még van aktív kártya! Helyezd el vagy dobd el!");
        return;
      }

      room.turnLocked = true;
      room.turnIndex = (room.turnIndex + 1) % room.players.length;

      io.to(roomCode).emit("turn_changed", {
        currentTurn: room.players[room.turnIndex].id,
        players: room.players,
      });

    } catch (error) {
      console.error("[request_next_turn] Critical error:", error);
      emitError(socket, ERROR_CODES.SERVER_ERROR, "Szerver hiba történt a körváltás során");
    }
  });

  // ------------------------ UPDATE PENDING INDEX ------------------------
  socket.on("update_pending_index", (data: { roomCode: string; index: number | null }) => {
    try {
      const context = getAuthorizedTurnContext(socket, data.roomCode, roomsData);
      if (!context) return;

      const { room, currentPlayer } = context;

      // Only allow if there is an active card
      if (!room.activeCard) {
        return;
      }

      if (
        data.index !== null &&
        (!Number.isInteger(data.index) ||
          data.index < 0 ||
          data.index > currentPlayer.timeline.length)
      ) {
        return;
      }

      currentPlayer.pendingIndex = data.index;

      // Only send it to others
      socket.to(data.roomCode).emit("player_pending_updated", {
        playerId: socket.id,
        index: data.index,
      });

    } catch (error) {
      console.error("[update_pending_index] Critical error:", error);
    }
  });

  // ------------------------ SYNCHRONIZE PLAYBACK STATE ------------------------
  socket.on("toggle_music_playback", (data: { roomCode: string; deezerId: string; state: number }) => {
  try {
    const context = getAuthorizedTurnContext(socket, data.roomCode, roomsData);
    if (!context) return;
    const { room } = context;

    // Only synchronize if room settings allow it
    if (!room.syncMusic) return;

    // VALIDATION: Only allow valid states
    const validStates = Object.values(PLAYBACK_STATE) as number[];
    if (!validStates.includes(data.state)) return;

    // VALIDATION: deezerId cannot be empty
    if (!data.deezerId || data.deezerId.trim().length === 0) return;

    // UPDATE: ONLY AFTER VALIDATIONS!
    room.currentPlayingDeezerId = data.deezerId;
    room.playbackState = data.state;

    // Notify all clients in the room about the new playback state
    io.to(data.roomCode).emit("music_playback_toggled", {
      deezerId: data.deezerId,
      state: data.state,
    });

  } catch (error) {
    console.error("[toggle_music_playback] Critical error:", error);
  }
});

  // ------------------------ SYNCHRONIZE SEEK ------------------------
  socket.on("seek_music_playback", (data: { roomCode: string; position: number }) => {
    try {
      const context = getAuthorizedTurnContext(socket, data.roomCode, roomsData);
      if (!context) return;
      const { room } = context;

      // Only synchronize if room settings allow it
      if (!room.syncMusic) return;

      // Notify all clients in the room about the new position
      io.to(data.roomCode).emit("music_seeked", {
        position: data.position,
      });

    } catch (error) {
      console.error("[seek_music_playback] Critical error:", error);
    }
  });
};