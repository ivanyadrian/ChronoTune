import { useState, useMemo } from "react";
import { VerticalTimeline } from "../../components/VerticalTimeline";
import type { Song, Player } from "../../types";
import { ChevronDown } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { socket } from "../../socket";

interface GameResultViewProps {
  winner: {
    name: string;
    timeline: Song[];
    score?: number;
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
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const activePlayer = useMemo(() => {
    if (isSolo) {
      return {
        id: "solo",
        name: winner.name,
        timeline: winner.timeline,
        score: winner.score,
        mistakes: mistakes,
      };
    }
    const found =
      players.find((p) => p.id === selectedPlayerId) || sortedPlayers[0];
    return found ? { ...found } : null;
  }, [isSolo, selectedPlayerId, players, sortedPlayers, winner, mistakes]);

  const activePlayerRank = useMemo(() => {
    if (!activePlayer || isSolo) return -1;
    // Dense Ranking: Collect unique scores in descending order
    const uniqueScores = Array.from(
      new Set(sortedPlayers.map((p) => p.score)),
    ).sort((a, b) => b - a);
    // The rank is the index of the current score in the list of unique scores + 1
    return uniqueScores.indexOf(activePlayer.score ?? 0) + 1;
  }, [activePlayer, sortedPlayers, isSolo]);

  if (!activePlayer) return null;

  const currentMistakes = isSolo ? mistakes : activePlayer.mistakes;
  const mistakePercent =
    maxMistakes && maxMistakes > 0 ? currentMistakes / maxMistakes : 0;

  const mistakeColor =
    mistakePercent >= 0.8
      ? "text-red-400"
      : mistakePercent >= 0.5
        ? "text-yellow-300"
        : "text-green-400";

  return (
    <div className="min-h-screen bg-[#090011] text-white">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] min-h-screen">
        {/* MAIN CONTENT (Left side) */}
        {/* FIX: Use flex flex-col without justify-center on the parent so the Badge stays at the top */}
        <div className="flex flex-col items-center p-8 bg-[radial-gradient(circle_at_center,#2a0845_0%,#090011_70%)]">
          {/* Badge is fixed at the very top */}
          <div className="w-full flex justify-center pt-4">
            <Badge text="Result" />
          </div>

          {/* FIX: Because of flex-1 this div takes all available space, and justify-center pulls its content vertically to the middle */}
          <div className="flex-1 w-full max-w-xl flex flex-col items-center justify-center text-center py-12">
            {/* Title */}
            <h1 className="text-4xl lg:text-6xl font-bold mb-4 flex items-center justify-center gap-3">
              {isSolo ? (
                lost ? (
                  "Vereség!"
                ) : (
                  "Győzelem!"
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

            {/* Player selector */}
            <div className="w-full max-w-sm mb-12">
              {isSolo ? (
                <p className="text-zinc-400 text-fluid-p">
                  {lost
                    ? "Elvesztetted az összes életed az utolsó forduló előtt."
                    : "Sikeresen eljutottál az utolsó fordulóig."}
                </p>
              ) : (
                <div className="relative group mx-auto">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">
                    Játékos kiválasztása
                  </label>
                  <div className="relative">
                    <select
                      value={activePlayer.id}
                      onChange={(e) => setSelectedPlayerId(e.target.value)}
                      className="w-full bg-bg-dark/80 border border-secondary/30 rounded-2xl px-3 py-2 lg:px-6 lg:py-4 text-white font-bold text-2xl md:text-4xl leading-tight text-start min-[200px]:text-center outline-none appearance-none cursor-pointer hover:bg-[#251630] transition-colors"
                    >
                      {/* Hidden option for the currently selected player to show the name in the header */}
                      <option value={activePlayer.id} hidden>
                        {activePlayer.name}
                      </option>

                      {/* Only show other players in the list */}
                      {sortedPlayers
                        .filter((player) => player.id !== activePlayer.id)
                        .map((player) => (
                          <option
                            key={player.id}
                            value={player.id}
                            className="bg-bg-dark text-white text-base text-center cursor-pointer"
                          >
                            {player.name}
                            {player.id === socket.id ? " (TE)" : ""}
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
              {/* SCORE - stacks below 240px (1 col), 2 cols wide above, 1 on desktop */}
              <div className="col-span-1 min-[300px]:col-span-2 sm:col-span-1 rounded-3xl border border-white/5 bg-white/5 p-4 md:p-6 backdrop-blur flex flex-col justify-center items-center">
                <p className="text-zinc-400 text-[10px] md:text-sm mb-2">
                  PONTSZÁM
                </p>
                <p className="text-3xl md:text-4xl font-bold text-secondary-light">
                  {activePlayer.score}
                </p>
              </div>

              {/* TIMELINE LENGTH - 1 col wide on mobile */}
              <div className="col-span-1 rounded-3xl border border-white/5 bg-white/5 p-3 md:p-6 backdrop-blur flex flex-col justify-center items-center">
                <p className="text-zinc-400 text-[10px] md:text-sm mb-2">
                  TIMELINE HOSSZA
                </p>
                <p className="text-3xl md:text-4xl font-bold text-blue-400">
                  {activePlayer.timeline.length}
                </p>
              </div>

              {/* MISTAKES - 1 col wide on mobile */}
              <div className="col-span-1 rounded-3xl border border-white/5 bg-white/5 p-3 md:p-6 backdrop-blur flex flex-col justify-center items-center">
                <p className="text-zinc-400 text-[10px] md:text-sm mb-2">
                  HIBÁK
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl md:text-4xl font-bold ${
                      maxMistakes != null ? mistakeColor : "text-red-400"
                    }`}
                  >
                    {currentMistakes}
                  </span>
                  {maxMistakes != null && (
                    <span className="text-lg text-zinc-500 mb-1">
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

            {/* Buttons*/}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {onRestart && (
                <button
                  onClick={onRestart}
                  className="flex-1 rounded-full bg-linear-to-r from-(--primary) to-[color-mix(in_srgb,var(--primary)_70%,black)] py-4 font-semibold text-lg shadow-[0_0_30px] shadow-primary/45 hover:scale-[1.02] transition"
                >
                  Újra játszom
                </button>
              )}
              <button
                onClick={onLeave}
                className="flex-1 rounded-full bg-white/10 border border-white/10 py-4 font-semibold text-lg hover:bg-white/15 transition"
              >
                Kilépés
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Timeline) */}
        <div className="h-screen">
          <VerticalTimeline
            timeline={activePlayer.timeline}
            title={
              isSolo && lost
                ? "Timeline Megszakítva"
                : `${activePlayer.name} Timeline-ja`
            }
            subtitle={
              isSolo && lost
                ? `A játék alatt elért timeline:`
                : `A létrehozott sorrend: ${activePlayer.timeline[0]?.year || "?"} — ${activePlayer.timeline[activePlayer.timeline.length - 1]?.year || "?"}`
            }
          />
        </div>
      </div>
    </div>
  );
};
