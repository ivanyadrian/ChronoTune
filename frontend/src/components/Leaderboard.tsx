// src/components/Leaderboard.tsx
import type { Player } from "../types";

interface LeaderboardProps {
  players: Player[];
  currentTurnId: string | null;
  winLimit: number;
}

export const Leaderboard = ({ players, currentTurnId, winLimit }: LeaderboardProps) => {
  return (
    <div className="fixed top-24 right-6 w-64 space-y-3 hidden lg:block animate-in fade-in slide-in-from-right duration-700">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
        Élő Ranglista
      </h4>
      
      {players.map((player) => {
        const score = player.timeline.length;
        const progress = (score / winLimit) * 100;
        const isCurrent = player.id === currentTurnId;

        return (
          <div 
            key={player.id} 
            className={`p-4 rounded-2xl border transition-all duration-500 ${
              isCurrent 
                ? "bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)] scale-105" 
                : "bg-slate-800/40 border-slate-700/50 opacity-80"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-col">
                <span className={`text-sm font-bold truncate max-w-30 ${isCurrent ? "text-yellow-500" : "text-white"}`}>
                  {player.name}
                </span>
                {isCurrent && (
                  <span className="text-[8px] font-black text-yellow-500/80 uppercase tracking-tighter">
                    Soron van
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-slate-400 tabular-nums">
                {score} / {winLimit}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/30">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  isCurrent ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "bg-slate-600"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};