import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface LeaveGameButtonProps {
  onConfirm: () => void;
  children?: React.ReactNode;
}

const LeaveGameButton: React.FC<LeaveGameButtonProps> = ({
  onConfirm,
  children,
}) => {
  const { t } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      {children ? (
        <div
          className="w-full cursor-pointer"
          onClick={() => setShowConfirm(true)}
        >
          {children}
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="group relative flex items-center gap-[0.4em] 
           px-3 py-3
            text-[clamp(9px,1.2vw,12px)] 
            bg-red-500 rounded-[clamp(8px,1vw,12px)] 
            text-white font-bold uppercase tracking-widest 
            transition-all duration-300 hover:scale-105 font-archivo"
        >
          <span>{t.leaveButtonLabel}</span>
        </button>
      )}

      {/* Full screen confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-500/20 p-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <h3 className="mb-2 text-center text-xl font-bold text-white">
              {t.leaveTitle}
            </h3>

            <p className="text-center mb-5 text-slate-300 italic text-fluid-p">
              {t.leaveWarning}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="w-full rounded-xl bg-red-700 py-3 font-bold text-white transition hover:bg-red-600 active:scale-95"
              >
                <p className="text-fluid-p tracking-widest font-archivo">{t.leaveConfirm}</p>
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full rounded-xl bg-slate-800 py-3 font-bold text-slate-300 transition hover:bg-slate-700 active:scale-95"
              >
                <p className="text-fluid-p">{t.leaveCancel}</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveGameButton;
