import { Server, Socket } from "socket.io";
import type { Room } from "../types.ts";

export const registerGameHandlers = (
  io: Server,
  socket: Socket,
  roomsData: Record<string, Room>,
) => {

  socket.on("draw_card", (roomCode: string) => {
    const room = roomsData[roomCode];
    if (!room || !room.gameStarted) return;

    const currentPlayer = room.players[room.turnIndex];
    if (socket.id !== currentPlayer.id) return;

    if (room.deck.length > 0) {
      const nextCard = room.deck.pop()!;
      room.activeCard = nextCard;

      io.to(roomCode).emit("new_card_drawn", {
        id: nextCard.id,
        title: nextCard.title,
        artist: nextCard.artist,
        youtubeId: nextCard.youtubeId,
        userName: currentPlayer.name,
      });
    }
  });

  socket.on(
    "place_card",
    (data: { roomCode: string; cardId: number; index: number }) => {
      const room = roomsData[data.roomCode];
      if (!room || socket.id !== room.players[room.turnIndex].id) return;

      room.turnLocked = false;
      const player = room.players.find((p) => p.id === socket.id);
      const fullCard = room.activeCard;

      if (!player || !fullCard || fullCard.id !== data.cardId) return;

      let isCorrect = true;
      const { timeline } = player;

      if (data.index > 0 && timeline[data.index - 1].year > fullCard.year)
        isCorrect = false;
      if (
        data.index < timeline.length &&
        timeline[data.index].year < fullCard.year
      )
        isCorrect = false;

      if (isCorrect) {
        player.timeline.splice(data.index, 0, fullCard);
        if (player.timeline.length >= room.targetLength) {
          io.to(data.roomCode).emit("game_over", {
            winnerName: player.name,
            finalTimeline: player.timeline,
          });
          return;
        }
      } else {
        room.deck.push(fullCard);
        room.deck.sort(() => Math.random() - 0.5);
      }

      io.to(data.roomCode).emit("placement_result", {
        success: isCorrect,
        playerName: player.name,
        activePlayerId: player.id,
        cardYear: fullCard.year,
        players: room.players,
      });
    },
  );

  socket.on("request_next_turn", (roomCode: string) => {
    const room = roomsData[roomCode];
    if (!room || room.turnLocked) return;

    room.turnLocked = true;
    room.turnIndex = (room.turnIndex + 1) % room.players.length;

    io.to(roomCode).emit("turn_changed", {
      currentTurn: room.players[room.turnIndex].id,
      players: room.players,
    });
  });
};
