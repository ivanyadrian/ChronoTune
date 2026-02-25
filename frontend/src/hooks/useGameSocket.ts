import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import type { Player, Song } from "../types";

/**
 * Custom Hook a játék hálózati logikájának kezeléséhez.
 * Összefogja a socket eseményeket és reaktív állapotokat biztosít a komponenseknek.
 */
export const useGameSocket = () => {
  // --- HÁLÓZATI ÉS SZOBA ÁLLAPOTOK ---
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<string[]>([]); // Csak nevek (lobbyhoz)
  const [allPlayers, setAllPlayers] = useState<Player[]>([]); // Teljes adatszerkezet (játékhoz)

  // --- JÁTÉKMENET ÁLLAPOTOK ---
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null); // A jelenleg húzott kártya
  const [winner, setWinner] = useState<{ name: string; timeline: any[] } | null>(null);
  const [error, setError] = useState("");
  const [mistakes, setMistakes] = useState(0); // Hibák számlálása (Solo módhoz)

  // --- UI ÉS FEEDBACK ÁLLAPOTOK ---
  const [gameMessage, setGameMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Referenciák az időzítőkhöz és a szinkronizációhoz, hogy elkerüljük a "stale closure" problémákat
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTurnRef = useRef<string | null>(null);

  // Szinkronizáljuk a ref-et a state-tel, hogy az időzítő belsejében is a friss értéket lássuk
  useEffect(() => {
    currentTurnRef.current = currentTurnId;
  }, [currentTurnId]);

  useEffect(() => {
    // --- SOCKET ESEMÉNYKEZELŐK ---
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onRoomCreated = (code: string) => setRoomCode(code);
    const onJoinedSuccess = (code: string) => {
      setRoomCode(code);
      setError("");
    };
    const onUpdatePlayers = (list: string[]) => setPlayers(list);
    const onIsHost = (val: boolean) => setIsHost(val);
    const onError = (msg: string) => setError(msg);

    const onGameStarted = (data: any) => {
      if (data.roomCode) setRoomCode(data.roomCode); // Solo indításnál itt kapjuk meg a kódot
      setMistakes(0); // Új játéknál nullázzuk a hibákat
      setGameStarted(true);
      setCurrentTurnId(data.currentTurn);
      setAllPlayers(data.players);
    };

    const onTurnChanged = (data: any) => {
      setCurrentTurnId(data.currentTurn);
      setAllPlayers(data.players);
    };

    const onNewCardDrawn = (song: Song) => setCurrentSong(song);

    /**
     * Kártyalehelyezés eredményének kezelése.
     * Megjeleníti a visszajelzést (Siker/Hiba) és elindítja a visszaszámlálást a következő körig.
     */
    const onPlacementResult = (data: any) => {
      if (timerRef.current) clearInterval(timerRef.current);

      // Ha rossz a tipp, növeljük a lokális hibaszámlálót
      if (!data.success) {
        setMistakes(prev => prev + 1);
      }

      setAllPlayers(data.players);
      setCurrentSong(null); // Eltüntetjük a "kezedben lévő" kártyát
      setGameMessage({
        text: data.success ? `${data.playerName} JÓL TIPPELT!` : `${data.playerName} ELRONTOTTA!`,
        isSuccess: data.success,
      });

      // Vizuális visszaszámlálás a körváltásig (2 másodperc)
      let timeLeft = 2;
      setCountdown(timeLeft);

      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameMessage(null);
          setCountdown(null);
          
          // Csak akkor küldjük el a körváltási kérést, ha mi vagyunk az aktív játékosok
          if (currentTurnRef.current === socket.id) {
            socket.emit("request_next_turn", roomCode);
          }
        }
      }, 1000);
    };

    const onGameOver = (data: any) => {
      setWinner({ name: data.winnerName, timeline: data.finalTimeline });
      setGameStarted(false);
    };

    // ESEMÉNYEK FELIRATKOZÁSA
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_created", onRoomCreated);
    socket.on("joined_success", onJoinedSuccess);
    socket.on("update_players", onUpdatePlayers);
    socket.on("is_host", onIsHost);
    socket.on("error", onError);
    socket.on("game_started", onGameStarted);
    socket.on("turn_changed", onTurnChanged);
    socket.on("new_card_drawn", onNewCardDrawn);
    socket.on("placement_result", onPlacementResult);
    socket.on("game_over", onGameOver);

    // TAKARÍTÁS (Cleanup): Megakadályozza a memóriaszivárgást és a többszörös feliratkozást
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_created", onRoomCreated);
      socket.off("joined_success", onJoinedSuccess);
      socket.off("update_players", onUpdatePlayers);
      socket.off("is_host", onIsHost);
      socket.off("error", onError);
      socket.off("game_started", onGameStarted);
      socket.off("turn_changed", onTurnChanged);
      socket.off("new_card_drawn", onNewCardDrawn);
      socket.off("placement_result", onPlacementResult);
      socket.off("game_over", onGameOver);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomCode]); // Újraindul, ha megváltozik a szobakód

  // --- PUBLIKUS AKCIÓK (A UI hívja meg őket) ---
  const createRoom = (userName: string, targetLength: number, isSolo: boolean = false) => {
    socket.emit("create_room", { userName, targetLength, isSolo });
  };

  const joinRoom = (code: string, userName: string) => {
    socket.emit("join_room", { code: code.toUpperCase(), userName });
  };

  const startGame = () => {
    socket.emit("start_game", roomCode);
  };

  const drawCard = () => {
    socket.emit("draw_card", roomCode);
  };

  const placeCard = (index: number) => {
    if (currentSong) {
      socket.emit("place_card", { roomCode, cardId: currentSong.id, index });
    }
  };

  // Visszaadjuk az összes állapotot és függvényt a komponensek számára
  return {
    isConnected, roomCode, isHost, players, allPlayers, gameStarted,
    currentTurnId, currentSong, winner, error, gameMessage, countdown, mistakes,
    createRoom, joinRoom, startGame, drawCard, placeCard, setRoomCode, setError
  };
};