import { SongCard } from "../../../components/SongCard";
import type { Song } from "../../../types";

interface FloatingDragGhostProps {
  isDragging: boolean;
  currentSong: Song | null;
  dragPos: { x: number; y: number };
}

export const FloatingDragGhost = ({ isDragging, currentSong, dragPos }: FloatingDragGhostProps) => {
  if (!isDragging || !currentSong) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75"
      style={{
        left: dragPos.x,
        top: dragPos.y,
        transform: "rotate(-3deg) scale(1.05)",
        filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))",
      }}
    >
      <SongCard song={currentSong} showYear={false} isPlaceholder={true} />
    </div>
  );
};