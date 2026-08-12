import { useEffect, useState } from "react";
import type { Player, Song } from "../../types";
import { MusicPlayer } from "../../components/MusicPlayer";
import { TimeLine } from "../../components/TimeLine";
import { Leaderboard } from "../../components/Leaderboard";
import SoloGameStats from "../GameBoard/components/SoloGameStats";
import MultiplayerGameStats from "../GameBoard/components/MultiplayerGameStats";
import { DrawMusicButton } from "../../components/ui/DrawMusicButton";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useMusicSync } from "./hooks/useMusicSync";
import { DiscardConfirmModal } from "./components/DiscardConfirmModal";
import { FloatingDragGhost } from "./components/FloatingDragGhost";
import WeeklyChallengeStats from "../WeeklyChallenge/components/WeeklyChallengeStats";

// NEW, GROUPED INTERFACE
interface GameBoardProps {
  gameState: {
    allPlayers: Player[];
    currentTurnId: string | null;
    currentSong: Song | null;
    isRetryCard: boolean;
    lastDelta: { [playerId: string]: number };
    maxMistakes: number | null;
    targetLength: number;
    isSolo: boolean;
    isWeekly: boolean;
    weeklyElapsedMs: number;
    syncMusic: boolean;
    roomCode: string | null;
    musicPlaybackState: number;
    musicPlaybackDeezerId: string | null;
    musicSeekTo: number | null;
  };
  actions: {
    drawCard: () => void;
    discardCard: () => void;
    onUpdatePending: (index: number | null) => void;
    onPlaceCard: (index: number) => void;
    onLeaveGame: () => void;
    toggleMusicPlayback: (data: { roomCode: string; deezerId: string; state: number }) => void;
    seekMusicPlayback: (data: { roomCode: string; position: number }) => void;
  };
  socketId: string;
}

export const GameBoard = ({ gameState, actions, socketId }: GameBoardProps) => {
  // EXTRACT DATA FROM gameState OBJECT
  const {
    allPlayers,
    currentTurnId,
    currentSong,
    lastDelta,
    maxMistakes,
    targetLength,
    isSolo,
    isWeekly,
    weeklyElapsedMs,
    syncMusic,
    roomCode,
    musicPlaybackState,
    musicPlaybackDeezerId,
    musicSeekTo,
  } = gameState;

  // EXTRACT ACTIONS FROM actions OBJECT
  const {
    drawCard,
    discardCard,
    onUpdatePending,
    onPlaceCard,
    onLeaveGame,
    toggleMusicPlayback,
    seekMusicPlayback,
  } = actions;

  const activePlayer = allPlayers.find((p) => p.id === currentTurnId);
  const isMyTurn = currentTurnId === socketId;
  const me = isSolo ? allPlayers[0] : null;
  const delta = me ? lastDelta[me.id] || 0 : 0;
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Drag & Drop hook
  const {
    isDragging,
    dragPos,
    hoveredSlot,
    pendingIndex,
    timelineRef,
    slotRefs,
    startDrag,
    handleConfirm,
    setPendingIndex,
  } = useDragAndDrop({
    currentSong,
    isMyTurn,
    activePlayer,
    onPlaceCard,
  });

  // Music synchronization hook
  const {
    playbackState,
    setPlaybackState,
    musicSeekTo: resolvedMusicSeekTo,
    handleTogglePlay,
    handleSeek,
  } = useMusicSync({
    currentSong,
    roomCode,
    syncMusic,
    isMyTurn,
    musicPlaybackState,
    musicPlaybackDeezerId,
    musicSeekTo,
    toggleMusicPlayback,
    seekMusicPlayback,
  });

  // Pending index synchronization with server
  useEffect(() => {
    if (isMyTurn && roomCode) {
      onUpdatePending(pendingIndex);
    }
  }, [pendingIndex, isMyTurn, roomCode, onUpdatePending]);

  return (
    <div className="mx-auto w-full max-w-420 pb-36 sm:pb-44">
      <DiscardConfirmModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          discardCard();
          setShowDiscardConfirm(false);
        }}
      />

      {/* STATS HANDLING */}
      {isWeekly ? (
        // 1. Rendered during Weekly Challenge
        <WeeklyChallengeStats
          me={me}
          targetLength={targetLength}
          onLeaveGame={onLeaveGame}
          initialElapsedMs={weeklyElapsedMs}
        />
      ) : isSolo ? (
        // 2. Rendered during standard solo mode
        <SoloGameStats
          isSolo={isSolo}
          me={me}
          delta={delta}
          targetLength={targetLength}
          maxMistakes={maxMistakes}
          onLeaveGame={onLeaveGame}
        />
      ) : (
        // 3. Rendered during multiplayer mode
        activePlayer && (
          <MultiplayerGameStats
            activePlayer={activePlayer}
            isMyTurn={isMyTurn}
            targetLength={targetLength}
            onLeaveGame={onLeaveGame}
          />
        )
      )}

      <div className={!isSolo ? "grid grid-cols-1 lg:grid-cols-12 items-start" : "flex"}>
        {/* Leaderboard - multiplayer only */}
        {!isSolo && (
          <div className="px-4 pt-5 lg:col-span-3 lg:border-r-2 lg:border-white/10 lg:h-full flex justify-center">
            <Leaderboard
              players={allPlayers}
              lastDelta={lastDelta}
              isSolo={isSolo}
              currentTurnId={currentTurnId}
            />
          </div>
        )}

        {/* Main content */}
        <div className={!isSolo ? "lg:col-span-9 flex flex-col gap-6" : "flex flex-col w-full"}>
          {activePlayer && (
            <TimeLine
              timeline={activePlayer.timeline}
              currentSong={currentSong}
              hoveredSlot={hoveredSlot}
              isDragging={isDragging}
              pendingIndex={isMyTurn ? pendingIndex : (activePlayer?.pendingIndex ?? null)}
              timelineRef={timelineRef}
              slotRefs={slotRefs}
              onStartDrag={startDrag}
              onConfirm={handleConfirm}
              setPendingIndex={setPendingIndex}
              isMyTurn={isMyTurn}
              activePlayerName={activePlayer?.name}
              isSolo={isSolo}
            />
          )}

          {/* Fixed Bottom Player / Draw Music Button Container */}
          <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
            <div className="pointer-events-auto flex items-center justify-center w-full max-w-70 sm:max-w-2xl">
              {currentSong && (
                <MusicPlayer
                  currentSong={currentSong}
                  playbackState={playbackState}
                  setPlaybackState={setPlaybackState}
                  seekTo={resolvedMusicSeekTo}
                  onSeek={handleSeek}
                  handleTogglePlay={handleTogglePlay}
                  isMyTurn={isMyTurn}
                  syncMusic={syncMusic}
                  onCardMouseDown={isMyTurn && pendingIndex === null ? startDrag : undefined}
                  isDraggable={isMyTurn && pendingIndex === null}
                  canDiscard={isMyTurn}
                  onDiscard={() => setShowDiscardConfirm(true)}
                  isWeekly={isWeekly}
                />
              )}

              {!currentSong && (isSolo ? isMyTurn : true) && (
                <DrawMusicButton
                  onClick={drawCard}
                  disabled={!isMyTurn}
                  waitingForName={!isSolo && !isMyTurn && activePlayer ? activePlayer.name : null}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <FloatingDragGhost isDragging={isDragging} currentSong={currentSong} dragPos={dragPos} />
    </div>
  );
};