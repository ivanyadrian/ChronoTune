import type { Song } from "../types";
import { SongCard } from "../components/SongCard";

interface WinnerViewProps {
  winner: {
    name: string;
    timeline: Song[];
  };
  mistakes?: number; // Opcionális prop a Solo módhoz
}

export const WinnerView = ({ winner, mistakes }: WinnerViewProps) => {
  // Megnézzük, Solo módról van-e szó (ha átadtuk a mistakes-t)
  const isSolo = mistakes !== undefined;

  return (
    <div className="fixed inset-0 z-100 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
      
      {/* Trófea és Solo Statisztika */}
      <div className="mb-6 relative flex flex-col items-center">
        <span className="text-8xl drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
          {isSolo && mistakes === 0 ? "🌟" : "🏆"}
        </span>
        <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
        
        {isSolo && (
          <div className="mt-4 bg-yellow-500 text-slate-900 px-6 py-2 rounded-full font-black text-xl shadow-lg animate-in slide-in-from-top duration-700 delay-300 fill-mode-both">
            {mistakes} HIBA
          </div>
        )}
      </div>

      <h2 className="text-7xl font-black text-yellow-500 mb-2 tracking-tighter italic">
        MEGVAN A GYŐZTES
      </h2>
      <p className="text-3xl font-bold text-white mb-10">
        Gratulálunk <span className="text-yellow-500">{winner.name}</span>!
      </p>

      <div className="w-full max-w-5xl overflow-x-auto pb-8 scrollbar-hide">
        <div className="flex justify-center gap-4 px-4">
          {winner.timeline.map((song, i) => (
            <div
              key={i}
              className="shrink-0 animate-in slide-in-from-bottom duration-700"
              style={{
                animationDelay: `${i * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <SongCard song={song} />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-12 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-5 px-12 rounded-2xl shadow-[0_10px_40px_rgba(234,179,8,0.3)] transition-all hover:scale-105 active:scale-95 text-xl"
      >
        ÚJ CSATA INDÍTÁSA
      </button>
    </div>
  );
};
