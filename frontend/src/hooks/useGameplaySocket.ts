import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "../socket";
import type { Player, Song, PlacementResultData, GameStartedData } from "../types";
import { setStoredWeeklyRunId, removeStoredWeeklyRunId } from "../utils/storageUtils";

interface WinnerData {
  names?: string[];
  name: string;
  timeline: Song[];
  score?: number;
  allPlayers?: Player[];
  isWeekly?: boolean;
  weeklyTimeInSeconds?: number;
  weeklyMistakes?: number;
  weekIdentifier?: string;
}

interface GameMessageData {
  text: string;
  status: "success" | "error" | "info" | "gameOver" | "lastRound";
  bonusPoints?: number;
  pointsEarned?: number;
}

export const useGameplaySocket = (
  roomCode: string | null,
  triggerToast: (message: string, type?: "success" | "info" | "leave" | "error") => void,
  resetRoomState: () => void,
  resetAudioSyncState: () => void,
  setIsSolo: (val: boolean) => void,
  setIsWeekly: (val: boolean) => void,
  setWeeklyElapsedMs: (val: number) => void,
  setTargetLength: (val: number) => void,
  setRoomCode: (val: string | null) => void,
) => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [winner, setWinner] = useState<WinnerData | null>(null);
  const [lost, setLost] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [maxMistakes, setMaxMistakes] = useState<number | null>(null);
  const [isRetryCard, setIsRetryCard] = useState(false);
  const [lastDelta, setLastDelta] = useState<{ [playerId: string]: number }>({});
  const [gameMessage, setGameMessage] = useState<GameMessageData | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomCodeRef = useRef<string | null>(null);

  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  const resetGameplayState = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAllPlayers([]);
    setGameStarted(false);
    setCurrentTurnId(null);
    setCurrentSong(null);
    setWinner(null);
    setLost(false);
    setMistakes(0);
    setMaxMistakes(null);
    setGameMessage(null);
    setCountdown(null);
    setLastDelta({});
    setIsRetryCard(false);
  }, []);

  useEffect(() => {
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
      setIsWeekly(!!data.isWeekly);
      setWeeklyElapsedMs(data.weeklyElapsedMs ?? 0);
      if (data.isWeekly && data.runId) {
        setStoredWeeklyRunId(data.runId);
      }
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
      resetAudioSyncState();
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

    interface CardDiscardedData {
      playerId: string;
      playerName: string;
      players: Player[];
      pointsEarned?: number;
    }

    const onCardDiscarded = (data: CardDiscardedData) => {
      setCurrentSong(null);
      resetAudioSyncState();
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
      resetAudioSyncState();

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
      isWeekly?: boolean;
      weeklyTimeInSeconds?: number;
      weeklyMistakes?: number;
      weekIdentifier?: string;
    }

    const onGameOver = (data: GameOverData) => {
      setGameMessage(null);
      setCountdown(null);
      if (data.isWeekly) {
        removeStoredWeeklyRunId();
        setWinner({
          names: [data.winnerName || ""],
          name: data.winnerName || "",
          timeline: data.finalTimeline,
          score: data.score ?? undefined,
          allPlayers: data.allPlayers || [],
          isWeekly: true,
          weeklyTimeInSeconds: data.weeklyTimeInSeconds,
          weeklyMistakes: data.weeklyMistakes,
          weekIdentifier: data.weekIdentifier,
        });
      } else if (data.lost) {
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

    socket.on("game_started", onGameStarted);
    socket.on("turn_changed", onTurnChanged);
    socket.on("new_card_drawn", onNewCardDrawn);
    socket.on("card_discarded", onCardDiscarded);
    socket.on("player_pending_updated", onPlayerPendingUpdated);
    socket.on("placement_result", onPlacementResult);
    socket.on("game_over", onGameOver);

    return () => {
      socket.off("game_started", onGameStarted);
      socket.off("turn_changed", onTurnChanged);
      socket.off("new_card_drawn", onNewCardDrawn);
      socket.off("card_discarded", onCardDiscarded);
      socket.off("player_pending_updated", onPlayerPendingUpdated);
      socket.off("placement_result", onPlacementResult);
      socket.off("game_over", onGameOver);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    resetAudioSyncState,
    resetRoomState,
    setIsSolo,
    setIsWeekly,
    setRoomCode,
    setTargetLength,
    setWeeklyElapsedMs,
    triggerToast,
  ]);

  const startGame = useCallback((playersLength: number) => {
    if (playersLength < 2) {
      triggerToast(
        "A többjátékos módhoz legalább 2 játékosra van szükség!",
        "error",
      );
      return;
    }
    socket.emit("start_game", roomCode);
  }, [roomCode, triggerToast]);

  const drawCard = useCallback(() => {
    socket.emit("draw_card", roomCode);
  }, [roomCode]);

  const placeCard = useCallback(
    (index: number) => {
      if (currentSong) {
        socket.emit("place_card", { roomCode, cardId: currentSong.id, index });
      }
    },
    [roomCode, currentSong],
  );

  const discardCard = useCallback(() => {
    socket.emit("discard_card", roomCode);
  }, [roomCode]);

  const onUpdatePending = useCallback(
    (index: number | null) => {
      socket.emit("update_pending_index", { roomCode, index });
    },
    [roomCode],
  );

  return {
    allPlayers,
    gameStarted,
    currentTurnId,
    currentSong,
    winner,
    lost,
    mistakes,
    maxMistakes,
    isRetryCard,
    lastDelta,
    gameMessage,
    countdown,
    setAllPlayers,
    setGameStarted,
    setWinner,
    setLost,
    setMistakes,
    setMaxMistakes,
    resetGameplayState,
    startGame,
    drawCard,
    placeCard,
    discardCard,
    onUpdatePending,
  };
};
