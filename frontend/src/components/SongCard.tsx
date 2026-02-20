import type { Card } from "../types";

interface SongCardProps {
  card: Card;
  isActive?: boolean; // Ha a sárga "húzott" kártyáról van szó
  showYear?: boolean;
}

const getCoverArt = (youtubeId: string) => {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
};

export const SongCard = ({ card, isActive, showYear = true }: SongCardProps) => {
  return (
    <div className={`group relative p-3 rounded-2xl transition-all duration-300 w-48 h-64 flex flex-col gap-3 ${
      isActive 
        ? "bg-slate-800 ring-2 ring-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]" 
        : "bg-slate-900/40 hover:bg-slate-800/60 border border-slate-700/50 shadow-lg"
    }`}>
      
      {/* Borítókép (YouTube Music stílusú négyzet) */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md">
        <img 
          src={getCoverArt(card.youtubeId ?? "")} 
          alt={`${card.artist} - ${card.title}`}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            !showYear ? "blur-md grayscale opacity-50" : ""
          }`}
        />
        {/* YT Music-szerű finom belső árnyék */}
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]"></div>
        
        {!showYear && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/40 backdrop-blur-md p-2 rounded-full">
               <span className="text-xl">🎵</span>
            </div>
          </div>
        )}
      </div>

      {/* Szöveges rész (YT Music tipográfia) */}
      <div className="flex flex-col grow justify-between min-h-0">
        <div className="space-y-0.5">
          <p className="text-white font-bold text-sm leading-tight line-clamp-2 tracking-tight">
            {card.title}
          </p>
          <p className="text-slate-400 font-medium text-[11px] truncate">
            {card.artist}
          </p>
        </div>

        {/* Évszám (Ha látható, kiemelt, de elegáns) */}
        {showYear && (
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/50">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kiadva</span>
            <span className="text-yellow-500 font-black text-lg leading-none">
              {card.year}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};