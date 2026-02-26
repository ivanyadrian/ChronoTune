// frontend/src/components/TimeLine.tsx
import React, { useState } from "react";
import type { Song } from "../types";
import { SongCard } from "./SongCard";

interface TimelineProps {
  timeline: Song[];
  currentSong: Song | null;
  hoveredSlot: number | null;
  isDragging: boolean;
  pendingIndex: number | null;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  slotRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onStartDrag: (e: React.MouseEvent<HTMLDivElement>) => void;
  onConfirm: () => void;
}

export const TimeLine = ({
  timeline,
  currentSong,
  hoveredSlot,
  isDragging,
  pendingIndex,
  timelineRef,
  slotRefs,
  onStartDrag,
  onConfirm,
}: TimelineProps) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDragging || (e.target as HTMLElement).closest("button")) return;
    setIsMouseDown(true);
    setStartX(e.pageX - (timelineRef.current?.offsetLeft || 0));
    setScrollLeft(timelineRef.current?.scrollLeft || 0);
  };

  const handleMouseLeaveOrUp = () => setIsMouseDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || isDragging) return;
    e.preventDefault();
    const x = e.pageX - (timelineRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (timelineRef.current) timelineRef.current.scrollLeft = scrollLeft - walk;
  };

  const timelineCount = timeline.length + 1;

  return (
    <div
      ref={timelineRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeaveOrUp}
      onMouseUp={handleMouseLeaveOrUp}
      onMouseMove={handleMouseMove}
      className={`bg-slate-800/20 p-10 rounded-[4rem] border border-slate-700/30 overflow-x-auto scrollbar-hide select-none transition-all duration-500 ${
        isDragging ? "scroll-auto" : "scroll-smooth"
      } ${isMouseDown ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ scrollBehavior: isMouseDown ? "auto" : "smooth" }}
    >
      <div
        className={`flex flex-nowrap items-center gap-0 min-w-max px-5 ${
          // Ha a kártyák száma kevés (pl. kevesebb mint 4), akkor tartsuk középen
          timeline.length < 4 ? "justify-center" : "justify-start"
        }`}
      >
        {Array.from({ length: timelineCount }).map((_, i) => {
          const isPending = pendingIndex === i;
          const isHovered = hoveredSlot === i && isDragging;

          return (
            <div
              key={`slot-group-${i}`}
              className="flex items-center shrink-0"
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
            >
              <div
                className={`flex items-center justify-center relative transition-all duration-300 ${
                  isPending || isHovered ? "w-56 mx-0" : "w-0 mx-0"
                }`}
              >
                {/* Ghost Slot (Vonszolás közben) */}
                <div
                  className={`absolute transition-all duration-300 rounded-2xl border-2 overflow-hidden ${
                    isHovered
                      ? "border-yellow-400 bg-yellow-500/10 w-48 h-64 opacity-100 scale-100"
                      : "w-48 h-64 opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {isHovered && currentSong && (
                    <img
                      src={currentSong.cover}
                      alt=""
                      className="w-full h-full object-cover opacity-20"
                    />
                  )}
                </div>

                {/* Pending Card (Elengedés után) */}
                {isPending && currentSong && (
                  <div
                    className="relative animate-in zoom-in duration-300 shrink-0 z-10"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onStartDrag(e);
                    }}
                  >
                    <div className="ring-4 ring-green-500/50 shadow-2xl rounded-2xl scale-105 bg-slate-900">
                      <SongCard song={currentSong} showYear={false} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirm();
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-3xl shadow-lg border-4 border-slate-900 hover:scale-110 transition-transform"
                    >
                      ✓
                    </button>
                  </div>
                )}
              </div>

              {/* Fix kártyák (Az eredeti timeline elemei) */}
              {i < timeline.length && (
                <div className="shrink-0 mx-4">
                  <SongCard song={timeline[i]} showYear={true} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
