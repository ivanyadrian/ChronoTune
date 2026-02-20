import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { GameBoard } from "./views/GameBoard";
import { MenuView } from "./views/Menu";
import { LobbyView } from "./views/Lobby";
import { WinnerView } from "./views/Winner";
import { GameMessage } from "./components/GameMessage";
import { Leaderboard } from "./components/Leaderboard";
import type { Player } from "./types";

// A socket példányt a komponensen kívül deklaráljuk, hogy ne jöjjön létre újra minden renderelésnél
const socket: Socket = io("http://localhost:3001");

function App() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");

  const [userName, setUserName] = useState("");
  const [targetLength, setTargetLength] = useState(10);
  
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<{
    name: string;
    timeline: any[];
  } | null>(null);

  const [players, setPlayers] = useState<string[]>([]);
  const [currentCard, setCurrentCard] = useState<any | null>(null);

  const [gameMessage, setGameMessage] = useState<{
    text: string;
    isSuccess: boolean;
  } | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const currentTurnRef = useRef(currentTurnId);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    currentTurnRef.current = currentTurnId;
  }, [currentTurnId]);

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("room_created", (code: string) => setRoomCode(code));

    socket.on("joined_success", (code: string) => {
      setRoomCode(code);
      setError("");
    });

    socket.on("update_players", (playerList: string[]) =>
      setPlayers(playerList),
    );
    socket.on("is_host", (val: boolean) => setIsHost(val));
    socket.on("error", (msg: string) => setError(msg));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room_created");
      socket.off("joined_success");
      socket.off("update_players");
      socket.off("is_host");
      socket.off("error");
      socket.off("game_over");
    };
  }, []);

  useEffect(() => {
    if (!roomCode) return; // Ne figyeljen semmire, amíg nincs szoba

    socket.on("game_started", (data) => {
      setGameStarted(true);
      setCurrentTurnId(data.currentTurn);
      setAllPlayers(data.players);
    });

    socket.on("turn_changed", (data) => {
      setCurrentTurnId(data.currentTurn);
      setAllPlayers(data.players);
    });

    socket.on("new_card_drawn", (card) => {
      setCurrentCard(card);
    });

    socket.on("placement_result", (data) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setAllPlayers(data.players);
      setCurrentCard(null);
      setGameMessage({
        text: data.success
          ? `${data.playerName} JÓL TIPPELT!`
          : `${data.playerName} ELRONTOTTA!`,
        isSuccess: data.success,
      });

      let timeLeft = 2;
      setCountdown(timeLeft);

      // 2. Elindítjuk az újat és elmentjük a Ref-be
      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null; // Tisztítás

          setGameMessage(null);
          setCountdown(null);

          if (currentTurnRef.current === socket.id) {
            socket.emit("request_next_turn", roomCode);
          }
        }
      }, 1000);
    });

    socket.on("game_over", (data) => {
      setWinner({ name: data.winnerName, timeline: data.finalTimeline });
      setGameStarted(false); // Visszaállítjuk a játék állapotát
    });

    return () => {
      socket.off("game_started");
      socket.off("turn_changed");
      socket.off("new_card_drawn");
      socket.off("placement_result");
    };
  }, [roomCode]); // Csak akkor indul újra, ha új szobába lépsz

  const startGame = () => {
    socket.emit("start_game", roomCode);
  };

  const handleCreateRoom = () => {
    if (!userName) {
      setError("Adj meg egy nevet!");
      return;
    }
    socket.emit("create_room", { userName, targetLength });
  };

  const handleJoinRoom = () => {
    if (!userName) {
      setError("Adj meg egy nevet!");
      return;
    }
    if (inputCode.length !== 4) {
      setError("A kód 4 karakter!");
      return;
    }
    socket.emit("join_room", { code: inputCode.toUpperCase(), userName });
  };

  const drawCard = () => {
    if (roomCode) {
      socket.emit("draw_card", roomCode);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">

      <header className="mb-12 text-center">
        <h1 className="text-6xl font-black text-yellow-500 tracking-tighter mb-2">
          CHRONOTUNE
        </h1>
        <p className="text-slate-400 uppercase tracking-widest text-sm">
          Idővonal csata háború - Készítette: Ivány Adrián
        </p>
      </header>

      <GameMessage message={gameMessage} countdown={countdown} />

      {winner && <WinnerView winner={winner} />}

      <main>
        {!roomCode && (
          <MenuView
            userName={userName}
            setUserName={setUserName}
            handleCreateRoom={handleCreateRoom}
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
          <>
          
            {/* 
            <Leaderboard
              players={allPlayers}
              currentTurnId={currentTurnId}
              winLimit={10} // GYŐZELEMHEZ SZÜKSÉGES SZÁM, EZT A SZERVER OLDALÁN IS BE KELL ÁLLÍTANI
            /> 
            */}

            <GameBoard
              allPlayers={allPlayers}
              currentTurnId={currentTurnId}
              socketId={socket.id || ""}
              currentCard={currentCard}
              drawCard={drawCard}
              onPlaceCard={(i) => {
                if (currentCard) {
                  socket.emit("place_card", {
                    roomCode,
                    cardId: currentCard.id,
                    index: i,
                  });
                }
              }}
            />
          </>
        )}
      </main>

      <footer className="mt-12 opacity-50 justify-center flex">
        <div className={`px-4 py-1 rounded-full text-[10px] max-w-40 font-black border transition-colors duration-500 ${
            isConnected
              ? "border-green-500 text-green-500"
              : "border-red-500 text-red-500 animate-pulse"
          }`}
        >
          {isConnected
            ? "● SZERVER ONLINE"
            : "○ SZERVER OFFLINE / KAPCSOLÓDÁS..."}
        </div>
      </footer>
    </div>
  );
}

export default App;
