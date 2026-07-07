import { Shield, Heart } from "lucide-react";
// Import the updated type
import type { MistakeMode } from "../constants/mistakeModes";

interface MistakeModeCardProps {
  mode: MistakeMode;
  isActive: boolean;
  onClick: () => void;
}

export const MistakeModeCard = ({ mode, isActive, onClick }: MistakeModeCardProps) => {
  const cardStyle = isActive ? { boxShadow: `0 0 20px ${mode.activeGlow}` } : undefined;

  return (
    <button
      onClick={onClick}
      style={cardStyle}
      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
        isActive
          ? `${mode.activeBg} ${mode.borderClass}` // Removed unnecessary ring-1 since it's already in mode.activeBg
          : "bg-black/20 border-white/5 opacity-40 hover:opacity-60"
      }`}
    >
      <span
        className={`text-[7px] sm:text-[9px] font-black tracking-widest px-1.5 py-0.5 mb-2 rounded-md border transition-colors ${
          isActive ? mode.badgeClass : "bg-white/5 border-white/10 text-slate-500"
        }`}
      >
        {mode.label}
      </span>

      <div className="flex items-center justify-center">
        {mode.value === null ? (
          <Shield
            className={`w-10 h-10 sm:w-14 sm:h-14 transition-colors ${
              isActive ? `${mode.colorClass} ${mode.fillClass}` : "text-slate-500 fill-slate-500"
            }`}
          />
        ) : (
          <div className={`flex items-center font-black text-3xl sm:text-5xl italic transition-colors ${isActive ? mode.colorClass : "text-slate-500"}`}>
            <span>{mode.value}X</span>
            <Heart className={`w-10 h-10 sm:w-14 sm:h-14 -m-1 transition-colors ${isActive ? mode.fillClass : "fill-slate-500"}`} />
          </div>
        )}
      </div>
    </button>
  );
};