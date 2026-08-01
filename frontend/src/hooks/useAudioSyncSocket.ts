import { useState, useEffect, useCallback } from "react";
import { socket } from "../socket";

export const useAudioSyncSocket = () => {
  const [musicPlaybackState, setMusicPlaybackState] = useState<number>(-1);
  const [musicPlaybackDeezerId, setMusicPlaybackDeezerId] = useState<string | null>(null);
  const [musicSeekTo, setMusicSeekTo] = useState<number | null>(null);

  const resetAudioSyncState = useCallback(() => {
    setMusicPlaybackState(-1);
    setMusicPlaybackDeezerId(null);
    setMusicSeekTo(null);
  }, []);

  useEffect(() => {
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

    socket.on("music_playback_toggled", onMusicPlaybackToggled);
    socket.on("music_seeked", onMusicSeeked);

    return () => {
      socket.off("music_playback_toggled", onMusicPlaybackToggled);
      socket.off("music_seeked", onMusicSeeked);
    };
  }, []);

  const toggleMusicPlayback = useCallback(
    (data: { roomCode: string; deezerId: string; state: number }) => {
      socket.emit("toggle_music_playback", data);
    },
    [],
  );

  const seekMusicPlayback = useCallback(
    (data: { roomCode: string; position: number }) => {
      socket.emit("seek_music_playback", data);
    },
    [],
  );

  return {
    musicPlaybackState,
    musicPlaybackDeezerId,
    musicSeekTo,
    setMusicPlaybackState,
    setMusicPlaybackDeezerId,
    setMusicSeekTo,
    resetAudioSyncState,
    toggleMusicPlayback,
    seekMusicPlayback,
  };
};
