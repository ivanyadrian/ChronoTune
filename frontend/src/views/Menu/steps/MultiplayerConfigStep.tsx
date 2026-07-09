import { useRef } from "react";
import { Plus, Users, MoveRight } from "lucide-react";
import BackButton from "../../../components/ui/BackButton";


interface MultiplayerConfigStepProps {
  // userName: string;
  // targetLength: number;
  // setTargetLength: (value: number) => void;
  // selectedMaxMistakes: number | null | undefined;
  // setSelectedMaxMistakes: (value: number | null | undefined) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
  inputCode: string;
  setInputCode: (value: string) => void;
}

export const MultiplayerConfigStep = ({
  onCreateRoom,
  onJoinRoom,
  onBack,
  inputCode,
  setInputCode,
}: MultiplayerConfigStepProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleJoin = () => {
    if (/^[A-Z0-9]{4}$/.test(inputCode)) {
      onJoinRoom(inputCode);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-7xl py-6 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 w-full items-stretch">
        {/* Create card */}
        <div className="flex-1 bg-bg-dark/60 backdrop-blur-md border-2 border-secondary/10 rounded-[2.5rem] p-6 sm:p-12 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_60px] shadow-primary/10 flex flex-col items-center text-center group">
          <div className="w-full">
            <div className="mb-6 sm:mb-8 p-5 sm:p-6 bg-primary/10 w-fit mx-auto rounded-full border border-secondary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Plus
                size={32}
                className="text-primary sm:w-10 sm:h-10"
                strokeWidth={3}
              />
            </div>
            <h3 className="text-2xl sm:text-4xl font-archivo text-white italic uppercase tracking-tighter">
              Új játék
            </h3>
            <p className="text-xs sm:text-base text-slate-400 mt-4 leading-relaxed max-w-xs mx-auto">
              Készíts egy új szobát, ahová a barátaid csatlakozhatnak a
              kóddal.
            </p>
          </div>

          <div className="relative w-full max-w-sm mt-8 sm:mt-16 lg:mt-auto">
            <div className="absolute -inset-1 bg-linear-to-r from-(--primary) to-[color-mix(in_srgb,var(--primary)_80%,black)] rounded-full blur-xl opacity-20 group-hover:opacity-60 transition duration-500" />
            <button
              onClick={onCreateRoom}
              className="relative w-full py-4 sm:py-5 px-6 sm:px-10 bg-linear-to-b from-(--primary) to-[color-mix(in_srgb,var(--primary)_80%,black)] rounded-full flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="text-white font-archivo text-[clamp(0.875rem,1.5vw,1rem)] uppercase tracking-wider">
                Létrehozás
              </span>
            </button>
          </div>
        </div>

        {/* Join card */}
        <div className="flex-1 bg-bg-dark/60 backdrop-blur-md border-2 border-secondary/10 rounded-[2.5rem] p-6 sm:p-12 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_60px] shadow-primary/10 flex flex-col items-center text-center group">
          <div className="w-full">
            <div className="mb-6 sm:mb-8 p-5 sm:p-6 bg-primary/10 w-fit mx-auto rounded-full border border-secondary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Users
                size={32}
                className="text-primary sm:w-10 sm:h-10"
                strokeWidth={2.5}
              />
            </div>
            <h3 className="text-2xl sm:text-4xl font-archivo text-white italic uppercase tracking-tighter">
              Csatlakozás
            </h3>
            <p className="text-xs sm:text-base text-slate-400 mt-4 leading-relaxed max-w-xs mx-auto">
              Írd be a 4 jegyű azonosítót a belépéshez.
            </p>
          </div>

          <div className="w-full max-w-sm mt-8 sm:mt-12 lg:mt-auto">
            <label className="text-[9px] sm:text-[10px] font-archivo uppercase tracking-[0.3em] text-slate-500 lg:mt-10 mb-4 block">
              Szoba azonosító
            </label>

            <div className="flex justify-between gap-2 sm:gap-3 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={inputCode[index] || ""}
                  placeholder="·"
                  onPaste={(e) => {
                    e.preventDefault();

                    const pastedData = e.clipboardData
                      .getData("text")
                      .toUpperCase();

                    const cleanedCode = pastedData
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 4);

                    if (cleanedCode.length > 0) {
                      setInputCode(cleanedCode);

                      requestAnimationFrame(() => {
                        const lastIndex = Math.min(
                          cleanedCode.length - 1,
                          3
                        );

                        inputRefs.current[lastIndex]?.focus();
                      });
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();

                    if (/^[A-Z0-9]?$/.test(val)) {
                      const newCode = inputCode
                        .padEnd(4, " ")
                        .split("");

                      newCode[index] = val;

                      setInputCode(newCode.join("").trimEnd());

                      if (
                        val &&
                        inputRefs.current[index + 1]
                      ) {
                        inputRefs.current[index + 1]?.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Backspace" &&
                      !inputCode[index] &&
                      inputRefs.current[index - 1]
                    ) {
                      inputRefs.current[index - 1]?.focus();
                    }
                  }}
                  className="w-full aspect-square sm:w-full sm:h-20 bg-black/40 border-2 border-secondary/10 focus:border-primary/50 focus:bg-black/60 rounded-xl sm:rounded-2xl text-center font-archivo text-xl sm:text-3xl text-primary outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <button
              onClick={handleJoin}
              disabled={!/^[A-Z0-9]{4}$/.test(inputCode)}
              className="w-full py-4 sm:py-5 px-6 border-2 border-primary rounded-full flex items-center justify-center gap-3 transition-all hover:bg-primary/10 active:scale-95 disabled:opacity-20 disabled:grayscale"
            >
              <span className="text-primary font-archivo text-sm sm:text-lg uppercase tracking-wider">
                Belépés
              </span>
              <MoveRight
                size={18}
                className="text-primary sm:w-5 sm:h-5"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <BackButton onClick={onBack} />
      </div>
    </div>
  );
};