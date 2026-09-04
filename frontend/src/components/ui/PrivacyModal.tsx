import React, { useEffect } from "react";
import { ShieldCheck, Cookie, HardDrive, Lock, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  useLockBodyScroll(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    {
      icon: <Cookie className="w-5 h-5 text-amber-400" />,
      title: t.privacyNoCookiesTitle,
      description: t.privacyNoCookiesDesc,
    },
    {
      icon: <HardDrive className="w-5 h-5 text-purple-400" />,
      title: t.privacyStorageTitle,
      description: t.privacyStorageDesc,
    },
    {
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      title: t.privacyDataTitle,
      description: t.privacyDataDesc,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[rgb(22,9,32)]/95 backdrop-blur-2xl border border-white/10 border-t-4 border-t-purple-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col gap-5 animate-in zoom-in-95 duration-200 max-h-[85vh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-secondary-light">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-archivo">
                {t.privacyTitle}
              </h2>
              <p className="text-sm text-slate-400 font-normal mt-0.5">
                {t.privacySubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sections list */}
        <div className="flex flex-col gap-4 py-1 overflow-y-auto custom-scrollbar pr-2 min-h-0 flex-1">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl items-start hover:border-white/10 transition-colors"
            >
              <div className="shrink-0 p-2.5 bg-white/5 border border-white/10 rounded-xl mt-0.5">
                {section.icon}
              </div>
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

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-7 py-3 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-2xl transition-all duration-200 cursor-pointer shadow-lg shadow-purple-900/30"
          >
            {t.privacyClose}
          </button>
        </div>
      </div>
    </div>
  );
};
