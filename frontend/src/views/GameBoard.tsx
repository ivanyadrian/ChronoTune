import { useState, useRef, useEffect, useCallback } from "react";
import type { Player, Song } from "../types";
import { SongCard } from "../components/SongCard";
import { MusicPlayer } from "../components/MusicPlayer";
import { TimeLine } from "../components/TimeLine";

interface GameBoardProps {
  allPlayers: Player[];
  currentTurnId: string | null;
  socketId: string;
  currentSong: Song | null;
  drawCard: () => void;
  onPlaceCard: (index: number) => void;
}

export const GameBoard = ({
  allPlayers,
  currentTurnId,
  socketId,
  currentSong,
  drawCard,
  onPlaceCard,
}: GameBoardProps) => {
  const activePlayer = allPlayers.find((p) => p.id === currentTurnId);
  const [playbackState, setPlaybackState] = useState<number>(-1);
  const isMyTurn = currentTurnId === socketId;

  // --- Drag state ---
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const timelineCount = activePlayer ? activePlayer.timeline.length + 1 : 1;

  useEffect(() => {
    slotRefs.current = slotRefs.current.slice(0, timelineCount);
  }, [timelineCount]);

  const getClosestSlot = useCallback((mouseX: number): number => {
    let closest = 0;
    let minDist = Infinity;
    slotRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(mouseX - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    return closest;
  }, []);

  const isOverTimeline = useCallback((mouseY: number): boolean => {
    if (!timelineRef.current) return false;
    const rect = timelineRef.current.getBoundingClientRect();
    return mouseY >= rect.top - 60 && mouseY <= rect.bottom + 20;
  }, []);

const handleMouseMove = useCallback(
  (e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    // 1. A vonszolt kártya pozíciója (követi az egeret)
    setDragPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });

    if (timelineRef.current) {
      const timeline = timelineRef.current;
      const rect = timeline.getBoundingClientRect();
      const timelineCenter = rect.left + rect.width / 2;

      // 2. Ha épp egy slot felett vagyunk, próbáljuk azt középre húzni
      if (isOverTimeline(e.clientY)) {
        const currentSlotIndex = getClosestSlot(e.clientX);
        setHoveredSlot(currentSlotIndex);

        const activeSlot = slotRefs.current[currentSlotIndex];
        if (activeSlot) {
          const slotRect = activeSlot.getBoundingClientRect();
          const slotCenter = slotRect.left + slotRect.width / 2;
          
          // Kiszámoljuk a különbséget a képernyő közepe és a slot közepe között
          const diff = slotCenter - timelineCenter;

          // Ha a slot nincs középen (pl. 10px-nél nagyobb az eltérés), finoman görgetünk
          if (Math.abs(diff) > 10) {
            // A diff * 0.1 egy "smooth" hatást ad, mintha mágnes húzná középre
            timeline.scrollLeft += diff * 0.15; 
          }
        }
      } else {
        setHoveredSlot(null);
        
        // 3. Hagyományos szélek menti görgetés (ha nem a timeline felett vagyunk)
        const edgeThreshold = 100;
        if (e.clientX > rect.right - edgeThreshold) {
          timeline.scrollLeft += 10;
        } else if (e.clientX < rect.left + edgeThreshold) {
          timeline.scrollLeft -= 10;
        }
      }
    }
  },
  [isOverTimeline, getClosestSlot]
);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      setHoveredSlot(null);

      if (isOverTimeline(e.clientY)) {
        setPendingIndex(getClosestSlot(e.clientX));
      }

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    },
    [isOverTimeline, getClosestSlot, handleMouseMove]
  );

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!currentSong || !isMyTurn) return;
  setPendingIndex(null);

  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
  
  // 1. Megnézzük a forrás (amire kattintottunk) és a cél (lebegő szellem) szélességét
  const sourceWidth = rect.width;
  const sourceHeight = rect.height;
  const ghostWidth = 192; // a SongCard fix szélessége (w-48)
  const ghostHeight = 256; // a SongCard fix magassága (h-64)

  // 2. Kiszámoljuk a relatív kattintási pontot (0 és 1 közötti érték)
  const relativeX = (e.clientX - rect.left) / sourceWidth;
  const relativeY = (e.clientY - rect.top) / sourceHeight;

  // 3. Ezt a relatív pontot vetítjük rá a kisebb kártyára
  // Így ha a nagynak a közepét fogtad meg, a kicsinek is a közepét fogod "fogni"
  dragOffset.current = { 
    x: relativeX * ghostWidth, 
    y: relativeY * ghostHeight 
  };

  // Beállítjuk a kezdeti pozíciót, hogy ne ugorjon
  setDragPos({ 
    x: e.clientX - dragOffset.current.x, 
    y: e.clientY - dragOffset.current.y 
  });

  isDraggingRef.current = true;
  setIsDragging(true);

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
};

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Reset pending when a new song comes in
  useEffect(() => {
    setPendingIndex(null);
  }, [currentSong]);

  const handleConfirm = () => {
    if (pendingIndex !== null) {
      onPlaceCard(pendingIndex);
      setPendingIndex(null);
    }
  };

  const handleTogglePlay = () => {
    setPlaybackState((prev) => (prev === 1 ? 0 : 1));
  };

 return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      
      {/* Turn indicator */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-4 rounded-full bg-yellow-500 animate-ping" />
          <h3 className="text-3xl font-black uppercase tracking-tighter">
            {isMyTurn ? "TE KÖVETKEZEL!" : `${activePlayer?.name} KÖRE`}
          </h3>
        </div>
      </div>

      {/* Középső rész: MusicPlayer */}
      <div className="flex flex-col items-center justify-center min-h-88 border-2 border-dashed border-slate-700 rounded-[3rem] p-6 bg-slate-800/30 backdrop-blur-sm">
        {currentSong && currentSong.deezerId ? (
          <div style={{ opacity: isDragging ? 0.3 : 1, transition: "opacity 0.2s" }}>
            <MusicPlayer
              currentSong={currentSong}
              playbackState={playbackState}
              setPlaybackState={setPlaybackState}
              handleTogglePlay={handleTogglePlay}
              onCardMouseDown={isMyTurn && pendingIndex === null ? startDrag : undefined}
              isDraggable={isMyTurn && pendingIndex === null}
            />
          </div>
        ) : (
          isMyTurn && !currentSong && (
            <button onClick={drawCard} className="bg-yellow-500 font-black py-6 px-12 rounded-2xl animate-bounce">
              🎵 ÚJ DAL HÚZÁSA
            </button>
          )
        )}
      </div>

      {/* Különválasztott Timeline Komponens */}
      {activePlayer && (
        <TimeLine
          timeline={activePlayer.timeline}
          currentSong={currentSong}
          hoveredSlot={hoveredSlot}
          isDragging={isDragging}
          pendingIndex={pendingIndex}
          timelineRef={timelineRef}
          slotRefs={slotRefs}
          onStartDrag={startDrag}
          onConfirm={handleConfirm}
        />
      )}

      {/* Floating Drag Ghost */}
      {isDragging && currentSong && (
        <div
          className="fixed pointer-events-none z-50 transition-transform duration-75"
          style={{
            left: dragPos.x,
            top: dragPos.y,
            transform: "rotate(-3deg) scale(1.05)",
            filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))",
          }}
        >
          <SongCard song={currentSong} showYear={false} />
        </div>
      )}
    </div>
  );
};
