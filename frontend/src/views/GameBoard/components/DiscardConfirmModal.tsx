import { useLanguage } from "../../../context/LanguageContext";
import { useLockBodyScroll } from "../../../hooks/useLockBodyScroll";

interface DiscardConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DiscardConfirmModal = ({ isOpen, onClose, onConfirm }: DiscardConfirmModalProps) => {
  useLockBodyScroll(isOpen);
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-bg-dark border-2 border-secondary/30 p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <h3 className="text-xl font-archivo text-white italic uppercase tracking-tighter mb-4 text-center">
          {t.discardTitle}
        </h3>
        <p className="text-slate-400 text-sm mb-8 text-center leading-relaxed">
          {t.discardDesc} <br />
          <span className="text-red-400 font-bold">
            {t.discardPenalty}
          </span>
        </p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
          >
            {t.discardCancel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-archivo uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:brightness-110 transition-all"
          >
            {t.discardConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};