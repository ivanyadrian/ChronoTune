import { useState, useEffect } from "react";
import { Check, Users, LogOut, TriangleAlert, Info } from "lucide-react";

interface ToastProps {
  message?: string;
  type?: "success" | "info" | "leave" | "error" | "join";
  icon?: React.ReactNode;
  isVisible: boolean;
}

export const Toast = ({
  message,
  type = "info",
  icon,
  isVisible,
}: ToastProps) => {
  // Lokális állapot a tartalom megőrzéséhez az animáció alatt
  const [displayMessage, setDisplayMessage] = useState(message);
  const [displayType, setDisplayType] = useState(type);
  const [displayIcon, setDisplayIcon] = useState(icon);

  useEffect(() => {
    if (isVisible) {
      setDisplayMessage(message);
      setDisplayType(type);
      setDisplayIcon(icon);
    }
  }, [isVisible, message, type, icon]);

  return (
    <div className="fixed top-4 sm:top-6 left-1/2 z-100  w-[calc(100%-2rem)] sm:w-auto pointer-events-none">
      <div
        className={`transition-all duration-500 ease-in-out
          ${
            isVisible
              ? "translate-y-0 -translate-x-1/2 opacity-100"
              : "-translate-y-20 -translate-x-1/2 opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-bg-dark/95 backdrop-blur-md border border-primary/50 px-5 py-2.5 sm:px-6 rounded-2xl 
        sm:rounded-full flex items-center justify-center sm:justify-start gap-3 shadow-[0_0_30px] shadow-primary/20 
        mx-auto max-w-xs sm:max-w-none">
          {/* Icon Container - Flex Center Added */}
          <div
            className={`${
              displayType === "leave" || displayType === "error"
                ? "bg-red-500"
                : "bg-primary"
            } rounded-full p-1.5 shrink-0 flex items-center justify-center`}
          >
            {displayIcon ? (
              displayIcon
            ) : (
              <div className="flex items-center justify-center text-center">
                {displayType === "success" && (
                  <Check size={14} className="text-white" strokeWidth={3} />
                )}
                {displayType === "join" && (
                  <Users size={14} className="text-white" strokeWidth={3} />
                )}
                {displayType === "leave" && (
                  <LogOut size={14} className="text-white" strokeWidth={3} />
                )}
                {displayType === "info" && (
                  <Info size={14} className="text-white" strokeWidth={3} />
                )}
                {displayType === "error" && (
                  <TriangleAlert
                    size={14}
                    className="text-white"
                    strokeWidth={3}
                  />
                )}
              </div>
            )}
          </div>

          {/* Text - Leading-none helps with vertical centering */}
          <span className="text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] leading-4 mb-px">
            {displayMessage}
          </span>
        </div>
      </div>
    </div>
  );
};
