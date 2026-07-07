import React from "react";

interface TimelinePreviewProps {
  targetLength: number;
}

export const TimelinePreview = ({ targetLength }: TimelinePreviewProps) => {
  // Extracted styles to reduce redundancy
  const cardSlotClass = "flex items-center justify-center w-7 h-11 sm:w-12 sm:h-16 rounded-lg border-2 border-dashed border-secondary/40 bg-black/20 shrink-0";
  const dashedLineClass = "grow h-px border-t border-dashed border-secondary/40 mx-1 sm:mx-2 min-w-2";

  return (
    <div className="bg-[#150a1d] border border-white/5 p-4 sm:p-6 rounded-4xl sm:rounded-[3rem] shadow-2xl relative overflow-hidden">
      <div className="flex items-center w-full relative z-10 overflow-x-auto pb-0.5">
        
        {/* Fixed card slots */}
        {[1, 2, 3, 4].map((num) => (
          <React.Fragment key={num}>
            <div className={`${cardSlotClass} ${num === 3 ? "hidden sm:flex" : ""} ${num === 4 ? "hidden lg:flex" : ""}`}>
              <span className="text-xs sm:text-sm font-black text-slate-700">{num}</span>
            </div>
            <div className={`${dashedLineClass} ${num === 3 ? "hidden sm:block" : ""} ${num === 4 ? "hidden lg:block" : ""}`} />
          </React.Fragment>
        ))}

        {/* Three-dot transition (Unnecessary fragment removed) */}
        <div className={cardSlotClass}>
          <span className="text-xs sm:text-sm font-black text-slate-700">...</span>
        </div>
        <div className={dashedLineClass} />

        {/* Destination / last card */}
        <div className="flex items-center justify-center w-8 h-12 sm:w-13 sm:h-17 rounded-lg bg-primary shrink-0 animate-pulse-slow">
          <span className="text-base sm:text-xl font-black text-white italic">
            {targetLength}
          </span>
        </div>
        
      </div>
    </div>
  );
};