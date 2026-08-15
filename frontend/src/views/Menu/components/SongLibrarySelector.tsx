import { useLanguage } from "../../../context/LanguageContext";
import { Library } from "lucide-react";

interface SongLibrarySelectorProps {
  value: 'hu' | 'en';
  onChange: (val: 'hu' | 'en') => void;
  disabled?: boolean;
}

export const SongLibrarySelector = ({ value, onChange, disabled = false }: SongLibrarySelectorProps) => {
  const { t } = useLanguage();

  const options: { key: 'hu' | 'en'; label: string; desc: string }[] = [
    { key: 'hu', label: t.songLibraryHu, desc: t.songLibraryHuDesc },
    { key: 'en', label: t.songLibraryEn, desc: t.songLibraryEnDesc },
  ];

  return (
    <div className={`w-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>

      {/* Section header */}
      <div className="flex gap-2 sm:gap-3 items-center mb-5">
        <Library size={22} className="text-secondary fill-secondary/20 shrink-0" />
        <h2 className="text-base sm:text-xl font-archivo text-white tracking-widest uppercase italic">
          {t.songLibraryLabel}
        </h2>
      </div>

      {/* Pill switcher */}
      <div className="relative grid grid-cols-1 xs:grid-cols-2 bg-[#241631] border border-white/8 rounded-2xl p-1.5 gap-1">
        {/* Vertical Slider (below xs) */}
        <div
          className="xs:hidden absolute left-1.5 right-1.5 h-[calc(50%-8px)] rounded-[10px] bg-primary/15 border border-primary/40 shadow-[0_0_14px] shadow-primary/20 transition-all duration-300 ease-in-out"
          style={{ top: value === 'hu' ? '6px' : 'calc(50% + 2px)' }}
        />

        {/* Horizontal Slider (xs and up) */}
        <div
          className="hidden xs:block absolute top-1.5 bottom-1.5 w-[calc(50%-8px)] rounded-[10px] bg-primary/15 border border-primary/40 shadow-[0_0_14px] shadow-primary/20 transition-all duration-300 ease-in-out"
          style={{ left: value === 'hu' ? '6px' : 'calc(50% + 2px)' }}
        />

        {options.map((opt) => {
          const isActive = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              className={`
                relative flex items-center justify-center py-2.5 sm:py-3 px-2 sm:px-4 rounded-[10px]
                transition-all duration-300 z-10 overflow-hidden
                ${isActive ? 'text-primary' : 'text-slate-400 hover:text-white/70'}
              `}
            >
              <span className={`font-archivo text-xs xs:text-[10px] sm:text-xs md:text-sm uppercase tracking-wider sm:tracking-widest font-bold transition-colors duration-300 truncate`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
