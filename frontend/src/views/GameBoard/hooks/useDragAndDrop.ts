// src/views/GameBoard/hooks/useDragAndDrop.ts
import { useState, useRef, useCallback, useEffect } from "react";
import type { Player, Song } from "../../../types";

interface UseDragAndDropProps {
  currentSong: Song | null;
  isMyTurn: boolean;
  activePlayer: Player | undefined;
  onPlaceCard: (index: number) => void;
}

export const useDragAndDrop = ({
  currentSong,
  isMyTurn,
  activePlayer,
  onPlaceCard,
}: UseDragAndDropProps) => {
  // --- States ---
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  // --- Refs ---
  const timelineRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // --- Constants ---
  const GHOST_WIDTH = 192;
  const GHOST_HEIGHT = 256;

  const timelineCount = activePlayer ? activePlayer.timeline.length + 1 : 1;

  useEffect(() => {
    slotRefs.current = slotRefs.current.slice(0, timelineCount);
  }, [timelineCount]);

  const getClosestSlot = useCallback(
    (mouseX: number): number => {
      let closest = 0;
      let minDist = Infinity;
      const timeline = activePlayer?.timeline || [];

      slotRefs.current.forEach((el, i) => {
        if (!el) return;

        const isDisabled =
          i > 0 &&
          i < timeline.length &&
          timeline[i].year - timeline[i - 1].year <= 1;
        
        if (isDisabled) return;

        const rect = el.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(mouseX - center);
        
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      
      return closest;
    },
    [activePlayer?.timeline],
  );

  const isOverTimeline = useCallback((mouseY: number): boolean => {
    if (!timelineRef.current) return false;
    const rect = timelineRef.current.getBoundingClientRect();
    return mouseY >= rect.top - 60 && mouseY <= rect.bottom + 20;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const newPos = {
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      };
      setDragPos(newPos);

      if (timelineRef.current) {
        const timeline = timelineRef.current;
        const rect = timeline.getBoundingClientRect();
        const timelineCenter = rect.left + rect.width / 2;
        const isOver = isOverTimeline(e.clientY);

        if (isOver) {
          const currentSlotIndex = getClosestSlot(e.clientX);
          setHoveredSlot(currentSlotIndex);

          const activeSlot = slotRefs.current[currentSlotIndex];
          if (activeSlot) {
            const slotRect = activeSlot.getBoundingClientRect();
            const slotCenter = slotRect.left + slotRect.width / 2;
            const diff = slotCenter - timelineCenter;

            if (Math.abs(diff) > 10) {
              timeline.scrollLeft += diff * 0.15;
            }
          }
        } else {
          setHoveredSlot(null);

          const edgeThreshold = 100;
          if (e.clientX > rect.right - edgeThreshold) {
            timeline.scrollLeft += 10;
          } else if (e.clientX < rect.left + edgeThreshold) {
            timeline.scrollLeft -= 10;
          }
        }
      }
    },
    [isOverTimeline, getClosestSlot],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      isDraggingRef.current = false;
      setIsDragging(false);
      setHoveredSlot(null);

      const isOver = isOverTimeline(e.clientY);
      
      if (isOver) {
        const closestIndex = getClosestSlot(e.clientX);
        const timeline = activePlayer?.timeline || [];
        
        const isDisabled =
          closestIndex > 0 &&
          closestIndex < timeline.length &&
          timeline[closestIndex].year - timeline[closestIndex - 1].year <= 1;

        if (!isDisabled) {
          setPendingIndex(closestIndex);
        }
      }

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    },
    [isOverTimeline, getClosestSlot, handleMouseMove, activePlayer?.timeline],
  );

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentSong || !isMyTurn) return;
    
    setPendingIndex(null);

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();

    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;

    dragOffset.current = {
      x: relativeX * GHOST_WIDTH,
      y: relativeY * GHOST_HEIGHT,
    };

    const initialPos = {
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    };
    setDragPos(initialPos);

    isDraggingRef.current = true;
    setIsDragging(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleConfirm = () => {
    if (pendingIndex !== null) {
      onPlaceCard(pendingIndex);
      setPendingIndex(null);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    setPendingIndex(null);
  }, [currentSong]);

  return {
    isDragging,
    dragPos,
    hoveredSlot,
    pendingIndex,
    timelineRef,
    slotRefs,
    startDrag,
    handleConfirm,
    setPendingIndex,
    setHoveredSlot,
  };
};