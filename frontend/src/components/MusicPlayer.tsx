import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import YouTube from 'react-youtube';

const YouTubePlayer = YouTube as any;

export const MusicPlayer = ({ currentCard, player, setPlayer, playbackState, setPlaybackState, handleTogglePlay }: any) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem('chronotune-volume');
    return savedVolume ? parseInt(savedVolume) : 50;
  });

  // Amikor új kártya jön: töröljük a régit, nullázzuk a haladást
  useEffect(() => {
    setIsReady(false);
    setProgress(0);
    // Nagyon fontos: amíg nem tölt be az új, állítsuk meg az állapotot
    setPlaybackState(-1); 
  }, [currentCard.youtubeId, setPlaybackState]);

  // Hangerő beállítása csak ha tényleg kész a lejátszó
  useEffect(() => {
    if (isReady && player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(volume);
      } catch (err) {
        console.warn("Hiba a hangerő állításakor:", err);
      }
    }
  }, [isReady, player, volume]);

  // Folyamatjelző csík
  useEffect(() => {
    let interval: number;
    if (playbackState === 1 && player && typeof player.getCurrentTime === 'function') {
      interval = window.setInterval(() => {
        try {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          if (duration > 0) {
            setProgress((currentTime / duration) * 100);
          }
        } catch (err) {
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playbackState, player]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('chronotune-volume', newVolume.toString());
    if (player && typeof player.setVolume === 'function') {
      player.setVolume(newVolume);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div className="w-full bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] p-6 shadow-2xl border border-white/10 space-y-6">
        
        <div className="relative aspect-square rounded-4xl overflow-hidden group shadow-2xl bg-black">
          <img 
            src={`https://img.youtube.com/vi/${currentCard.youtubeId}/maxresdefault.jpg`} 
            alt="Cover"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isReady ? 'opacity-50 blur-sm' : 'opacity-100'}`}
          />
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleTogglePlay}
              disabled={!isReady}
              className={`w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${!isReady ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}`}
            >
              {playbackState === 1 ? (
                <Pause size={32} fill="black" />
              ) : (
                <Play size={32} fill="black" className="ml-1" />
              )}
            </button>
          </div>

          {/* Töltés jelző, amíg isReady hamis */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {playbackState === 1 && (
            <div className="absolute inset-0 border-4 border-yellow-500/50 rounded-4xl animate-pulse pointer-events-none" />
          )}
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-white font-bold text-xl truncate px-2">{currentCard.title}</h2>
          <p className="text-slate-400 font-medium text-sm italic">{currentCard.artist}</p>
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
            type="range" min="0" max="100" value={volume} onChange={handleVolumeChange}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>
      </div>

      <div className="pointer-events-none absolute opacity-0">
        <YouTubePlayer
          key={currentCard.youtubeId} // <--- EZ A LEGFONTOSABB SOR!
          videoId={currentCard.youtubeId}
          onReady={(e: any) => {
            console.log("YouTube Player Ready");
            setPlayer(e.target);
            setIsReady(true);
          }}
          onStateChange={(e: any) => {
            setPlaybackState(e.data);
          }}
          onError={() => setIsReady(false)}
          opts={{
            height: "0",
            width: "0",
            playerVars: {
              autoplay: 0, // Ne kísértsük a sorsot az autoplay-jel, a gomb a biztos
              controls: 0,
              start: 25,
              origin: window.location.origin,
            },
          }}
        />
      </div>
    </div>
  );
};