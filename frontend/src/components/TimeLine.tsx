// frontend/src/components/TimeLine.tsx
import React, { useEffect, useState, useCallback } from "react";
import type { Song } from "../types";
import { SongCard } from "./SongCard";
import {
  Plus,
  Check,
  Hand,
  Minimize2,
  MoveLeft,
  MoveRight,
  Minus,
} from "lucide-react";

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
  setPendingIndex: (index: number | null) => void;
  isMyTurn: boolean;
  activePlayerName?: string;
  isSolo?: boolean;
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
  setPendingIndex,
  isMyTurn,
}: TimelineProps) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [collapsedStarts, setCollapsedStarts] = useState<Set<number>>(
    new Set(),
  );

  const [scale, setScale] = useState(1);

  const MIN_SCALE = 0.7;
  const MAX_SCALE = 1.4;
  const STEP = 0.1;
  const [, forceUpdate] = useState({});

  // Helper function to find consecutive blocks
  const blocks = React.useMemo(() => {
    const found: { start: number; end: number; hiddenCount: number }[] = [];
    if (timeline.length < 3) return found;

    let currentStart = 0;
    for (let i = 1; i <= timeline.length; i++) {
      const isConsecutive =
        i < timeline.length && timeline[i].year === timeline[i - 1].year + 1;

      if (!isConsecutive) {
        const length = i - currentStart;
        if (length >= 3) {
          found.push({
            start: currentStart,
            end: i - 1,
            hiddenCount: length - 2,
          });
        }
        currentStart = i;
      }
    }
    return found;
  }, [timeline]);

  const toggleCollapse = (start: number) => {
    setCollapsedStarts((prev) => {
      const next = new Set(prev);

      if (next.has(start)) next.delete(start);
      else next.add(start);

      return next;
    });

    // re-render in next frame
    requestAnimationFrame(() => {
      forceUpdate({});
    });
  };

  // Function to update scroll indicators
  const updateScrollIndicators = useCallback(() => {
    if (timelineRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current;
      // Leave a small (10px) tolerance to avoid rounding errors
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, [timelineRef]);

  // Watch for timeline size or content (number of cards) changes
  useEffect(() => {
    updateScrollIndicators();

    const observer = new ResizeObserver(updateScrollIndicators);
    if (timelineRef.current) observer.observe(timelineRef.current);

    return () => observer.disconnect();
  }, [timeline.length, updateScrollIndicators, scale]);

  const handleScroll = () => {
    updateScrollIndicators();
  };

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

    // use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      if (timelineRef.current) {
        timelineRef.current.scrollLeft = scrollLeft - walk;
      }
    });
  };

  const timelineCount = timeline.length + 1;

  return (
    <div className="relative">
      <div className="absolute bottom-1 right-1 z-40 flex flex-col gap-2">
        <button
          onClick={() => setScale((s) => Math.min(MAX_SCALE, s + STEP))}
          className="w-7 h-7 sm:w-7 sm:h-7 rounded-full bg-bg-dark/90 border border-secondary-light/30 text-white flex items-center justify-center hover:scale-110 transition"
        >
          <Plus className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={() => setScale((s) => Math.max(MIN_SCALE, s - STEP))}
          className="w-7 h-7 sm:w-7 sm:h-7 rounded-full bg-bg-dark/90 border border-secondary-light/30 text-white flex items-center justify-center hover:scale-110 transition"
        >
          <Minus className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>
      </div>
      {/* BAL OLDALI GRAB IKON */}
      <div
        className={`absolute top-1/2 z-30 pointer-events-none transition-all duration-700 flex flex-col items-center gap-1 left-1 ${
          showLeftArrow ? "opacity-100" : "opacity-0 -left-10"
        }`}
      >
        <div className="flex flex-col justify-center items-center animate-pulse text-primary/60">
          <MoveLeft className="-mr-3 w-3 h-3 xs:w-4 xs:h-4" />
          <Hand className="-mr-3 w-4 h-4 xs:w-5 xs:h-5" />
        </div>
      </div>

      {/* RIGHT SIDE GRAB ICON */}
      <div
        className={`absolute top-1/2 z-30 pointer-events-none transition-all duration-700 flex flex-col items-center gap-1 right-1 ${
          showRightArrow ? "opacity-100" : "opacity-0 -right-10"
        }`}
      >
        <div className="flex flex-col justify-center items-center animate-pulse text-primary/60">
          <MoveRight className="-ml-3 w-3 h-3 xs:w-4 xs:h-4" />
          <Hand className="-ml-3 w-4 h-4 xs:w-5 xs:h-5" />
        </div>
      </div>

      <div
        ref={timelineRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className={`w-full py-20 overflow-x-auto select-none ${
          isMouseDown ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          // Removed scroll-smooth because scrolling is done with JS
          // Added will-change to help GPU optimization
          willChange: "scroll-position",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <div className="flex flex-nowrap items-center justify-center min-w-max px-40 relative">
          {/* Horizontal axis line */}
          <div className="absolute h-0.5 bg-white/10 w-full left-0 -z-10 flex justify-between items-center">
            <span className="text-[10px] font-archivo text-slate-600 tracking-widest uppercase -translate-y-1/2 pl-1">
              Start
            </span>
            <span className="text-[10px] font-archivo text-slate-600 tracking-widest uppercase -translate-y-1/2 pr-1">
              End
            </span>
          </div>

          <div
            className="flex items-center"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {blocks.map((block) => {
              const isCollapsed = collapsedStarts.has(block.start);

              // Important: take the current elements from slotRefs.current
              const startEl = slotRefs.current[block.start];
              const endEl = slotRefs.current[block.end];

              // If collapsed, the line should be minimal (or zero),
              // because the two cards are placed next to each other.
              if (!startEl || !endEl) return null;

              return (
                <div
                  key={`connector-${block.start}`}
                  className="absolute -bottom-5 z-20 transition-all duration-300 ease-in-out pointer-events-none"
                  style={{
                    // 'left' is always the center of the starting card
                    left: `${startEl.offsetLeft + startEl.offsetWidth / 2}px`,
                    // The width is the distance between the two cards
                    // If isCollapsed, this value automatically decreases because offsetLefts get closer
                    width: `${endEl.offsetLeft - startEl.offsetLeft}px`,
                    // If collapsed, fade the line or remove it completely
                    opacity: isCollapsed ? 0.3 : 1,
                  }}
                >
                  {/* The Line: We'll use CSS to make the line disappear when the width is small */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-primary to-transparent shadow-[0_0_10px] shadow-primary/50" />

                  {/* The Button: Always positioned in the center of the line */}
                  <button
                    onClick={() => toggleCollapse(block.start)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto
                   px-4 py-1.5 rounded-full bg-[#0a050f] border border-primary 
                   text-primary text-[10px] font-archivo uppercase tracking-widest
                   hover:scale-110 active:scale-95 transition-all
                   flex items-center gap-2 shadow-[0_0_20px] shadow-primary/20"
                  >
                    {isCollapsed ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span>{block.hiddenCount} dal felfedése</span>
                      </>
                    ) : (
                      <>
                        <Minimize2 size={12} />
                        <span>Blokk összecsukása</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}

            {Array.from({ length: timelineCount }).map((_, i) => {
              const isPending = pendingIndex === i;
              const isHovered = hoveredSlot === i && isDragging;
              const isDisabled =
                i > 0 &&
                i < timeline.length &&
                timeline[i].year - timeline[i - 1].year <= 1;

              // --- Block logic ---
              const block = blocks.find((b) => i >= b.start && i <= b.end);
              const blockIsCollapsed =
                block && collapsedStarts.has(block.start);

              // A card is hidden if it's in the MIDDLE of a collapsed block
              const isCardHidden =
                blockIsCollapsed && i > block.start && i < block.end;

              // A slot is hidden if it's right after the START of a collapsed block and it's not the last card
              const isSlotHidden =
                blockIsCollapsed && i > block.start && i <= block.end;

              return (
                <div
                  key={`slot-group-${i}`}
                  className={`flex items-center justify-center shrink-0 ${isCardHidden ? "w-0 overflow-hidden" : ""}`}
                  ref={(el) => {
                    slotRefs.current[i] = el;
                  }}
                >
                  {/* INTERACTIVE SLOT / DROP ZONE */}
                  <div
                    className={`flex items-center justify-center relative transition-all duration-500 ${
                      isPending || isHovered
                        ? "w-64 mx-2 sm:mx-6"
                        : isDisabled || isSlotHidden
                          ? "w-0 mx-0 overflow-hidden"
                          : "w-32 mx-0 sm:mx-6"
                    }`}
                  >
                    {/* "Place Here" Slot*/}
                    {!isPending && !isDisabled && !isSlotHidden && isMyTurn && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentSong && !isDragging) {
                            setPendingIndex(i);
                          }
                        }}
                        className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                          isDragging
                            ? "opacity-100 scale-110"
                            : "opacity-40 hover:opacity-100 hover:scale-105"
                        }`}
                      >
                        <div
                          className={`w-25 h-35 sm:w-35 sm:h-45 rounded-4xl sm:rounded-[2.5rem] border-2 border-dashed flex items-center justify-center transition-all ${
                            isHovered
                              ? "border-primary bg-primary/10 shadow-[0_0_30px] shadow-primary/40"
                              : "border-white/10 bg-black/60 backdrop-blur-lg hover:border-white/30"
                          }`}
                        >
                          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 shadow-inner group-hover:bg-primary/20 transition-colors">
                            <Plus size={20} />
                          </div>
                        </div>

                        <span className="absolute top-4/5 text-[7px] sm:text-[9px] font-archivo text-slate-500 uppercase tracking-[0.2em]">
                          Place Here
                        </span>
                      </div>
                    )}

                    {/* Pending Card */}
                    {isPending && currentSong && (
                      <div
                        className="relative animate-in zoom-in duration-300 shrink-0 z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          onStartDrag(e);
                        }}
                      >
                        <div className="ring-2 ring-primary shadow-[0_0_40px] shadow-primary/40 rounded-[2.5rem] scale-105 bg-bg-dark">
                          <SongCard
                            song={currentSong}
                            showYear={false}
                            isPlaceholder={true}
                          />
                        </div>

                        {/* CONFIRM BUTTON */}
                        {isMyTurn && (
                          <button
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onConfirm();
                            }}
                            className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-4 border-[#0a050f] hover:scale-110 transition-transform z-20"
                          >
                            <Check
                              strokeWidth={4}
                              className="w-7 h-7 sm:w-9 sm:h-9"
                            />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* FIX CARDS */}
                  {i < timeline.length && !isCardHidden && (
                    <div className="shrink-0 mx-2 transition-transform duration-500">
                      <SongCard
                        song={timeline[i]}
                        showYear={true}
                        isPlaceholder={false}
                        isDimmed={!isMyTurn}
                        collapsible={
                          !!block && (i === block.start || i === block.end)
                        }
                        isCollapsed={blockIsCollapsed}
                        collapsedCount={
                          block && i === block.start
                            ? block.hiddenCount
                            : undefined
                        }
                        onToggleCollapse={() =>
                          block && toggleCollapse(block.start)
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
