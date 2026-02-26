import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export const MusicPlayer = ({ currentSong, handleTogglePlay, playbackState, setPlaybackState, onCardMouseDown, isDraggable }: any) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem('chronotune-volume');
    return savedVolume ? parseInt(savedVolume) : 50;
  });

  useEffect(() => {
    const fetchFreshPreview = async () => {
      if (!currentSong?.deezerId) {
        setIsReady(false);
        return;
      }

      setIsReady(false);
      setProgress(0);
      setPlaybackState(-1);

      try {
        const response = await fetch(`http://localhost:3001/api/deezer-proxy/${currentSong.deezerId}`);
        const data = await response.json();

        if (data.preview && audioRef.current) {
          const secureAudioUrl = data.preview.replace("http://", "https://");
          audioRef.current.src = secureAudioUrl;
          audioRef.current.load();

          if (audioRef.current.readyState >= 3) {
            setIsReady(true);
          }
        } else {
          throw new Error("No preview URL in Deezer response.");
        }
      } catch (err) {
        console.error("Error refreshing music link:", err);
        setIsReady(false);
      }
    };

    fetchFreshPreview();
  }, [currentSong?.deezerId, currentSong?.id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  useEffect(() => {
    if (!audioRef.current || !isReady) return;

    if (playbackState === 1) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Playback error:", err);
          setPlaybackState(0);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [playbackState, isReady]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('chronotune-volume', newVolume.toString());
  };

  return (
    <div
      className="flex flex-col items-center w-full max-w-sm mx-auto"
      onMouseDown={onCardMouseDown}
      style={{ cursor: isDraggable ? 'grab' : 'default', userSelect: 'none' }}
    >
      <div className="w-full bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] p-6 shadow-2xl border border-white/10 space-y-6">

        <div className="relative aspect-square rounded-4xl overflow-hidden group shadow-2xl bg-black">
          <img
            src={currentSong.cover}
            alt="Cover"
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${!isReady ? 'opacity-50 blur-md scale-95' : 'opacity-100 blur-0 scale-100'}`}
          />

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleTogglePlay}
              disabled={!isReady}
              className={`w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${!isReady ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}`}
            >
              {playbackState === 1 ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1" />}
            </button>
          </div>

          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-white font-bold text-xl truncate px-2">{currentSong.title}</h2>
          <p className="text-slate-400 font-medium text-sm italic">{currentSong.artist}</p>
        </div>

        <div className="space-y-2 px-2">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl">
          <Volume2 size={18} className="text-slate-400 shrink-0" />
          <input
            onMouseDown={(e) => e.stopPropagation()}
            type="range" min="0" max="100" value={volume} onChange={handleVolumeChange}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onCanPlay={() => setIsReady(true)}
        onCanPlayThrough={() => setIsReady(true)}
        onEnded={() => {
          setPlaybackState(0);
          setProgress(0);
        }}
        onError={() => setIsReady(false)}
      />
    </div>
  );
};
