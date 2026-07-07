import type { Song } from "../types";
import { useEffect, useState } from "react";
import { Layers } from "lucide-react";

const PLACEHOLDER = "/cover_placeholder.jpg";

interface SongCardProps {
  song: Song;
  isActive?: boolean;
  showYear?: boolean;
  isPlaceholder?: boolean;
  // Collapsible props
  collapsible?: boolean;
  isCollapsed?: boolean;
  collapsedCount?: number;
  onToggleCollapse?: (e: React.MouseEvent) => void;
  isDimmed?: boolean;
}

export const SongCard = ({
  song,
  isActive,
  showYear = true,
  isPlaceholder = false,
  isCollapsed,
  collapsedCount,
  isDimmed,
}: SongCardProps) => {
  const [imgSrc, setImgSrc] = useState(song?.cover || PLACEHOLDER);

  useEffect(() => {
    if (song && song.cover) {
      setImgSrc(song.cover);
    } else {
      setImgSrc(PLACEHOLDER);
    }
  }, [song]);

  if (!song) return null;

  return (
    <div className="relative flex flex-col items-center group">
      {/* 1. PURPLE BUBBLE (YEAR / QUESTION MARKS) */}
      {/* "absolute -top-6" appears above the card */}
      {(showYear || isPlaceholder) && (
        <div
          className={`absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 z-20 animate-in fade-in zoom-in duration-300 transition-all 
          ${isDimmed ? "grayscale opacity-60 scale-95" : ""}`}
        >
          <div className="px-5 py-1 bg-primary rounded-full shadow-[0_0_20px] shadow-primary/60 border border-white/20 whitespace-nowrap">
            <span className="text-white font-black font-sekuya text-sm sm:text-xl text-center justify-center flex">
              {isPlaceholder ? "????" : song.year}
            </span>
          </div>
        </div>
      )}

      {/* 2. CARD BODY */}
      <div
        className={`
        relative p-3 sm:p-4 rounded-[2.5rem] transition-all duration-500 w-40 sm:w-56 h-56 sm:h-76 flex flex-col gap-4 overflow-hidden
        ${
          isActive
            ? "bg-bg-dark ring-4 ring-primary shadow-[0_0_50px] shadow-primary/40"
            : "bg-bg-dark/95 border border-white/10 shadow-2xl hover:border-primary/40"
        }
      `}
      >
        {/* Image container */}
        <div
          className={`relative w-full aspect-square rounded-[1.8rem] overflow-hidden bg-zinc-900 shadow-2xl shrink-0 transition-all duration-500 
          ${isDimmed ? "grayscale opacity-50" : ""}`}
        >
          {isPlaceholder ? (
            /* COLOR FILL: Instead of the placeholder image */
            <div className="w-full h-full bg-[#2a1933] flex items-center justify-center">
              <div className="text-white/10 font-black text-8xl tracking-tighter select-none">
                ?
              </div>
            </div>
          ) : (
            /* ACTUAL IMAGE */
            <img
              src={imgSrc}
              className="w-full h-full object-cover transition-transform duration-700 opacity-90"
              alt=""
            />
          )}

          {/* Inner shadow layer—it definitely stays on */}
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] pointer-events-none" />
        </div>

        {/* Texts */}
        <div className="flex flex-col grow justify-start min-h-0 px-1 pt-1 overflow-hidden sm:gap-1">
          <p className="text-white font-black text-sm sm:text-base leading-tight tracking-tight truncate">
            {isPlaceholder ? "?????????" : song.title}
          </p>

          <p className="text-primary font-bold text-[8px] sm:text-[10px] uppercase tracking-[0.15em] mt-1.5 opacity-80 truncate">
            {isPlaceholder ? "????" : song.artist}
          </p>
        </div>
      </div>

      {/* COLLAPSED INDICATOR BADGE */}
      {isCollapsed && collapsedCount !== undefined && collapsedCount > 0 && (
        <div
          className={`absolute top-1/2  left-[93%] -translate-y-8 z-40 pointer-events-none flex items-center transition-all 
          ${isDimmed ? "grayscale opacity-60" : ""}`}
        >
          {/* Collapsed Indicator */}
          <div className="bg-bg-dark flex-col backdrop-blur-md px-3 py-1.5 rounded-xl border border-primary/60 flex items-center gap-2 shadow-[0_0_20px] shadow-primary/30 whitespace-nowrap">
            <Layers size={22} className="text-primary" />
            <span className="text-white font-black text-[14px] uppercase tracking-wider">
              +{collapsedCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
