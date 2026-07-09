import { Zap } from "lucide-react";
import { socket } from "../socket";
import type { Player } from "../types";

interface LeaderboardProps {
  players: Player[];
  lastDelta: { [playerId: string]: number };
  isSolo: boolean;
  currentTurnId: string | null;
}

export const Leaderboard = ({
  players,
  lastDelta = {},
  isSolo,
  currentTurnId,
}: LeaderboardProps) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const currentTurnIndex = players.findIndex((p) => p.id === currentTurnId);
  const nextPlayer =
    currentTurnIndex !== -1 && players.length > 1
      ? players[(currentTurnIndex + 1) % players.length]
      : null;

  // Helper function to determine rank: identical scores get identical rank
  const getPlayerRank = (index: number) => {
    for (let i = 0; i < index; i++) {
      if (sortedPlayers[i].score === sortedPlayers[index].score) {
        return i + 1;
      }
    }
    return index + 1;
  };

  return (
    <div className="w-full h-full max-w-sm md:max-w-2xl lg:max-w-md flex flex-col md:flex-row lg:flex-col gap-2 md:gap-3 justify-center lg:justify-start items-center">
      {sortedPlayers.map((player, index) => {
        const isMe = player.id === socket.id;
        const delta = lastDelta[player.id] || 0;
        const isCurrent = player.id === currentTurnId;
        const isNext = nextPlayer ? player.id === nextPlayer.id : false;
        const rank = getPlayerRank(index);

        const shouldShowOnMobileOrTablet = isCurrent || isNext;

        const isWinStreak = player.winStreak >= 3;
        const isLoseStreak = player.loseStreak >= 3;

        return (
          <div
            key={player.id}
            className={`
              relative items-center w-full
              ${isSolo ? "grid-cols-1" : "grid-cols-[40px_1fr] lg:grid-cols-[48px_1fr]"}
              
              ${shouldShowOnMobileOrTablet ? "grid" : "hidden lg:grid"}
              
              ${
                isCurrent
                  ? "order-1 lg:order-0"
                  : isNext
                    ? "order-2 lg:order-0"
                    : "order-3 lg:order-0"
              }

              md:flex-1 lg:flex-none lg:w-full
              
              transition-all duration-300 ease-out
              rounded-2xl overflow-hidden

              ${
                isCurrent
                  ? "scale-100 lg:scale-102 z-10 opacity-100 lg:ring-2 lg:ring-secondary/50"
                  : "lg:scale-98 opacity-60 lg:opacity-75"
              }
            `}
          >
            {/* OUTER HIGHLIGHT WRAPPER */}
            <div
              className={`
                absolute inset-0 rounded-2xl pointer-events-none
                backdrop-blur-xl border transition-all duration-300 ease-out
                ${
                  isCurrent
                    ? "bg-secondary/15 border-secondary-light/40 shadow-[0_0_30px] shadow-secondary-light/25"
                    : "bg-white/5 border-white/8"
                }
              `}
            />

            {/* LEFT BLOCK: Rank */}
            {!isSolo && (
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`
                    w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center font-archivo text-sm lg:text-base rounded-l-2xl transition-colors duration-300
                    ${
                      player.score > 0
                        ? rank === 1
                          ? "bg-yellow-400 text-black"
                          : rank === 2
                            ? "bg-slate-300 text-black"
                            : rank === 3
                              ? "bg-amber-700 text-white"
                              : "bg-white/20 text-white"
                        : "bg-white/10 text-white/50"
                    }
                  `}
                >
                  #{rank}
                </div>
              </div>
            )}

            {/* RIGHT BLOCK: Name + Score */}
            <div className="relative z-10 flex items-center justify-between px-3 py-1.5 lg:px-4 lg:py-2 h-10 lg:h-12 min-w-0 rounded-r-2xl">
              <div className="min-w-0 flex items-center gap-1.5 lg:gap-2">
                <p className="font-semibold text-white truncate text-sm lg:text-base flex items-center gap-1.5">
                  <span className="truncate">{player.name}</span>

                  {isMe && (
                    <span className="text-purple-300 text-[10px] lg:text-xs font-bold shrink-0">
                      (TE)
                    </span>
                  )}

                  {isCurrent && (
                    <span className="lg:hidden text-[8px] bg-secondary/80 text-purple-100 px-1 py-0.5 rounded font-archivo tracking-wide shrink-0 uppercase">
                      Most
                    </span>
                  )}
                  {!isCurrent && isNext && (
                    <span className="lg:hidden text-[8px] bg-blue-500/40 text-blue-200 border border-blue-500/30 px-1 py-0.5 rounded font-archivo tracking-wide shrink-0 uppercase">
                      Köv.
                    </span>
                  )}
                </p>

                {(isWinStreak || isLoseStreak) && (
                  <div
                    className={`absolute right-3 top-0 lg:right-2 lg:top-0.5 flex items-center justify-center gap-0.5 shrink-0 ${
                      isWinStreak ? "text-purple-300" : "text-red-400"
                    }`}
                  >
                    <Zap className="w-2 h-2" fill="currentColor" />
                    <span className="text-[9px] font-bold">
                      {isWinStreak ? player.winStreak : player.loseStreak}x
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 lg:gap-2">
                {delta !== 0 ? (
                  /* IF THERE IS A DELTA: SHOW THE UPDATED SCORE */
                  <div
                    className={`text-xl lg:text-2xl font-archivo tabular-nums transition-all duration-300 animate-in fade-in slide-in-from-top-1 ${
                      delta > 0
                        ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                        : "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </div>
                ) : (
                  /* IF THERE IS NO DELTA: Keep the default score and streak glow */
                  <div
                    className={`
                      text-xl lg:text-2xl font-archivo tabular-nums transition-all duration-300
                      ${
                        isWinStreak
                          ? "text-secondary-light drop-shadow-[0_0_8px] shadow-secondary-light/50"
                          : isLoseStreak
                            ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            : "text-white"
                      }
                    `}
                  >
                    {player.score}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
