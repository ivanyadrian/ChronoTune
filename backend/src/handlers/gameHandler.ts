import { Server, Socket } from "socket.io";
import type { Room } from "../types.js";
import { shuffle } from "../utils/shuffle.js";

// A konkrét játékmenet eseményeit (húzás, kártyalehelyezés, körváltás) kezelő modul.

export const registerGameHandlers = (
  io: Server,
  socket: Socket,
  roomsData: Record<string, Room>,
) => {
  
  // --- KÁRTYAHÚZÁS (DRAW CARD) ---
  socket.on("draw_card", (roomCode: string) => {
    const room = roomsData[roomCode];

    // Ellenőrizzük, hogy létezik-e a szoba és elindult-e már a játék
    if (!room || !room.gameStarted) return;

    // Csak az a játékos húzhat, akinek éppen a köre van
    const currentPlayer = room.players[room.turnIndex];
    if (socket.id !== currentPlayer.id) return;

    // Ha van még kártya a pakliban, kiveszünk egyet
    if (room.deck.length > 0) {
      const nextCard = room.deck.pop()!;

      // Eltároljuk a szerveren, mint aktuálisan aktív (húzott) kártyát
      room.activeCard = nextCard;

      // Kiküldjük a kártya adatait a dátum kivételével
      io.to(roomCode).emit("new_card_drawn", {
        id: nextCard.id,
        title: nextCard.title,
        artist: nextCard.artist,
        deezerId: nextCard.deezerId,
        cover: nextCard.cover,
        userName: currentPlayer.name,
      });
    }
  });

  //Segédfüggvény: A dátumot egyetlen összehasonlítható számmá alakítja (pl.: 2001310109).
  const getVal = (c: any) => c.year * 10000 + c.month * 100 + c.day;


  // --- KÁRTYA LEHELYEZÉSE (PLACE CARD) ---
  socket.on(
    "place_card",
    (data: { roomCode: string; cardId: number; index: number }) => {
      const room = roomsData[data.roomCode];
      
      // Validáció: Szoba létezik, játék megy, és a megfelelő játékos küldte a kérést
      if (!room || !room.gameStarted) return;
      const currentPlayer = room.players[room.turnIndex];
      if (socket.id !== currentPlayer.id) return;

      // Feloldjuk a kör-zárat, hogy a kliens kérhesse a következő kört a tipp után
      room.turnLocked = false;
      
      const fullCard = room.activeCard;
      // Biztonsági ellenőrzés: A kliens által küldött ID egyezik-e a szerver által tárolt aktív kártyával
      if (!fullCard || fullCard.id !== data.cardId) return;

      const { timeline } = currentPlayer;
      const newVal = getVal(fullCard);
      let isCorrect = true;

      // --- ÖSSZEHASONLÍTÁSI LOGIKA ---
      //Megnézzük, hogy a kiválasztott indexen a kártya a megfelelő helyen van-e

      // 1. Ellenőrzés a bal oldali szomszédhoz (ha nem a legelső helyre tette)
      if (data.index > 0) {
        const prevVal = getVal(timeline[data.index - 1]);
        if (prevVal > newVal) isCorrect = false;
      }

      // 2. Ellenőrzés a jobb oldali szomszédhoz (ha nem a legutolsó helyre tette)
      if (data.index < timeline.length) {
        const nextVal = getVal(timeline[data.index]);
        if (nextVal < newVal) isCorrect = false;
      }

      // --- EREDMÉNY KEZELÉSE ---
      if (isCorrect) {
        // Helyes tipp: beszúrjuk a kártyát az idővonal megfelelő pontjára
        currentPlayer.timeline.splice(data.index, 0, fullCard);

        // Győzelem ellenőrzése: Elérte-e a játékos a cél-hosszúságot?
        if (currentPlayer.timeline.length >= room.targetLength) {
          io.to(data.roomCode).emit("game_over", {
            winnerName: currentPlayer.name,
            finalTimeline: currentPlayer.timeline,
          });
          return;
        }
      } else {
        // Hibás tipp: a kártya visszamegy a pakliba, amit újra megkeverünk
        currentPlayer.mistakes += 1; // Szerver oldali hibaszámláló növelése
        room.deck.push(fullCard);
        room.deck = shuffle(room.deck);
      }

      // Miután a kártya lekerült a "játékos kezéből", töröljük az aktív kártya státuszt
      room.activeCard = undefined;

      // Eredmény kiküldése: Itt már felfedjük a kártya pontos dátumát a klienseknek
      io.to(data.roomCode).emit("placement_result", {
        success: isCorrect,
        playerName: currentPlayer.name,
        activePlayerId: currentPlayer.id,
        cardYear: fullCard.year,
        cardMonth: fullCard.month,
        cardDay: fullCard.day,
        fullDate: fullCard.fullDate,
        players: room.players, // Frissített állapot (idővonalak, hibapontok)
      });
    }
  );

  // --- KÖVETKEZŐ KÖR KÉRÉSE (REQUEST NEXT TURN) ---
  socket.on("request_next_turn", (roomCode: string) => {
    const room = roomsData[roomCode];
    // Ha a kör már le van zárva (várakozás), nem engedünk többszöri váltást
    if (!room || room.turnLocked) return;

    room.turnLocked = true;
    // Léptetjük a turnIndex-et (körforgásszerűen a játékosok között)
    room.turnIndex = (room.turnIndex + 1) % room.players.length;

    // Értesítjük a szobát, hogy ki a következő aktív játékos
    io.to(roomCode).emit("turn_changed", {
      currentTurn: room.players[room.turnIndex].id,
      players: room.players,
    });
  });
};