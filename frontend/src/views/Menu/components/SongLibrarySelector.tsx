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
      <div className="relative flex bg-[#241631] border border-white/8 rounded-2xl p-1.5 gap-1">
        {/* Sliding highlight */}
        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[10px] bg-primary/15 border border-primary/40 shadow-[0_0_14px] shadow-primary/20 transition-all duration-300 ease-in-out"
          style={{ left: value === 'hu' ? '6px' : 'calc(50% + 3px)' }}
        />

        {options.map((opt) => {
          const isActive = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              className={`
                relative flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-[10px]
                transition-all duration-300 z-10
                ${isActive ? 'text-primary' : 'text-slate-400 hover:text-white/70'}
              `}
            >
              <span className={`font-archivo text-sm uppercase tracking-widest font-bold transition-colors duration-300`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
