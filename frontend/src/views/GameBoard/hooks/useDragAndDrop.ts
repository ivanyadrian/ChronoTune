// src/views/GameBoard/hooks/useDragAndDrop.ts
import { useState, useRef, useCallback, useEffect } from "react";
import type { Player, Song } from "../../../types";

// ---- LOG HELPER ----
const LOG_PREFIX = "[useDragAndDrop]";
const log = (message: string, data?: any) => {
  console.log(`${LOG_PREFIX} ${message}`, data ? data : "");
};

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
  log("Hook inicializálva", { 
    hasCurrentSong: !!currentSong, 
    isMyTurn, 
    hasActivePlayer: !!activePlayer,
    timelineLength: activePlayer?.timeline.length || 0
  });

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
  const GHOST_WIDTH = 192;   // Fixed width of SongCard (w-48)
  const GHOST_HEIGHT = 256;  // Fixed height of SongCard (h-64)

  // Number of slots in the timeline (timeline length + 1 for the new card)
  const timelineCount = activePlayer ? activePlayer.timeline.length + 1 : 1;
  log("Timeline count számítva", { timelineCount });

  // Update slot references when timeline length changes
  useEffect(() => {
    log("useEffect: Slot referenciák frissítése", { 
      oldLength: slotRefs.current.length, 
      newLength: timelineCount 
    });
    slotRefs.current = slotRefs.current.slice(0, timelineCount);
  }, [timelineCount]);

  /**
   * Finds the closest slot index based on mouse X position
   */
  const getClosestSlot = useCallback(
    (mouseX: number): number => {
      log("getClosestSlot meghívva", { mouseX });
      let closest = 0;
      let minDist = Infinity;
      const timeline = activePlayer?.timeline || [];
      log("getClosestSlot: Timeline hossza", { timelineLength: timeline.length });

      slotRefs.current.forEach((el, i) => {
        if (!el) {
          log(`getClosestSlot: Slot ${i} nem található (null)`);
          return;
        }

        // Check if the slot is disabled (between consecutive years)
        const isDisabled =
          i > 0 &&
          i < timeline.length &&
          timeline[i].year - timeline[i - 1].year <= 1;
        
        if (isDisabled) {
          log(`getClosestSlot: Slot ${i} tiltott (év különbség: ${timeline[i].year - timeline[i-1].year})`);
          return;
        }

        const rect = el.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(mouseX - center);
        
        log(`getClosestSlot: Slot ${i} - center: ${center}, distance: ${dist}`);
        
        if (dist < minDist) {
          minDist = dist;
          closest = i;
          log(`getClosestSlot: Új legközelebbi slot: ${i} (distance: ${dist})`);
        }
      });
      
      log(`getClosestSlot: Visszatérő index: ${closest}`);
      return closest;
    },
    [activePlayer?.timeline],
  );

  /**
   * Checks if the mouse is over the timeline area
   */
  const isOverTimeline = useCallback((mouseY: number): boolean => {
    if (!timelineRef.current) {
      log("isOverTimeline: timelineRef null");
      return false;
    }
    const rect = timelineRef.current.getBoundingClientRect();
    const result = mouseY >= rect.top - 60 && mouseY <= rect.bottom + 20;
    log("isOverTimeline", { 
      mouseY, 
      rectTop: rect.top, 
      rectBottom: rect.bottom,
      result 
    });
    return result;
  }, []);

  /**
   * Mouse move event handler - updates drag position and handles auto-scroll
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      log("handleMouseMove esemény", { 
        clientX: e.clientX, 
        clientY: e.clientY,
        isDragging: isDraggingRef.current 
      });
      
      if (!isDraggingRef.current) {
        log("handleMouseMove: Skip - nincs drag");
        return;
      }

      // 1. Update dragged card position (follows mouse)
      const newPos = {
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      };
      setDragPos(newPos);
      log("handleMouseMove: Új pozíció beállítva", newPos);

      if (timelineRef.current) {
        const timeline = timelineRef.current;
        const rect = timeline.getBoundingClientRect();
        const timelineCenter = rect.left + rect.width / 2;
        const isOver = isOverTimeline(e.clientY);
        
        log("handleMouseMove: Timeline vizsgálat", {
          isOverTimeline: isOver,
          timelineCenter,
          scrollLeft: timeline.scrollLeft
        });

        // 2. If over timeline, try to scroll closest slot to center
        if (isOver) {
          const currentSlotIndex = getClosestSlot(e.clientX);
          setHoveredSlot(currentSlotIndex);
          log(`handleMouseMove: Hovered slot beállítva: ${currentSlotIndex}`);

          const activeSlot = slotRefs.current[currentSlotIndex];
          if (activeSlot) {
            const slotRect = activeSlot.getBoundingClientRect();
            const slotCenter = slotRect.left + slotRect.width / 2;

            // Calculate difference between screen center and slot center
            const diff = slotCenter - timelineCenter;
            log("handleMouseMove: Slot középre görgetés", { slotCenter, diff });

            // If slot is not centered (diff > 10px), smooth scroll
            if (Math.abs(diff) > 10) {
              const scrollAmount = diff * 0.15;
              timeline.scrollLeft += scrollAmount;
              log(`handleMouseMove: Görgetés: ${scrollAmount}, új scrollLeft: ${timeline.scrollLeft}`);
            }
          } else {
            log(`handleMouseMove: Aktív slot (${currentSlotIndex}) nem található`);
          }
        } else {
          setHoveredSlot(null);
          log("handleMouseMove: Hovered slot null-ra állítva (nincs timeline felett)");

          // 3. Traditional edge scrolling (if not over timeline)
          const edgeThreshold = 100;
          if (e.clientX > rect.right - edgeThreshold) {
            timeline.scrollLeft += 10;
            log("handleMouseMove: Jobb szélen görgetés +10");
          } else if (e.clientX < rect.left + edgeThreshold) {
            timeline.scrollLeft -= 10;
            log("handleMouseMove: Bal szélen görgetés -10");
          }
        }
      } else {
        log("handleMouseMove: timelineRef null");
      }
    },
    [isOverTimeline, getClosestSlot],
  );

  /**
   * Mouse up event handler - finalizes card placement
   */
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      log("handleMouseUp esemény", { 
        clientX: e.clientX, 
        clientY: e.clientY,
        isDragging: isDraggingRef.current 
      });
      
      if (!isDraggingRef.current) {
        log("handleMouseUp: Skip - nincs drag");
        return;
      }
      
      isDraggingRef.current = false;
      setIsDragging(false);
      setHoveredSlot(null);
      log("handleMouseUp: Drag állapot resetelve");

      // If released over timeline, try to place card
      const isOver = isOverTimeline(e.clientY);
      log("handleMouseUp: Timeline felett engedtük fel?", { isOver });
      
      if (isOver) {
        const closestIndex = getClosestSlot(e.clientX);
        const timeline = activePlayer?.timeline || [];
        log(`handleMouseUp: Legközelebbi slot: ${closestIndex}`, { 
          timelineLength: timeline.length 
        });
        
        // Check if slot is disabled
        const isDisabled =
          closestIndex > 0 &&
          closestIndex < timeline.length &&
          timeline[closestIndex].year - timeline[closestIndex - 1].year <= 1;

        log(`handleMouseUp: Slot tiltott? ${isDisabled}`, {
          hasPrevious: closestIndex > 0,
          hasNext: closestIndex < timeline.length,
          yearDiff: isDisabled ? timeline[closestIndex].year - timeline[closestIndex - 1].year : 'N/A'
        });

        if (!isDisabled) {
          setPendingIndex(closestIndex);
          log(`handleMouseUp: Pending index beállítva: ${closestIndex}`);
        } else {
          log(`handleMouseUp: Slot ${closestIndex} tiltott, pending index nem lett beállítva`);
        }
      } else {
        log("handleMouseUp: Nem timeline felett engedtük fel");
      }

      // Remove event listeners
      log("handleMouseUp: Eseményfigyelők eltávolítása");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    },
    [isOverTimeline, getClosestSlot, handleMouseMove, activePlayer?.timeline],
  );

  /**
   * Start drag - triggered when player starts dragging a card
   */
  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    log("startDrag meghívva", { 
      hasCurrentSong: !!currentSong, 
      isMyTurn,
      eventTarget: e.currentTarget.tagName 
    });
    
    // Only allow drag if there is an active card AND it's player's turn
    if (!currentSong || !isMyTurn) {
      log("startDrag: Skip - nincs currentSong vagy nem a játékos köre van", {
        currentSong: !!currentSong,
        isMyTurn
      });
      return;
    }
    
    // Clear previous pending index
    setPendingIndex(null);
    log("startDrag: Előző pending index törölve");

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    log("startDrag: Kártya pozíciója", { 
      rectLeft: rect.left, 
      rectTop: rect.top,
      rectWidth: rect.width,
      rectHeight: rect.height
    });

    // Calculate relative click point (value between 0 and 1)
    // Needed to grab the ghost card at the same spot as original
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;
    log("startDrag: Relatív kattintási pont", { relativeX, relativeY });

    // Project this relative point onto smaller ghost card
    // Grabbing center of big card means grabbing center of small card
    dragOffset.current = {
      x: relativeX * GHOST_WIDTH,
      y: relativeY * GHOST_HEIGHT,
    };
    log("startDrag: Drag offset beállítva", dragOffset.current);

    // Set initial position so ghost card doesn't jump
    const initialPos = {
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    };
    setDragPos(initialPos);
    log("startDrag: Kezdeti pozíció beállítva", initialPos);

    // Set drag state
    isDraggingRef.current = true;
    setIsDragging(true);
    log("startDrag: Drag állapot TRUE");

    // Add global event listeners
    log("startDrag: Globális eseményfigyelők hozzáadása");
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  /**
   * Confirm placement - triggered when player clicks "Confirm" button
   */
  const handleConfirm = () => {
    log("handleConfirm meghívva", { pendingIndex });
    if (pendingIndex !== null) {
      log(`handleConfirm: Kártya elhelyezése index ${pendingIndex} pozícióba`);
      onPlaceCard(pendingIndex);
      setPendingIndex(null);
      log("handleConfirm: Pending index törölve, onPlaceCard meghívva");
    } else {
      log("handleConfirm: Nincs pending index");
    }
  };

  // Cleanup: remove event listeners on component unmount
  useEffect(() => {
    log("useEffect: Cleanup regisztrálva");
    return () => {
      log("useEffect: Cleanup - Eseményfigyelők eltávolítása");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Clear pending index when new card arrives
  useEffect(() => {
    if (currentSong) {
      log("useEffect: Új kártya érkezett, pending index törlése");
    }
    setPendingIndex(null);
  }, [currentSong]);

  log("useDragAndDrop: Visszatérési értékek", {
    isDragging,
    hasPendingIndex: pendingIndex !== null,
    hasHoveredSlot: hoveredSlot !== null,
    activePlayerExists: !!activePlayer
  });

  return {
    // States
    isDragging,
    dragPos,
    hoveredSlot,
    pendingIndex,
    // Refs
    timelineRef,
    slotRefs,
    // Functions
    startDrag,
    handleConfirm,
    setPendingIndex,
    setHoveredSlot,
  };
};