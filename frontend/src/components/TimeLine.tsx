import React from "react";
import type { Card, Player } from "../types";
import { SongCard } from "./SongCard";

interface TimelineProps {
  player: Player;
  currentCard: Card | null;
  isMyTurn: boolean;
  onPlaceCard: (index: number) => void;
}

export const Timeline = ({ player, currentCard, isMyTurn, onPlaceCard }: TimelineProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-8 bg-slate-800/30 rounded-[3rem] border border-slate-700/50">
      {/* Azért megyünk végig a hossza + 1-en, mert a kártyák ELÉ, 
          KÖZÉ és UTÁNA is lehet szúrni (pl. 1 kártyánál 2 helyre).
      */}
      {Array.from({ length: player.timeline.length + 1 }).map((_, i) => (
        <React.Fragment key={`slot-wrapper-${i}`}>
          
          {/* BESZÚRÓ GOMB (+): Csak ha van kártya a kézben és te jössz */}
          {currentCard && isMyTurn && (
            <button
              onClick={() => onPlaceCard(i)}
              className="w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-2xl shadow-lg transition-all hover:scale-125 active:scale-90"
            >
              +
            </button>
          )}

          {/* KÁRTYA MEGJELENÍTÉSE (ha létezik az adott indexen) */}
          {i < player.timeline.length && (
            <SongCard card={player.timeline[i]} />
          )}
          
        </React.Fragment>
      ))}
    </div>
  );
};