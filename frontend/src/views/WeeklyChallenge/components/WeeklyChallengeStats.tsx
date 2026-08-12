import React, { useState, useEffect, useRef } from "react";
import type { Player } from "../../../types";
import LeaveGameButton from "../../../components/ui/LeaveGameButton";
import { getScoreColor } from "../../../utils/scoreUtils";
import { formatDuration } from "../../../utils/timeUtils";
import { useLanguage } from "../../../context/LanguageContext";

interface WeeklyChallengeStatsProps {
  me: Player | null;
  targetLength: number;
  onLeaveGame: () => void;
  initialElapsedMs?: number;
}

const WeeklyChallengeStats: React.FC<WeeklyChallengeStatsProps> = ({
  me,
  targetLength,
  onLeaveGame,
  initialElapsedMs = 0,
}) => {
  const [seconds, setSeconds] = useState(() =>
    Math.floor(initialElapsedMs / 1000)
  );
  const sessionStartRef = useRef(Date.now());
  const baseElapsedRef = useRef(initialElapsedMs);

  useEffect(() => {
    sessionStartRef.current = Date.now();
    baseElapsedRef.current = initialElapsedMs;
    setSeconds(Math.floor(initialElapsedMs / 1000));
  }, [initialElapsedMs]);

  // Stopwatch timer – runs only during active gameplay (resumes after pause)
  useEffect(() => {
    if (!me) return;

    const interval = setInterval(() => {
      const elapsed =
        baseElapsedRef.current + (Date.now() - sessionStartRef.current);
      setSeconds(Math.floor(elapsed / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [me, initialElapsedMs]);



  if (!me) return null;
  const { t } = useLanguage();

  return (
    <div className="w-full flex flex-col border-b-2 border-white/10 py-3 px-4 bg-black/30 animate-in fade-in duration-200">
      {/* 3-column layout: Round (left) | Time & Placements (center stacked) | Leave (right) */}
      <div className="grid grid-cols-3 items-center w-full min-h-10 gap-4">
        
        {/* 1. LEFT SIDE: Round / Progress */}
        <div className="flex justify-start">
          <div className="flex flex-col items-start justify-center">
            <span className="text-[8px] sm:text-xxs uppercase font-archivo tracking-[0.2em] text-white/40">
              {t.round}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-4xl font-archivo text-white drop-shadow-lg">
                {Math.min(me.attempts, targetLength)}
              </span>
              <span className="text-lg sm:text-2xl font-archivo text-white/25">
                /{targetLength}
              </span>
            </div>
          </div>
        </div>

        {/* 2. CENTER BLOCK: Time on top, Placements right below */}
        <div className="flex flex-col items-center justify-center gap-2.5">
          
          {/* TIME */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-lg sm:text-xl font-archivo font-bold text-secondary-light drop-shadow-[0_0_10px_rgba(236,72,153,0.15)] tabular-nums leading-none mt-0.5">
              {formatDuration(seconds, true)}
            </span>
          </div>

          {/* PLACEMENTS / SCORE */}
          <div className="flex items-center rounded-full overflow-hidden bg-white/10 border border-white/10 h-7 xs:h-8 shrink-0">
            {/* Label */}
            <div className="flex items-center px-2.5 border-r border-white/10 h-full">
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] text-white/40 font-archivo">
                {t.weeklyHits}
              </span>
            </div>

            {/* Counter */}
            <div 
              className={`flex items-center justify-center px-3 font-archivo transition-colors duration-300 h-full ${getScoreColor(
                me.timeline.length - 1
              )}`}
            >
              <span className="text-sm sm:text-base font-archivo italic font-bold tabular-nums">
                {me.timeline.length - 1}
              </span>
            </div>
          </div>

        </div>

        {/* 3. RIGHT SIDE: Leave button */}
        <div className="flex justify-end">
          <LeaveGameButton onConfirm={onLeaveGame} />
        </div>

      </div>
    </div>
  );
};

export default WeeklyChallengeStats;