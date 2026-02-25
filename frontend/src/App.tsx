import { useState } from "react";
import { socket } from "./socket";
import { GameBoard } from "./views/GameBoard";
import { MenuView } from "./views/Menu";
import { LobbyView } from "./views/Lobby";
import { WinnerView } from "./views/Winner";
import { GameMessage } from "./components/GameMessage";
import { useGameSocket } from "./hooks/useGameSocket";

function App() {
  const {
    isConnected, roomCode, isHost, players, allPlayers, gameStarted,
    currentTurnId, currentSong, winner, error, gameMessage, countdown,
    createRoom, joinRoom, startGame, drawCard, placeCard, setError,
    mistakes // Ezt adjuk hozzá a hook-hoz a hibák számlálásához
  } = useGameSocket();

  const [userName, setUserName] = useState("");
  const [targetLength, setTargetLength] = useState(10);
  const [inputCode, setInputCode] = useState("");

  // A handleCreateRoom most már fogad egy isSolo paramétert a Menu-től
  const handleCreateRoom = (isSolo: boolean = false) => {
    if (!userName) return setError("Adj meg egy nevet!");
    createRoom(userName, targetLength, isSolo);
  };

  const handleJoinRoom = () => {
    if (!userName) return setError("Adj meg egy nevet!");
    if (inputCode.length !== 4) return setError("A kód 4 karakter!");
    joinRoom(inputCode, userName);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans selection:bg-yellow-500 selection:text-black">
      <header className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-6xl font-black text-yellow-500 tracking-tighter mb-2 drop-shadow-2xl">
          CHRONOTUNE
        </h1>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold opacity-80">
          Idővonal csata háború — Készítette: Ivány Adrián
        </p>
      </header>

      <GameMessage message={gameMessage} countdown={countdown} />

      {winner && (
        <WinnerView 
          winner={winner} 
          mistakes={allPlayers.length === 1 ? mistakes : undefined} 
        />
      )}

      <main className="relative z-10">
        {!roomCode && (
          <MenuView
            userName={userName}
            setUserName={setUserName}
            handleCreateRoom={handleCreateRoom} // Most már kezeli az isSolo-t
            handleJoinRoom={handleJoinRoom}
            inputCode={inputCode}
            setInputCode={setInputCode}
            error={error}
            targetLength={targetLength}
            setTargetLength={setTargetLength}
          />
        )}

        {roomCode && !gameStarted && (
          <LobbyView 
            roomCode={roomCode} 
            players={players} 
            isHost={isHost} 
            startGame={startGame} 
          />
        )}

        {gameStarted && !winner && (
          <div className="relative">
            {/* Solo mód esetén megjelenítjük a hibaszámlálót */}
            {allPlayers.length === 1 && (
              <div className="absolute -top-16 right-0 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl animate-in zoom-in duration-300">
                <span className="text-[10px] font-black text-red-500 uppercase block leading-none mb-1">Hibák</span>
                <span className="text-2xl font-black leading-none">{mistakes}</span>
              </div>
            )}
            
            <GameBoard
              allPlayers={allPlayers}
              currentTurnId={currentTurnId}
              socketId={socket.id || ""}
              currentSong={currentSong}
              drawCard={drawCard}
              onPlaceCard={placeCard}
            />
          </div>
        )}
      </main>

      <footer className="mt-16 flex justify-center items-center gap-4 animate-in fade-in duration-1000">
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border flex items-center gap-2 transition-all duration-500 ${
          isConnected ? "border-green-500/50 text-green-500 bg-green-500/5" : "border-red-500/50 text-red-500 animate-pulse bg-red-500/5"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          {isConnected ? "SZERVER ONLINE" : "KAPCSOLÓDÁS..."}
        </div>
      </footer>
    </div>
  );
}

export default App;