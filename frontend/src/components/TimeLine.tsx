import React from "react";
import type { Song, Player } from "../types";
import { SongCard } from "./SongCard";

interface TimelineProps {
  player: Player;
  currentSong: Song | null;
  isMyTurn: boolean;
  onPlaceCard: (index: number) => void;
}

export const Timeline = ({ player, currentSong, isMyTurn, onPlaceCard }: TimelineProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-8 bg-slate-800/30 rounded-[3rem] border border-slate-700/50">
      {Array.from({ length: player.timeline.length + 1 }).map((_, i) => (
        <React.Fragment key={`slot-wrapper-${i}`}>
          {currentSong && isMyTurn && (
            <button
              onClick={() => onPlaceCard(i)}
              className="w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-2xl shadow-lg transition-all hover:scale-125 active:scale-90"
            >
              +
            </button>
          )}

          {i < player.timeline.length && (
            <SongCard song={player.timeline[i]} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};