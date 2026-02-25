import type { Song } from "../types";
import { useEffect, useState } from "react";

const PLACEHOLDER = "/cover_placeholder.jpg";

interface SongCardProps {
  song: Song;
  isActive?: boolean;
  showYear?: boolean;
}

export const SongCard = ({ song, isActive, showYear = true }: SongCardProps) => {
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
    <div
      className={`group relative p-3 rounded-2xl transition-all duration-300 w-48 h-64 flex flex-col gap-3 ${isActive
          ? "bg-slate-800 ring-2 ring-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
          : "bg-slate-900/40 hover:bg-slate-800/60 border border-slate-700/50 shadow-lg"
        }`}
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md bg-slate-800">
        <img
          src={imgSrc}
          alt={`${song.artist} - ${song.title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => {
            if (imgSrc !== PLACEHOLDER) setImgSrc(PLACEHOLDER);
          }}
        />

        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] pointer-events-none"></div>

        {!showYear && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-black/40 backdrop-blur-md p-2 rounded-full">
              <span className="text-xl">🎵</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col grow justify-between min-h-0">
        <div className="space-y-0.5">
          <p className="text-white font-bold text-sm leading-tight line-clamp-2 tracking-tight">
            {song.title}
          </p>
          <p className="text-slate-400 font-medium text-[11px] truncate">
            {song.artist}
          </p>
        </div>

        {showYear && (
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/50">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Kiadva
            </span>
            <span className="text-yellow-500 font-black text-lg leading-none">
              {song.year}.{String(song.month).padStart(2, "0")}.{String(song.day).padStart(2, "0")}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
