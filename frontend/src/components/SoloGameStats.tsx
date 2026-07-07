import React from "react";
import { Heart, Flame } from "lucide-react";
import type { Player } from "../types";
import LeaveGameButton from "./ui/LeaveGameButton";

interface SoloGameStatsProps {
  isSolo: boolean;
  me: Player | null;
  delta: number;
  targetLength: number;
  maxMistakes: number | null;
  onLeaveGame: () => void;
}

const SoloGameStats: React.FC<SoloGameStatsProps> = ({
  isSolo,
  me,
  delta,
  targetLength,
  maxMistakes,
  onLeaveGame,
}) => {
  if (!isSolo || !me) return null;

  const FORCE_DELTA = false;
  const displayDelta = FORCE_DELTA ? 100 : delta;

  return (
    <div className="w-full flex flex-col border-b-2 border-white/10 py-3 px-4 bg-black/30">
      {isSolo && me && (
        <div className="flex flex-wrap xxs:grid xxs:grid-cols-3 items-center w-full gap-y-4 xxs:gap-0 min-h-10">
          {/* 1. BLOCK: Turn (Top left on mobile, left side on desktop) */}
          <div className="flex w-1/2 xxs:w-full justify-start order-1">
            <div className="flex flex-col items-start justify-center">
              <span className="text-[8px] sm:text-xxs uppercase font-black tracking-[0.2em] text-white/40">
                FORDULÓ
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">
                  {Math.min(me.attempts + 1, targetLength)}
                </span>
                <span className="text-lg sm:text-2xl font-bold text-white/25">
                  /{targetLength}
                </span>
              </div>
            </div>
          </div>

          {/* 2. BLOCK: Leave Game & Lives (Top right on mobile, right side on desktop) */}
          <div className="flex flex-col items-end gap-2 shrink-0 w-1/2 xxs:w-full justify-center xxs:justify-end order-2 xxs:order-3">
            <div className="order-1">
              <LeaveGameButton onConfirm={onLeaveGame} />
            </div>
          </div>

          {/* 3. BLOCK: Score & Combo (Bottom center on mobile, center column on desktop) */}
          <div className="flex flex-col items-center justify-center gap-2 shrink-0 w-full xxs:w-full order-3 xxs:order-2">
            {maxMistakes !== null && (
              <div className="flex flex-col items-end gap-1 order-2">
                <div className="flex gap-1 xxs:gap-1.5">
                  {Array.from({ length: maxMistakes }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`
                        w-[clamp(12px,2vw,20px)] h-[clamp(12px,2vw,20px)]
                        ${
                          i >= me.mistakes
                            ? "text-red-500 fill-red-500 drop-shadow-[0_0_7px_rgba(239,68,68,0.8)] animate-heart-wave"
                            : "text-white/10"
                        }
                      `}
                      style={{
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-stretch rounded-full overflow-hidden bg-white/10 border border-white/10 h-8 xxs:h-10 shrink-0">
              {/* LEFT: Static label */}
              <div className="flex items-center px-3">
                <span className="text-[9px] sm:text-xs uppercase tracking-[0.2em] text-white/40 font-black">
                  Pontszám
                </span>
              </div>

              {/* CENTER: This is where the switch takes place */}
              <div className="flex items-center justify-end w-20 px-3 xxs:px-4 tabular-nums">
                {displayDelta !== 0 ? (
                  /* If there is a delta (points gained/lost), it takes its place */
                  <span
                    className={`text-lg sm:text-2xl font-black italic drop-shadow-[0_0_8px_rgba(74,222,128,0.4)] ${displayDelta > 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {displayDelta > 0 ? `+${displayDelta}` : displayDelta}
                  </span>
                ) : (
                  /* By default, the total score is displayed */
                  <span className="text-lg sm:text-2xl font-black italic text-white">
                    {me.score}
                  </span>
                )}
              </div>

              <div className="w-px bg-white/10" />

              {/* RIGHT: Combo badge */}
              <StreakBadge
                winStreak={me.winStreak}
                loseStreak={me.loseStreak}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Accessory for the Combo Badge */
const StreakBadge: React.FC<{ winStreak: number; loseStreak: number }> = ({
  winStreak,
  loseStreak,
}) => {
  const isWinStreak = winStreak >= 3;
  const isLoseStreak = loseStreak >= 3;

  return (
    <div
      className={`flex items-center justify-center gap-[0.25em] font-black transition-all duration-300
        pr-2 pl-1 sm:pr-2 py-0 sm:py-0.5
        text-[1em] sm:text-[1.15em]
        ${
          isWinStreak
            ? "bg-secondary/20 text-secondary-light animate-pulse"
            : isLoseStreak
              ? "bg-red-500/20 text-red-400 animate-pulse"
              : "bg-white/5 text-white/30"
        }`}
    >
      <Flame
        size={undefined}
        className={`${!isWinStreak && !isLoseStreak ? "opacity-30" : ""} w-[1.15em] h-[1.15em]`}
        fill={isWinStreak || isLoseStreak ? "currentColor" : "none"}
      />
      {isWinStreak ? winStreak : isLoseStreak ? loseStreak : 0}x
    </div>
  );
};

export default SoloGameStats;
