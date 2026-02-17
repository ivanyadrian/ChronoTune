import type { Card } from "../types";

interface SongCardProps {
  card: Card;
  isActive?: boolean; // Ha a sárga "húzott" kártyáról van szó
  showYear?: boolean;
}

export const SongCard = ({ card, isActive, showYear = true }: SongCardProps) => {
  return (
    <div className={`p-4 rounded-xl shadow-xl w-40 h-52 flex flex-col justify-between border-b-4 transition-transform hover:scale-105 ${
      isActive ? "bg-yellow-500 text-slate-900 border-yellow-700" : "bg-white text-slate-900 border-yellow-500"
    }`}>
      <div>
        <p className={`text-[9px] font-black uppercase truncate ${isActive ? "text-yellow-900/60" : "text-slate-400"}`}>
          {card.artist}
        </p>
        <p className="font-bold text-xs leading-tight line-clamp-2">{card.title}</p>
      </div>
      <div className="text-center">
        {showYear && <p className={`text-2xl font-black ${isActive ? "text-slate-900" : "text-yellow-600"}`}>{card.year}</p>}
      </div>
    </div>
  );
};