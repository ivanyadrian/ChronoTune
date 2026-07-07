import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "../socket";
import type { Player, Song, PlacementResultData, GameStartedData, RoomConfigData } from "../types";

/**
 * Custom Hook for handling game network logic.
 * Combines socket events and provides reactive states to components.
 */
export const useGameSocket = () => {
  // --- NETWORK AND ROOM STATES ---
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [targetLength, setTargetLength] = useState(10);
  const [isSolo, setIsSolo] = useState(false);
  const [syncMusic, setSyncMusic] = useState(true);

  // --- GAMEPLAY STATES ---
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [winner, setWinner] = useState<{
    names?: string[];
    name: string;
    timeline: Song[];
    score?: number;
    allPlayers?: Player[];
  } | null>(null);
  const [lost, setLost] = useState(false);
  const [error, setError] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [maxMistakes, setMaxMistakes] = useState<number | null>(null);
  const [isRetryCard, setIsRetryCard] = useState(false);
  const [lastDelta, setLastDelta] = useState<{ [playerId: string]: number }>({});

  // --- MUSIC SYNCHRONIZATION ---
  const [musicPlaybackState, setMusicPlaybackState] = useState<number>(-1);
  const [musicPlaybackDeezerId, setMusicPlaybackDeezerId] = useState<string | null>(null);
  const [musicSeekTo, setMusicSeekTo] = useState<number | null>(null);

  // --- UI AND FEEDBACK STATES ---
  const [gameMessage, setGameMessage] = useState<{
    text: string;
    status: "success" | "error" | "info" | "gameOver" | "lastRound";
    bonusPoints?: number;
    pointsEarned?: number;
  } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "leave" | "error";
    icon?: React.ReactNode;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTurnRef = useRef<string | null>(null);
  const roomCodeRef = useRef<string | null>(null);

  // Synchronize refs with state
  useEffect(() => {
    currentTurnRef.current = currentTurnId;
  }, [currentTurnId]);

  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  // Auto clear error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Helper function to show toast (stabilized with useCallback)
  const triggerToast = useCallback(
    (
      message: string,
      type: "success" | "info" | "leave" | "error" = "info",
      icon?: React.ReactNode,
    ) => {
      setToast({ message, type, icon });
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    },
    [],
  );

  // --- FULL STATE RESET (stabilized) ---
  const resetState = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setRoomCode(null);
    setIsHost(false);
    setPlayers([]);
    setAllPlayers([]);
    setGameStarted(false);
    setCurrentTurnId(null);
    setCurrentSong(null);
    setWinner(null);
    setLost(false);
    setError("");
    setTargetLength(10);
    setMistakes(0);
    setMaxMistakes(null);
    setGameMessage(null);
    setCountdown(null);
    setToast(null);
    setLastDelta({});
    setMusicSeekTo(null);
    setIsSolo(false);
  }, []);

  useEffect(() => {
    // --- SOCKET EVENT HANDLERS ---
    const onConnect = () => setIsConnected(true);

    const onDisconnect = () => {
      setIsConnected(false);
      resetState();
    };

    const onRoomCreated = (code: string) => setRoomCode(code);

    const onJoinedSuccess = (code: string) => {
      setRoomCode(code);
      setError("");
    };

    const onUpdatePlayers = (list: string[]) => setPlayers(list);
    const onIsHost = (val: boolean) => setIsHost(val);

    const onRoomConfig = (data: RoomConfigData) => {
      if (data.targetLength) setTargetLength(data.targetLength);
      if (data.maxMistakes !== undefined) setMaxMistakes(data.maxMistakes);
      if (data.syncMusic !== undefined) setSyncMusic(data.syncMusic);
    };

    const onError = (msg: string) => triggerToast(msg, "error");

    const onGameStarted = (data: GameStartedData) => {
      if (data.roomCode) setRoomCode(data.roomCode);
      setMistakes(0);
      setLost(false);
      setMaxMistakes(data.maxMistakes ?? null);
      if (data.targetLength) setTargetLength(data.targetLength);
      setGameStarted(true);
      setCurrentTurnId(data.currentTurn);
      setAllPlayers(data.players);
      setIsSolo(!!data.isSolo);
    };

    const onTurnChanged = (data: { currentTurn: string; players: Player[] }) => {
      setCurrentTurnId(data.currentTurn);
      setAllPlayers(data.players);
    };

    interface NewCardData {
      id: number;
      title: string;
      artist: string;
      deezerId: string;
      cover: string;
      userName: string;
      playerId: string;
      isRetry?: boolean;
      players?: Player[];
    }

    const onNewCardDrawn = (data: NewCardData) => {
      setCurrentSong(data as unknown as Song);
      setMusicPlaybackState(-1);
      setMusicPlaybackDeezerId(null);
      setIsRetryCard(!!data.isRetry);

      if (data.isRetry) {
        const isMe = data.playerId === socket.id;
        if (isMe) {
          triggerToast("Ezt a kártyát eldobhatod.", "info");
        } else {
          triggerToast(`${data.userName} eldobhatja ezt a számot!`, "info");
        }
      }

      if (data.players) {
        setAllPlayers(data.players);
      }
    };

    const onPlayerJoined = (userName: string) => {
      triggerToast(`${userName} csatlakozott!`, "info");
    };

    interface CardDiscardedData {
      playerId: string;
      playerName: string;
      players: Player[];
      pointsEarned?: number;
    }

    const onCardDiscarded = (data: CardDiscardedData) => {
      setCurrentSong(null);
      setMusicPlaybackState(-1);
      setMusicPlaybackDeezerId(null);
      setAllPlayers(data.players);

      if (data.pointsEarned !== undefined && data.playerId) {
        setLastDelta((prev) => ({
          ...prev,
          [data.playerId]: data.pointsEarned!,
        }));
        setTimeout(() => {
          setLastDelta((prev) => ({ ...prev, [data.playerId]: 0 }));
        }, 3000);
      }

      if (data.playerId === socket.id) {
        triggerToast("Kártya eldobva. Húzz egy újat!", "info");
      } else {
        triggerToast(`${data.playerName} eldobta a kártyát.`, "info");
      }
    };

    const onPlayerLeft = (data: { playerName: string }) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setCurrentSong(null);
      triggerToast(`${data.playerName} kilépett.`, "leave");
    };

    const onPlayerPendingUpdated = (data: { playerId: string; index: number | null }) => {
      setAllPlayers((prev) =>
        prev.map((p) =>
          p.id === data.playerId ? { ...p, pendingIndex: data.index } : p,
        ),
      );
    };

    const onPlacementResult = (data: PlacementResultData) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (!data.success) {
        setMistakes((prev) => prev + 1);
      }

      if (data.pointsEarned !== undefined && data.activePlayerId) {
        setLastDelta((prev) => ({
          ...prev,
          [data.activePlayerId]: data.pointsEarned,
        }));
        setTimeout(() => {
          setLastDelta((prev) => ({ ...prev, [data.activePlayerId]: 0 }));
        }, 3000);
      }

      setAllPlayers(data.players);
      setCurrentSong(null);
      setMusicPlaybackState(-1);
      setMusicPlaybackDeezerId(null);
      const isSoloGame = data.players.length === 1;

      setGameMessage({
        text: isSoloGame
          ? data.success
            ? `HELYES TIPP!`
            : `HELYTELEN TIPP!`
          : data.success
            ? `${data.playerName} JÓL TIPPELT!`
            : `${data.playerName} ELRONTOTTA!`,
        status: data.success ? "success" : "error",
        bonusPoints: data.bonusPoints,
        pointsEarned: data.pointsEarned,
      });

      let timeLeft = 1.5;
      setCountdown(timeLeft);

      const updateCountdown = () => {
        timeLeft -= 0.5;
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          setGameMessage(null);
          setCountdown(null);

          if (data.isGameOver) {
            setGameMessage({
              text: isSoloGame
                ? "JÁTÉK VÉGE! Eredmény betöltése..."
                : "JÁTÉK VÉGE! Eredmények betöltése...",
              status: "gameOver",
            });
            return;
          }

          if (data.isLastRoundImminent) {
            setGameMessage({
              text: "UTOLSÓ FORDULÓ!",
              status: "lastRound",
            });

            setTimeout(() => {
              setGameMessage(null);
              if (data.activePlayerId === socket.id) {
                socket.emit("request_next_turn", roomCodeRef.current);
              }
            }, 1500);
          } else {
            if (data.activePlayerId === socket.id) {
              socket.emit("request_next_turn", roomCodeRef.current);
            }
          }
        } else {
          timerRef.current = setTimeout(updateCountdown, 500);
        }
      };

      timerRef.current = setTimeout(updateCountdown, 500);
    };

    interface GameOverData {
      winnerName: string | null;
      winnerNames?: string[];
      finalTimeline: Song[];
      lost?: boolean;
      mistakes?: number;
      score?: number;
      allPlayers?: Player[];
    }

    const onGameOver = (data: GameOverData) => {
      setGameMessage(null);
      setCountdown(null);
      if (data.lost) {
        setLost(true);
        if (typeof data.mistakes === "number") {
          setMistakes(data.mistakes);
        }
        setWinner({
          names: [""],
          name: "",
          timeline: data.finalTimeline ?? [],
          score: data.score ?? undefined,
          allPlayers: data.allPlayers || [],
        });
      } else {
        setWinner({
          names: data.winnerNames || [data.winnerName || ""],
          name: data.winnerName || "",
          timeline: data.finalTimeline,
          score: data.score ?? undefined,
          allPlayers: data.allPlayers || [],
        });
      }
      setGameStarted(false);
    };

    // --- MUSIC EVENTS ---
    interface MusicToggleData {
      deezerId: string;
      state: number;
    }

    const onMusicPlaybackToggled = (data: MusicToggleData) => {
      setMusicPlaybackState(data.state);
      setMusicPlaybackDeezerId(data.deezerId);
    };

    const onMusicSeeked = (data: { position: number }) => {
      setMusicSeekTo(data.position);
      setTimeout(() => setMusicSeekTo(null), 100);
    };

    const onGameError = (data: { code: string; message: string }) => {
      triggerToast(data.message, "error");
    };

    // --- EVENT SUBSCRIPTIONS ---
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_created", onRoomCreated);
    socket.on("joined_success", onJoinedSuccess);
    socket.on("update_players", onUpdatePlayers);
    socket.on("is_host", onIsHost);
    socket.on("room_config_updated", onRoomConfig);
    socket.on("error", onError);
    socket.on("game_error", onGameError);
    socket.on("game_started", onGameStarted);
    socket.on("player_joined", onPlayerJoined);
    socket.on("turn_changed", onTurnChanged);
    socket.on("new_card_drawn", onNewCardDrawn);
    socket.on("card_discarded", onCardDiscarded);
    socket.on("player_left", onPlayerLeft);
    socket.on("player_pending_updated", onPlayerPendingUpdated);
    socket.on("placement_result", onPlacementResult);
    socket.on("game_over", onGameOver);
    socket.on("music_playback_toggled", onMusicPlaybackToggled);
    socket.on("music_seeked", onMusicSeeked);

    // --- CLEANUP ---
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_created");
      socket.off("joined_success");
      socket.off("update_players");
      socket.off("is_host");
      socket.off("room_config_updated");
      socket.off("error");
      socket.off("game_started");
      socket.off("player_joined");
      socket.off("turn_changed");
      socket.off("new_card_drawn");
      socket.off("card_discarded");
      socket.off("player_left");
      socket.off("player_pending_updated");
      socket.off("placement_result");
      socket.off("game_over");
      socket.off("music_playback_toggled");
      socket.off("music_seeked");
      socket.off("game_error");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [roomCode, resetState, triggerToast]);

  // --- PUBLIC ACTIONS ---
  const createRoom = useCallback(
    (
      userName: string,
      targetLengthParam: number,
      isSoloParam: boolean = false,
      maxMistakesParam: number | null = null,
      syncMusicParam: boolean = true,
    ) => {
      socket.emit("create_room", {
        userName,
        targetLength: targetLengthParam,
        isSolo: isSoloParam,
        maxMistakes: maxMistakesParam,
        syncMusic: syncMusicParam,
      });
    },
    [],
  );

  const joinRoom = useCallback((code: string, userName: string) => {
    socket.emit("join_room", { code: code.toUpperCase(), userName });
  }, []);

  const startGame = useCallback(() => {
    if (players.length < 2) {
      triggerToast(
        "A többjátékos módhoz legalább 2 játékosra van szükség!",
        "error",
      );
      return;
    }
    socket.emit("start_game", roomCode);
  }, [players.length, roomCode, triggerToast]);

  const drawCard = useCallback(() => {
    socket.emit("draw_card", roomCode);
  }, [roomCode]);

  const placeCard = useCallback((index: number) => {
    if (currentSong) {
      socket.emit("place_card", { roomCode, cardId: currentSong.id, index });
    }
  }, [roomCode, currentSong]);

  const discardCard = useCallback(() => {
    socket.emit("discard_card", roomCode);
  }, [roomCode]);

  const leaveRoom = useCallback(() => {
    socket.emit("leave_room");
    resetState();
  }, [resetState]);

  const updateRoomConfig = useCallback((config: {
    targetLength?: number;
    syncMusic?: boolean;
    maxMistakes?: number | null;
  }) => {
    socket.emit("update_room_config", {
      roomCode,
      ...config,
    });
  }, [roomCode]);

  const onUpdatePending = useCallback((index: number | null) => {
    socket.emit("update_pending_index", { roomCode, index });
  }, [roomCode]);

  const toggleMusicPlayback = useCallback((data: { roomCode: string; deezerId: string; state: number }) => {
    socket.emit("toggle_music_playback", data);
  }, []);

  const seekMusicPlayback = useCallback((data: { roomCode: string; position: number }) => {
    socket.emit("seek_music_playback", data);
  }, []);

  return {
    isConnected,
    roomCode,
    isHost,
    players,
    allPlayers,
    gameStarted,
    targetLength,
    syncMusic,
    currentTurnId,
    currentSong,
    winner,
    lost,
    error,
    gameMessage,
    countdown,
    mistakes,
    maxMistakes,
    createRoom,
    joinRoom,
    startGame,
    discardCard,
    drawCard,
    placeCard,
    leaveRoom,
    setRoomCode,
    setError,
    toast,
    triggerToast,
    updateRoomConfig,
    isRetryCard,
    lastDelta,
    isSolo,
    onUpdatePending,
    toggleMusicPlayback,
    musicPlaybackState,
    seekMusicPlayback,
    musicSeekTo,
    musicPlaybackDeezerId,
  };
};