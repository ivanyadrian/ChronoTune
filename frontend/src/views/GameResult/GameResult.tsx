import { useState, useMemo } from "react";
import { VerticalTimeline } from "../../components/VerticalTimeline";
import type { Song, Player } from "../../types";
import { ChevronDown } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { socket } from "../../socket";
import { getMistakeColor } from "../../utils/scoreUtils";
import { formatDuration } from "../../utils/timeUtils";
import { useLanguage } from "../../context/LanguageContext";

interface GameResultViewProps {
  winner: {
    name: string;
    timeline: Song[];
    score?: number;
    isWeekly?: boolean;
    weeklyTimeInSeconds?: number;
    weeklyMistakes?: number;
    weekIdentifier?: string;
    correctPlacements?: number;
  };
  lost: boolean;
  mistakes: number;
  maxMistakes: number | null;
  onLeave: () => void;
  onRestart?: () => void;
  isSolo?: boolean;
  players?: Player[];
}

export const GameResultView = ({
  winner,
  lost,
  mistakes,
  maxMistakes,
  onLeave,
  onRestart,
  isSolo = true,
  players = [],
}: GameResultViewProps) => {
  const { t } = useLanguage();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const activePlayer = useMemo(() => {
    if (isSolo || winner.isWeekly) {
      return {
        id: "solo",
        name: winner.name,
        timeline: winner.timeline,
        score: winner.score,
        mistakes: winner.isWeekly ? (winner.weeklyMistakes ?? mistakes) : mistakes,
        correctPlacements: winner.isWeekly 
          ? (winner.correctPlacements ?? winner.timeline.length - 1) 
          : undefined,
      };
    }
    const found =
      players.find((p) => p.id === selectedPlayerId) || sortedPlayers[0];
    return found ? { ...found } : null;
  }, [isSolo, selectedPlayerId, players, sortedPlayers, winner, mistakes]);

  const activePlayerRank = useMemo(() => {
    if (!activePlayer || isSolo || winner.isWeekly) return -1;
    const uniqueScores = Array.from(
      new Set(sortedPlayers.map((p) => p.score)),
    ).sort((a, b) => b - a);
    return uniqueScores.indexOf(activePlayer.score ?? 0) + 1;
  }, [activePlayer, sortedPlayers, isSolo, winner.isWeekly]);

  if (!activePlayer) return null;

  const currentMistakes = winner.isWeekly ? (winner.weeklyMistakes ?? mistakes) : activePlayer.mistakes;
  const mistakePercent =
    maxMistakes && maxMistakes > 0 ? currentMistakes / maxMistakes : 0;

  const mistakeColor = getMistakeColor(mistakePercent);

  return (
    <div className="min-h-screen bg-[#090011] text-white animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] min-h-screen">
        {/* MAIN CONTENT (Left side) */}
        <div className="flex flex-col items-center p-8 bg-[radial-gradient(circle_at_center,#2a0845_0%,#090011_70%)]">
          <div className="w-full flex justify-center pt-4">
            <Badge text={winner.isWeekly ? "Weekly Challenge" : "Result"} />
          </div>

          <div className="flex-1 w-full max-w-xl flex flex-col items-center justify-center text-center py-12">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4 flex items-center justify-center gap-3 font-archivo">
              {winner.isWeekly ? (
                t.resultWeeklyDone
              ) : isSolo ? (
                lost ? (
                  t.resultLost
                ) : (
                  t.resultWon
                )
              ) : (
                <>
                  {activePlayerRank === 1
                    ? "🥇 "
                    : activePlayerRank === 2
                      ? "🥈 "
                      : activePlayerRank === 3
                        ? "🥉 "
                        : `#${activePlayerRank} `}
                </>
              )}
            </h1>

            <div className="w-full max-w-sm mb-12">
              {winner.isWeekly ? (
                <p className="text-zinc-400 text-fluid-p">
                  {t.resultWeeklySuccess}
                </p>
              ) : isSolo ? (
                <p className="text-zinc-400 text-fluid-p">
                  {lost
                    ? t.resultSoloLost
                    : t.resultSoloWon}
                </p>
              ) : (
                <div className="relative group mx-auto">
                  <label className="block text-[10px] font-archivo text-slate-500 uppercase tracking-[0.3em] mb-3">
                    {t.resultSelectPlayer}
                  </label>
                  <div className="relative">
                    <select
                      value={activePlayer.id}
                      onChange={(e) => setSelectedPlayerId(e.target.value)}
                      className="w-full bg-bg-dark/80 border border-secondary/30 rounded-2xl px-3 py-2 lg:px-6 lg:py-4 text-white font-bold text-2xl md:text-4xl leading-tight text-start min-[200px]:text-center outline-none appearance-none cursor-pointer hover:bg-[#251630] transition-colors"
                    >
                      <option value={activePlayer.id} hidden>
                        {activePlayer.name}
                      </option>
                      {sortedPlayers
                        .filter((player) => player.id !== activePlayer.id)
                        .map((player) => (
                          <option
                            key={player.id}
                            value={player.id}
                            className="bg-bg-dark text-white text-base text-center cursor-pointer"
                          >
                            {player.name}
                            {player.id === socket.id ? ` ${t.resultYou}` : ""}
                          </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-secondary-light">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                  <div className="absolute -inset-1 bg-linear-to-r from-[color-mix(in_srgb,var(--secondary)_20%,transparent)] 
                      to-[color-mix(in_srgb,var(--secondary-light)_20%,transparent)]
                    rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 -z-10" />
                </div>
              )}
            </div>

            {/* Stats block */}
            <div className="grid grid-cols-1 min-[300px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full mb-10">
              <div className="col-span-1 min-[300px]:col-span-2 sm:col-span-1 rounded-3xl border border-white/5 bg-white/5 p-4 md:p-6 backdrop-blur flex flex-col justify-center items-center">
                <p className="text-zinc-400 text-[10px] md:text-sm mb-2 uppercase font-archivo">
                  {winner.isWeekly ? t.resultPlayTime : t.resultScore}
                </p>
                <p className="text-3xl md:text-4xl font-archivo text-secondary-light">
                  {winner.isWeekly && typeof winner.weeklyTimeInSeconds === "number"
                    ? formatDuration(winner.weeklyTimeInSeconds)
                    : activePlayer.score}
                </p>
              </div>

               <div className="col-span-1 rounded-3xl border border-white/5 bg-white/5 p-3 md:p-6 backdrop-blur flex flex-col justify-center items-center">
                  <p className="text-zinc-400 text-[10px] md:text-sm mb-2 uppercase font-archivo">
                    {winner.isWeekly ? t.resultCorrect : t.resultTimelineLength}
                  </p>
                  <p className="text-3xl md:text-4xl font-archivo text-blue-400">
                    {winner.isWeekly 
                      ? activePlayer.correctPlacements ?? 0
                      : activePlayer.timeline.length
                    }
                  </p>
                </div>

              <div className="col-span-1 rounded-3xl border border-white/5 bg-white/5 p-3 md:p-6 backdrop-blur flex flex-col justify-center items-center">
                <p className="text-zinc-400 text-[10px] md:text-sm mb-2 uppercase font-archivo">
                  {t.resultMistakes}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl md:text-4xl font-archivo ${
                      maxMistakes != null ? mistakeColor : "text-red-400"
                    }`}
                  >
                    {currentMistakes}
                  </span>
                  {maxMistakes != null && (
                    <span className="text-lg text-zinc-500 mb-1 font-archivo">
                      / {maxMistakes}
                    </span>
                  )}
                </div>

                {maxMistakes != null && (
                  <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`
                        h-full rounded-full transition-all duration-500
                        ${
                          mistakePercent >= 0.8
                            ? "bg-red-400"
                            : mistakePercent >= 0.5
                              ? "bg-yellow-300"
                              : "bg-green-400"
                        }
                      `}
                      style={{
                        width: `${Math.min(mistakePercent * 100, 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {winner.isWeekly ? (
                  <button
                    onClick={onLeave}
                    className="flex-1 rounded-full font-archivo bg-linear-to-r from-(--primary) to-[color-mix(in_srgb,var(--primary)_70%,black)] py-4 font-semibold text-lg shadow-[0_0_30px] shadow-primary/45 hover:scale-[1.02] transition cursor-pointer text-white"
                  >
                    {t.resultBackToLeaderboard}
                  </button>
              ) : (
                <>
                  {onRestart && (
                    <button
                      onClick={onRestart}
                      className="flex-1 rounded-full bg-linear-to-r from-(--primary) to-[color-mix(in_srgb,var(--primary)_70%,black)] py-4 font-semibold text-lg shadow-[0_0_30px] shadow-primary/45 hover:scale-[1.02] transition cursor-pointer text-white"
                    >
                      {t.resultPlayAgain}
                    </button>
                  )}
                  <button
                    onClick={onLeave}
                    className="flex-1 rounded-full bg-white/10 border border-white/10 py-4 font-semibold text-lg hover:bg-white/15 transition cursor-pointer text-white"
                  >
                    {t.resultLeave}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Timeline) */}
        <div className="h-screen">
          <VerticalTimeline
            timeline={activePlayer.timeline}
            title={
              isSolo && lost
                ? t.timelineBroken
                : `${activePlayer.name} ${t.timelineOf}`
            }
            subtitle={
              isSolo && lost
                ? t.timelineReached
                : `${t.timelineOrder} ${activePlayer.timeline[0]?.year || "?"} — ${activePlayer.timeline[activePlayer.timeline.length - 1]?.year || "?"}`
            }
          />
        </div>
      </div>
    </div>
  );
};