import { Flag, HeartCrack, Info, Play } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import BackButton from "../../../components/ui/BackButton";
import RangeSlider from "../../../components/RangeSlider";
import { MistakeModeCard } from "../components/MistakeModeCard";
import { TimelinePreview } from "../components/TimelinePreview";
import { MISTAKE_MODES } from "../constants/mistakeModes";

interface SoloConfigStepProps {
  userName: string;
  targetLength: number;
  setTargetLength: (value: number) => void;
  selectedMaxMistakes: number | null | undefined;
  setSelectedMaxMistakes: (value: number | null | undefined) => void;
  onStart: () => void;
  onBack: () => void;
}

export const SoloConfigStep = ({
  userName,
  targetLength,
  setTargetLength,
  selectedMaxMistakes,
  setSelectedMaxMistakes,
  onStart,
  onBack,
}: SoloConfigStepProps) => {
  const activeOption = MISTAKE_MODES.find(
    (m) => m.value === selectedMaxMistakes,
  );

  return (
    <div className="border rounded-2xl p-4 sm:p-8 mt-3 sm:mt-0 bg-surface-dark border-secondary/20 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <Badge text="Single Player" />
        <BackButton onClick={onBack} />
      </div>

      <div className="flex flex-col gap-3 text-start">
        <h1 className="text-fluid-h1 font-archivo text-white tracking-tighter">
          Testreszabás
        </h1>
        <p className="text-fluid-p text-slate-400 max-w-md">
          Állítsd be, hány körből álljon a kihívás. Minden körben egy újabb
          kártyát próbálhatsz meg elhelyezni a timeline-on.
        </p>
      </div>

      {/* Game length */}
      <div className="mt-8 sm:mt-24 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <div className="flex gap-2 sm:gap-3 items-center">
            <Flag
              size={22}
              className="text-secondary fill-secondary/20 sm:w-6.5 sm:h-6.5"
            />
            <h2 className="text-base sm:text-xl font-archivo text-white tracking-widest uppercase italic">
              Játék hossza
            </h2>
          </div>
          <button className="flex gap-2 items-center text-slate-400 hover:text-white transition-colors text-xs sm:text-sm font-medium">
            <span className="hidden sm:inline">Hogyan nyerhetek?</span>
            <Info size={18} />
          </button>
        </div>

        <div className="bg-[#241631] border border-white/5 p-5 sm:p-8 lg:p-10 rounded-4xl shadow-2xl">
          <div className="flex justify-start items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <span className="text-primary text-lg sm:text-xl font-lilita italic leading-none drop-shadow-[0_0_7px] shadow-primary">
              {targetLength}
            </span>
            <h3 className="text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500 leading-none">
              lehetőséged lesz kártyát elhelyezni
            </h3>
          </div>
          <RangeSlider
            value={targetLength}
            onChange={setTargetLength}
            min={5}
            max={25}
            marks={[5, 10, 15, 20, 25]}
          />
        </div>
      </div>

      {/* Mistake limit */}
      <div className="mt-15 sm:mt-20 w-full max-w-6xl mx-auto">
        <div className="flex gap-2 sm:gap-3 items-center mb-6">
          <HeartCrack
            size={22}
            className="text-secondary fill-secondary/20 sm:w-6.5 sm:h-6.5"
          />
          <h2 className="text-sm sm:text-xl font-archivo text-white tracking-widest uppercase italic">
            Hibahatár beállítása
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {MISTAKE_MODES.map((mode) => (
            <MistakeModeCard
              key={mode.id}
              mode={mode}
              isActive={selectedMaxMistakes === mode.value}
              onClick={() => setSelectedMaxMistakes(mode.value)}
            />
          ))}
        </div>

        {activeOption ? (
          <div
            className={`mt-4 sm:mt-8 px-4 py-3 bg-white/5 border-l-4 rounded-r-xl transition-all duration-500 animate-in fade-in zoom-in-95 ${activeOption.borderClass}`}
          >
            <p
              className={`text-xs sm:text-base italic font-medium tracking-wide transition-colors duration-300 ${activeOption.colorClass}`}
            >
              {activeOption.desc}
            </p>
          </div>
        ) : (
          <div
            className="mt-4 sm:mt-8 px-4 py-3 bg-white/5 border-l-4 border-slate-500/30 rounded-r-xl transition-all duration-500"
          >
            <p className="text-xs sm:text-base italic font-medium tracking-wide text-slate-400">
              Válassz ki egy hibahatárt a folytatáshoz!
            </p>
          </div>
        )}
      </div>

      {/* Timeline Preview */}
      <div className="mt-10 sm:mt-20 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-5 sm:mb-8 flex-wrap gap-2">
          <h2 className="text-base sm:text-xl font-archivo text-white tracking-widest uppercase italic">
            Timeline Preview
          </h2>
          <div className="w-fit flex justify-center items-center border-2 border-primary/30 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 bg-primary/5 shadow-[0_0_15px] shadow-primary/20">
            <span className="text-primary font-archivo text-xs sm:text-sm uppercase tracking-wider">
              {targetLength} kártya
            </span>
          </div>
        </div>
        <TimelinePreview targetLength={targetLength} />
      </div>

      <button
        disabled={!userName.trim() || selectedMaxMistakes === undefined}
        onClick={onStart}
        className="font-archivo p-[clamp(0.85rem,2.5vw,1.15rem)] text-[clamp(0.875rem,1.5vw,1rem)] mt-[clamp(2rem,6vw,2.5rem)] w-full rounded-full bg-primary text-white flex items-center justify-center gap-[clamp(0.5rem,1.5vw,0.75rem)] tracking-widest uppercase transition-all hover:brightness-110 hover:shadow-[0_0_20px_3px] hover:scale-102 active:scale-98 hover:shadow-primary/40 disabled:opacity-30 disabled:grayscale"
      >
        <Play
          size={20}
          className="w-[clamp(1rem,2vw,1.25rem)] fill-white"
          strokeWidth={3}
        />
        Játék Indítása
      </button>
    </div>
  );
};
