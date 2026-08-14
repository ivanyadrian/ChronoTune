import React, { useState, useEffect } from "react";
import { Check, HelpCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { isTutorialHidden } from "../../utils/storageUtils";

export interface InfoModalSection {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface InfoModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  sections: InfoModalSection[];
  storageKey: string;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  sections,
  storageKey,
}) => {
  const { t } = useLanguage();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDontShowAgain(isTutorialHidden(storageKey));
    }
  }, [isOpen, storageKey]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose(dontShowAgain);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, dontShowAgain, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose(dontShowAgain);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => onClose(dontShowAgain)}
    >
      <div
        className="relative w-full max-w-xl bg-[rgb(22,9,32)]/95 backdrop-blur-2xl border border-white/10 border-t-4 border-t-purple-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col gap-5 animate-in zoom-in-95 duration-200 max-h-[85vh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-secondary-light">
              {icon || <HelpCircle className="w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-archivo">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-slate-400 font-normal mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sections list */}
        <div className="flex flex-col gap-4 py-1 overflow-y-auto custom-scrollbar pr-2 min-h-0 flex-1">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl items-start hover:border-white/10 transition-colors"
            >
              {section.icon && (
                <div className="shrink-0 p-2.5 bg-secondary-light/10 text-secondary-light rounded-xl mt-0.5">
                  {section.icon}
                </div>
              )}
              <div className="space-y-1">
                <h3 className="font-semibold text-white text-base">
                  {section.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Checkbox & Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10 shrink-0">
          <label className="flex items-center gap-3 cursor-pointer select-none text-slate-300 hover:text-white transition-colors group">
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                dontShowAgain
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "border-white/20 bg-black/30 group-hover:border-purple-400"
              }`}
            >
              {dontShowAgain && <Check className="w-3.5 h-3.5 stroke-3" />}
            </div>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm font-medium">
              {t.tutorialDontShowAgain}
            </span>
          </label>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-2xl transition-all duration-200 cursor-pointer"
          >
            {t.tutorialGotIt}
          </button>
        </div>
      </div>
    </div>
  );
};
