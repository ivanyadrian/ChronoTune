import { useState } from "react";
import type { Player, Song } from "../types";
import { SongCard } from "../components/SongCard";
import { MusicPlayer } from "../components/MusicPlayer";

interface GameBoardProps {
  allPlayers: Player[];
  currentTurnId: string | null;
  socketId: string;
  currentSong: Song | null;
  drawCard: () => void;
  onPlaceCard: (index: number) => void;
}

export const GameBoard = ({
  allPlayers,
  currentTurnId,
  socketId,
  currentSong,
  drawCard,
  onPlaceCard,
}: GameBoardProps) => {
  const activePlayer = allPlayers.find((p) => p.id === currentTurnId);
  const [playbackState, setPlaybackState] = useState<number>(-1);

  const handleTogglePlay = () => {
    setPlaybackState((prev) => (prev === 1 ? 0 : 1));
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-4 rounded-full bg-yellow-500 animate-ping"></div>
          <h3 className="text-3xl font-black tracking-tight uppercase">
            {currentTurnId === socketId
              ? "TE KÖVETKEZEL!"
              : `${activePlayer?.name} KÖRE`}
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-88 border-2 border-dashed border-slate-700 rounded-[3rem] p-6 bg-slate-800/30 backdrop-blur-sm">
        {currentSong && currentSong.deezerId ? (
          <MusicPlayer
            currentSong={currentSong}
            playbackState={playbackState}
            setPlaybackState={setPlaybackState}
            handleTogglePlay={handleTogglePlay}
          />
        ) : (
          currentTurnId === socketId && !currentSong && (
            <button
              onClick={drawCard}
              className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-6 px-12 rounded-2xl animate-bounce"
            >
              🎵 ÚJ DAL HÚZÁSA
            </button>
          )
        )}

        {currentSong && !currentSong.deezerId && (
          <div className="text-red-400 font-bold">Error: Song data (Deezer ID) missing.</div>
        )}
      </div>

      {activePlayer && (
        <div className="bg-slate-800/20 p-10 rounded-[4rem] border border-slate-700/30">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {Array.from({ length: activePlayer.timeline.length + 1 }).map(
              (_, i) => (
                <div key={`slot-${i}`} className="flex items-center gap-6">
                  {currentSong && currentTurnId === socketId && (
                    <button
                      onClick={() => onPlaceCard(i)}
                      className="w-14 h-14 rounded-full bg-yellow-500 text-slate-900 font-black text-3xl border-4 border-slate-900"
                    >
                      +
                    </button>
                  )}
                  {i < activePlayer.timeline.length && (
                    <SongCard song={activePlayer.timeline[i]} showYear={true} />
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};
