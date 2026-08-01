import React from "react";
import type { Player } from "../../../types";
import LeaveGameButton from "../../../components/ui/LeaveGameButton";

interface MultiplayerGameStatsProps {
  activePlayer: Player;
  isMyTurn: boolean;
  targetLength: number;
  onLeaveGame: () => void;
}

const MultiplayerGameStats: React.FC<MultiplayerGameStatsProps> = ({
  activePlayer,
  isMyTurn,
  targetLength,
  onLeaveGame,
}) => {

  return (
    <div className="w-full flex flex-col border-b-2 border-white/10 py-3 px-4 bg-black/30">
      <div className={`flex flex-wrap xs:grid xs:grid-cols-3 items-center w-full gap-y-4 xs:gap-0 min-h-12`}>
        
        {/* 1. BLOCK: Round */}
        <div className={`flex w-1/2 xs:w-full justify-start order-1`}>
          <div className="flex flex-col items-start justify-center">
            <span className="text-[8px] sm:text-xxs uppercase font-archivo tracking-[0.2em] text-white/40">
              FORDULÓ
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-4xl font-archivo text-white drop-shadow-lg">
                {Math.min(activePlayer.attempts + 1, targetLength)}
              </span>
              <span className="text-lg sm:text-2xl font-archivo text-white/25">
                /{targetLength}
              </span>
            </div>
          </div>
        </div>

        {/* 2. BLOCK: Leave Game Button */}
        <div className={`flex flex-col items-end shrink-0 w-1/2 xs:w-full justify-center xs:justify-end order-2 xs:order-3`}>
          <LeaveGameButton onConfirm={onLeaveGame} />
        </div>

        {/* 3. BLOCK: Timeline indicator */}
        <div className={`flex flex-col items-center justify-center shrink-0 w-full xs:w-full order-3 xs:order-2`}>
          <div className="px-4 py-2 sm:px-6 sm:py-1.5 bg-bg-dark border border-secondary/40 rounded-2xl sm:rounded-full shadow-[0_0_20px] shadow-secondary/25 flex items-center gap-0.5 sm:gap-2">
            <span className="text-[9px] font-archivo uppercase tracking-[0.2em] text-white/40 text-center">
              Timeline
            </span>

            <div className="hidden sm:block w-1 h-1 rounded-full bg-secondary/50" />

            <span className="text-xxs sm:text-sm font-archivo italic text-white uppercase tracking-tighter text-center">
              {isMyTurn ? "Saját" : `${activePlayer.name}`}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MultiplayerGameStats;