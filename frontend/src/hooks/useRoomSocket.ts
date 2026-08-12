import React, { useState, useEffect, useCallback, useRef } from "react";
import { socket } from "../socket";
import type { RoomConfigData } from "../types";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { getStoredWeeklyRunId } from "../utils/storageUtils";
import { useLanguage } from "../context/LanguageContext";

export const useRoomSocket = () => {
  const { t } = useLanguage();
  // Use a ref so socket handlers always have the latest translations
  // without needing to re-register listeners on every language change
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [targetLength, setTargetLength] = useState(10);
  const [isSolo, setIsSolo] = useState(false);
  const [isWeekly, setIsWeekly] = useState(false);
  const [weeklyElapsedMs, setWeeklyElapsedMs] = useState(0);
  const [syncMusic, setSyncMusic] = useState(true);
  const [songLibrary, setSongLibrary] = useState<'hu' | 'en'>('hu');
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "leave" | "error";
    icon?: React.ReactNode;
  } | null>(null);

  // Auto clear error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const resetRoomState = useCallback(() => {
    setRoomCode(null);
    setIsHost(false);
    setPlayers([]);
    setError("");
    setTargetLength(10);
    setToast(null);
    setIsSolo(false);
    setIsWeekly(false);
    setWeeklyElapsedMs(0);
    setSongLibrary('hu');
  }, []);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);

    const onDisconnect = () => {
      setIsConnected(false);
      resetRoomState();
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
      if (data.syncMusic !== undefined) setSyncMusic(data.syncMusic);
      if (data.songLibrary) setSongLibrary(data.songLibrary);
    };

    const onError = (msg: string) => triggerToast(msg, "error");
    const onGameError = (data: { code: string; message: string }) => {
      triggerToast(data.message, "error");
    };

    const onPlayerJoined = (userName: string) => {
      triggerToast(tRef.current.playerJoined(userName), "info");
    };

    const onPlayerLeft = (data: { playerName: string }) => {
      triggerToast(tRef.current.playerLeft(data.playerName), "leave");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_created", onRoomCreated);
    socket.on("joined_success", onJoinedSuccess);
    socket.on("update_players", onUpdatePlayers);
    socket.on("is_host", onIsHost);
    socket.on("room_config_updated", onRoomConfig);
    socket.on("error", onError);
    socket.on("game_error", onGameError);
    socket.on("player_joined", onPlayerJoined);
    socket.on("player_left", onPlayerLeft);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_created", onRoomCreated);
      socket.off("joined_success", onJoinedSuccess);
      socket.off("update_players", onUpdatePlayers);
      socket.off("is_host", onIsHost);
      socket.off("room_config_updated", onRoomConfig);
      socket.off("error", onError);
      socket.off("game_error", onGameError);
      socket.off("player_joined", onPlayerJoined);
      socket.off("player_left", onPlayerLeft);
    };
  }, [resetRoomState, triggerToast]);

  const createRoom = useCallback(
    (
      userName: string,
      targetLengthParam: number,
      isSoloParam: boolean = false,
      maxMistakesParam: number | null = null,
      syncMusicParam: boolean = true,
      songLibraryParam: 'hu' | 'en' = 'hu',
    ) => {
      socket.emit("create_room", {
        userName,
        targetLength: targetLengthParam,
        isSolo: isSoloParam,
        maxMistakes: maxMistakesParam,
        syncMusic: syncMusicParam,
        songLibrary: songLibraryParam,
      });
    },
    [],
  );

  const createWeeklyRoom = useCallback(
    async (userName: string) => {
      const storedRunId = getStoredWeeklyRunId();
      let fingerprint = "";

      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        fingerprint = result.visitorId;
      } catch (err) {
        console.error("Failed to get browser fingerprint:", err);
      }

      socket.emit("create_room", {
        userName,
        targetLength: 20,
        isSolo: true,
        isWeekly: true,
        runId: storedRunId || undefined,
        fingerprint,
      });
    },
    [],
  );

  const joinRoom = useCallback((code: string, userName: string) => {
    socket.emit("join_room", { code: code.toUpperCase(), userName });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit("leave_room");
    resetRoomState();
  }, [resetRoomState]);

  const updateRoomConfig = useCallback(
    (config: {
      targetLength?: number;
      syncMusic?: boolean;
      maxMistakes?: number | null;
      songLibrary?: 'hu' | 'en';
    }) => {
      if (roomCode) {
        socket.emit("update_room_config", {
          roomCode,
          ...config,
        });
      }
    },
    [roomCode],
  );

  return {
    isConnected,
    roomCode,
    isHost,
    players,
    targetLength,
    isSolo,
    isWeekly,
    weeklyElapsedMs,
    syncMusic,
    songLibrary,
    error,
    toast,
    setRoomCode,
    setIsHost,
    setPlayers,
    setTargetLength,
    setIsSolo,
    setIsWeekly,
    setWeeklyElapsedMs,
    setSyncMusic,
    setSongLibrary,
    setError,
    triggerToast,
    resetRoomState,
    createRoom,
    createWeeklyRoom,
    joinRoom,
    leaveRoom,
    updateRoomConfig,
  };
};
