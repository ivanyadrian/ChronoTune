import { useState, useEffect } from "react";

interface UseMusicSyncProps {
  currentSong: any;
  roomCode?: string | null;
  syncMusic: boolean;
  isMyTurn: boolean;
  musicPlaybackState: number;
  musicPlaybackDeezerId: string | null;
  musicSeekTo: number | null;
  toggleMusicPlayback: (data: { roomCode: string; deezerId: string; state: number }) => void;
  seekMusicPlayback: (data: { roomCode: string; position: number }) => void;
}

export const useMusicSync = ({
  currentSong,
  roomCode,
  syncMusic,
  isMyTurn,
  musicPlaybackState,
  musicPlaybackDeezerId,
  musicSeekTo,
  toggleMusicPlayback,
  seekMusicPlayback,
}: UseMusicSyncProps) => {
  const [playbackState, setPlaybackState] = useState<number>(-1);
  const [localSeekTo, setLocalSeekTo] = useState<number | null>(null);

  // Synchronization with server state
  useEffect(() => {
    if (!currentSong?.deezerId) return;
    if (!musicPlaybackDeezerId) return;
    if (musicPlaybackDeezerId !== currentSong.deezerId) return;

    if (musicPlaybackState === 1 || musicPlaybackState === 0) {
      setPlaybackState(musicPlaybackState);
    }
  }, [musicPlaybackState, musicPlaybackDeezerId, currentSong?.deezerId]);

  const handleTogglePlay = () => {
    if (!currentSong || !roomCode) return;
    if (syncMusic && !isMyTurn) return;

    const nextState = playbackState === 1 ? 0 : 1;
    setPlaybackState(nextState);

    if (syncMusic) {
      toggleMusicPlayback({
        roomCode,
        deezerId: currentSong.deezerId,
        state: nextState,
      });
    }
  };

  const handleSeek = (newPosition: number) => {
    if (!currentSong || !roomCode) return;
    if (syncMusic && !isMyTurn) return;

    if (syncMusic) {
      seekMusicPlayback({ roomCode, position: newPosition });
    } else {
      setLocalSeekTo(newPosition);
      setTimeout(() => setLocalSeekTo(null), 100);
    }
  };

  // Reset playback on new song
  useEffect(() => {
    setPlaybackState(-1);
  }, [currentSong]);

  return {
    playbackState,
    setPlaybackState,
    localSeekTo,
    musicSeekTo: syncMusic ? musicSeekTo : localSeekTo,
    handleTogglePlay,
    handleSeek,
  };
};