import { useState, useEffect } from "react";
import { socket } from "./socket";
import { GameBoard } from "./views/GameBoard/index";
import { MenuView } from "./views/Menu/index";
import { LobbyView } from "./views/Lobby/Lobby";
import { GameResultView } from "./views/GameResult/GameResult";
import { GameMessage } from "./components/GameMessage";
import { useGameSocket } from "./hooks/useGameSocket";
import { Toast } from "./components/Toast";
import { useLanguage } from "./context/LanguageContext";

function App() {
  const { t } = useLanguage();
  const {
    isConnected,
    roomCode,
    isHost,
    players,
    allPlayers,
    gameStarted,
    syncMusic,
    songLibrary,
    targetLength: socketTargetLength,
    currentTurnId,
    currentSong,
    winner,
    lost,
    error,
    gameMessage,
    countdown,
    createRoom,
    createWeeklyRoom,
    joinRoom,
    startGame,
    discardCard,
    drawCard,
    placeCard,
    leaveRoom,
    updateRoomConfig,
    mistakes,
    maxMistakes,
    isRetryCard,
    lastDelta,
    isSolo,
    isWeekly,
    weeklyElapsedMs,
    onUpdatePending,
    toast,
    triggerToast,
    toggleMusicPlayback,
    seekMusicPlayback,
    musicPlaybackState,
    musicPlaybackDeezerId,
    musicSeekTo,
  } = useGameSocket();

  const [userName, setUserName] = useState("");
  const [selectedSongLibrary, setSelectedSongLibrary] = useState<'hu' | 'en'>('hu');
  const [showConnectingInfo, setShowConnectingInfo] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setShowConnectingInfo(false);
      return;
    }
    const timer = setTimeout(() => setShowConnectingInfo(true), 5000);
    return () => clearTimeout(timer);
  }, [isConnected]);
  const [step, setStep] = useState<"name" | "choice" | "solo" | "multi" | "weekly">(
    "name",
  );
  const [localTargetLength, setLocalTargetLength] = useState(10);
  const [inputCode, setInputCode] = useState("");
  const [selectedMaxMistakes, setSelectedMaxMistakes] = useState<
    number | null | undefined
  >(undefined);

  // Use server value for non-host players
  const effectiveTargetLength = isHost ? localTargetLength : socketTargetLength;

  const handleRestart = () => {
    leaveRoom();
    setStep("solo");
  };

  const handleLeave = () => {
    const wasWeekly = !!winner?.isWeekly;
    leaveRoom();
    if (wasWeekly) {
      setStep("weekly");
    } else {
      setStep("choice");
    }
  };

  const handleCreateRoom = (isSoloMode: boolean = false) => {
    if (!userName) return triggerToast(t.enterName, "error");
    createRoom(
      userName,
      localTargetLength,
      isSoloMode,
      isSoloMode ? (selectedMaxMistakes ?? null) : null,
      true,
      selectedSongLibrary,
    );
  };

  const handleJoinRoom = (codeFromComponent?: string) => {
    if (!userName) return triggerToast(t.enterName, "error");

    // If code is provided from component, use it, otherwise use local state
    const finalCode = codeFromComponent || inputCode;

    if (finalCode.length !== 4) {
      return triggerToast(t.codeLength, "error");
    }

    joinRoom(finalCode, userName);
  };

  // Loading state
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-dvh bg-linear-to-br from-[rgb(45,13,58)] via-[rgb(15,5,24)] to-[rgb(33,10,43)]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-secondary-light border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60 font-medium animate-pulse">{t.connecting}</p>
          <p className={`text-white/40 text-sm mt-2 px-10 transition-opacity duration-700 ${showConnectingInfo ? 'opacity-100' : 'opacity-0'}`}>{t.connectingInfo}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh text-white bg-linear-to-br from-[rgb(45,13,58)] via-[rgb(15,5,24)] to-[rgb(33,10,43)] font-sans selection:bg-secondary-light selection:text-black">
      <div className="grid-background pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Toast
          isVisible={!!toast}
          message={toast?.message}
          type={toast?.type}
          icon={toast?.icon}
        />

        <GameMessage
          message={gameMessage}
          countdown={countdown}
          alwaysVisible={true}
          isWeekly={isWeekly}
        />

        {winner && (
          <GameResultView
            winner={winner}
            lost={lost}
            mistakes={mistakes}
            maxMistakes={maxMistakes}
            onLeave={handleLeave}
            onRestart={winner.isWeekly ? undefined : (isSolo ? handleRestart : undefined)}
            isSolo={isSolo}
            players={isSolo ? [] : allPlayers}
          />
        )}

        <main className="w-full max-w-8xl mx-auto">
          {!roomCode && !winner && (
            <MenuView
              userName={userName}
              setUserName={setUserName}
              handleCreateRoom={handleCreateRoom}
              createWeeklyRoom={createWeeklyRoom}
              handleJoinRoom={handleJoinRoom}
              inputCode={inputCode}
              setInputCode={setInputCode}
              error={error}
              targetLength={localTargetLength}
              setTargetLength={setLocalTargetLength}
              isConnected={isConnected}
              selectedMaxMistakes={selectedMaxMistakes}
              setSelectedMaxMistakes={setSelectedMaxMistakes}
              selectedSongLibrary={selectedSongLibrary}
              setSelectedSongLibrary={setSelectedSongLibrary}
              step={step}
              setStep={setStep}
            />
          )}

          {roomCode && !gameStarted && !winner && (
            <div className="flex items-center justify-center">
              <LobbyView
                roomCode={roomCode}
                players={players}
                isHost={isHost}
                currentUserName={userName}
                targetLength={effectiveTargetLength}
                syncMusic={syncMusic}
                songLibrary={songLibrary}
                onSyncMusicChange={(val) =>
                  updateRoomConfig({ syncMusic: val })
                }
                onTargetLengthChange={(val) => {
                  setLocalTargetLength(val);
                  if (isHost) updateRoomConfig({ targetLength: val });
                }}
                onSongLibraryChange={(val) => {
                  if (isHost) updateRoomConfig({ songLibrary: val });
                }}
                onShowToast={triggerToast}
                startGame={startGame}
                onLeave={handleLeave}
              />
            </div>
          )}

          {gameStarted && !winner && (
            <div className="relative">
              <GameBoard
                gameState={{
                  allPlayers,
                  currentTurnId,
                  currentSong,
                  isRetryCard,
                  lastDelta,
                  maxMistakes,
                  targetLength: effectiveTargetLength,
                  isSolo,
                  isWeekly,
                  weeklyElapsedMs,
                  syncMusic,
                  roomCode,
                  musicPlaybackState,
                  musicPlaybackDeezerId,
                  musicSeekTo,
                }}
                actions={{
                  drawCard,
                  discardCard,
                  onUpdatePending,
                  onPlaceCard: placeCard,
                  onLeaveGame: handleLeave,
                  toggleMusicPlayback,
                  seekMusicPlayback,
                }}
                socketId={socket.id || ""}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;