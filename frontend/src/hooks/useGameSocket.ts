import { useCallback } from "react";
import { useRoomSocket } from "./useRoomSocket";
import { useAudioSyncSocket } from "./useAudioSyncSocket";
import { useGameplaySocket } from "./useGameplaySocket";

/**
 * Custom Hook for handling game network logic.
 * Orchestrates useRoomSocket, useGameplaySocket, and useAudioSyncSocket.
 */
export const useGameSocket = () => {
  const roomSocket = useRoomSocket();
  const audioSyncSocket = useAudioSyncSocket();

  const gameplaySocket = useGameplaySocket(
    roomSocket.roomCode,
    roomSocket.triggerToast,
    roomSocket.resetRoomState,
    audioSyncSocket.resetAudioSyncState,
    roomSocket.setIsSolo,
    roomSocket.setIsWeekly,
    roomSocket.setWeeklyElapsedMs,
    roomSocket.setTargetLength,
    roomSocket.setRoomCode,
  );

  const resetState = useCallback(() => {
    roomSocket.resetRoomState();
    audioSyncSocket.resetAudioSyncState();
    gameplaySocket.resetGameplayState();
  }, [roomSocket, audioSyncSocket, gameplaySocket]);

  const startGame = useCallback(() => {
    gameplaySocket.startGame(roomSocket.players.length);
  }, [gameplaySocket, roomSocket.players.length]);

  const leaveRoom = useCallback(() => {
    roomSocket.leaveRoom();
    resetState();
  }, [roomSocket, resetState]);

  return {
    // Room states & actions
    isConnected: roomSocket.isConnected,
    roomCode: roomSocket.roomCode,
    isHost: roomSocket.isHost,
    players: roomSocket.players,
    targetLength: roomSocket.targetLength,
    isSolo: roomSocket.isSolo,
    isWeekly: roomSocket.isWeekly,
    weeklyElapsedMs: roomSocket.weeklyElapsedMs,
    syncMusic: roomSocket.syncMusic,
    error: roomSocket.error,
    toast: roomSocket.toast,
    setRoomCode: roomSocket.setRoomCode,
    setError: roomSocket.setError,
    triggerToast: roomSocket.triggerToast,
    createRoom: roomSocket.createRoom,
    createWeeklyRoom: roomSocket.createWeeklyRoom,
    joinRoom: roomSocket.joinRoom,
    leaveRoom,
    updateRoomConfig: roomSocket.updateRoomConfig,

    // Gameplay states & actions
    allPlayers: gameplaySocket.allPlayers,
    gameStarted: gameplaySocket.gameStarted,
    currentTurnId: gameplaySocket.currentTurnId,
    currentSong: gameplaySocket.currentSong,
    winner: gameplaySocket.winner,
    lost: gameplaySocket.lost,
    mistakes: gameplaySocket.mistakes,
    maxMistakes: gameplaySocket.maxMistakes,
    isRetryCard: gameplaySocket.isRetryCard,
    lastDelta: gameplaySocket.lastDelta,
    gameMessage: gameplaySocket.gameMessage,
    countdown: gameplaySocket.countdown,
    startGame,
    discardCard: gameplaySocket.discardCard,
    drawCard: gameplaySocket.drawCard,
    placeCard: gameplaySocket.placeCard,
    onUpdatePending: gameplaySocket.onUpdatePending,

    // Audio sync states & actions
    toggleMusicPlayback: audioSyncSocket.toggleMusicPlayback,
    musicPlaybackState: audioSyncSocket.musicPlaybackState,
    seekMusicPlayback: audioSyncSocket.seekMusicPlayback,
    musicSeekTo: audioSyncSocket.musicSeekTo,
    musicPlaybackDeezerId: audioSyncSocket.musicPlaybackDeezerId,
  };
};