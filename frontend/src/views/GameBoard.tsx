import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import type { Player, Card } from "../types";
import { SongCard } from "../components/SongCard";

const YouTubePlayer = YouTube as any;

interface GameBoardProps {
  allPlayers: Player[];
  currentTurnId: string | null;
  socketId: string;
  currentCard: Card | null;
  drawCard: () => void;
  onPlaceCard: (index: number) => void;
}

export const GameBoard = ({ allPlayers, currentTurnId, socketId, currentCard, drawCard, onPlaceCard }: GameBoardProps) => {
  const activePlayer = allPlayers.find(p => p.id === currentTurnId);
  const [player, setPlayer] = useState<any>(null);
  const [playbackState, setPlaybackState] = useState<number>(-1);

  useEffect(() => {
    setPlaybackState(-1);
    setPlayer(null);
  }, [currentCard?.id]);

  const handleTogglePlay = () => {
    if (!player) return;
    if (playbackState === 1) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-4 rounded-full bg-yellow-500 animate-ping"></div>
          <h3 className="text-3xl font-black tracking-tight uppercase">
            {currentTurnId === socketId ? "TE KÖVETKEZEL!" : `${activePlayer?.name} KÖRE`}
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-88 border-2 border-dashed border-slate-700 rounded-[3rem] p-6 bg-slate-800/30 backdrop-blur-sm">
        {currentCard ? (
          <div className="flex flex-col items-center gap-8">
            <button
              onClick={handleTogglePlay}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 border-4 ${
                playbackState === 1 ? "bg-red-500 border-red-400 animate-pulse" : "bg-green-500 border-green-400 hover:scale-110"
              }`}
            >
              <span className="text-5xl text-white">{playbackState === 1 ? "||" : "▶"}</span>
            </button>
            
            <div className="text-center">
              <p className="text-slate-200 font-black text-xl uppercase tracking-tighter">
                {playbackState === 1 ? "A dal éppen szól..." : "Kattints a lejátszáshoz!"}
              </p>
            </div>

            {/* DEBUG NÉZET - Ha már minden működik, vedd le az opacity-100-at opacity-0-ra */}
            <div className="opacity-100 mt-4 border-2 border-slate-700 rounded-lg overflow-hidden">
              <YouTubePlayer
                videoId={currentCard.youtubeId}
                onReady={(e: any) => setPlayer(e.target)}
                onStateChange={(e: any) => setPlaybackState(e.data)}
                opts={{
                  height: '180',
                  width: '320',
                  playerVars: { autoplay: 0, controls: 1, start: 40, origin: window.location.origin },
                }}
              />
            </div>
          </div>
        ) : (
          currentTurnId === socketId && (
            <button onClick={drawCard} className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-6 px-12 rounded-2xl animate-bounce">
              🎵 ÚJ DAL HÚZÁSA
            </button>
          )
        )}
      </div>

      {activePlayer && (
        <div className="bg-slate-800/20 p-10 rounded-[4rem] border border-slate-700/30">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {Array.from({ length: activePlayer.timeline.length + 1 }).map((_, i) => (
              <div key={`slot-${i}`} className="flex items-center gap-6">
                {currentCard && currentTurnId === socketId && (
                  <button onClick={() => onPlaceCard(i)} className="w-14 h-14 rounded-full bg-yellow-500 text-slate-900 font-black text-3xl border-4 border-slate-900">+</button>
                )}
                {i < activePlayer.timeline.length && <SongCard card={activePlayer.timeline[i]} showYear={true} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};