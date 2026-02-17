interface LobbyViewProps {
  roomCode: string;
  players: string[];
  isHost: boolean;
  startGame: () => void;
}

export const LobbyView = ({ roomCode, players, isHost, startGame }: LobbyViewProps) => {
  return (
    <div className="max-w-md mx-auto bg-slate-800 p-10 rounded-3xl border-2 border-yellow-500/50 text-center space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-500">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Szobakód</p>
      <h2 className="text-6xl font-mono font-black text-yellow-500 tracking-widest leading-none">{roomCode}</h2>

      <div className="mt-8 pt-8 border-t border-slate-700">
        <h3 className="text-slate-400 uppercase text-[10px] font-black mb-4 tracking-widest">Játékosok ({players.length})</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {players.map((name, index) => (
            <div key={index} className="bg-slate-700/50 px-4 py-2 rounded-xl border border-slate-600 text-sm font-bold animate-in fade-in">{name}</div>
          ))}
        </div>
      </div>

      {isHost ? (
        <button onClick={startGame} className="w-full mt-6 bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95">
          Játék indítása
        </button>
      ) : (
        <p className="text-slate-500 italic text-sm mt-4 animate-pulse">Várakozás a szobagazdára...</p>
      )}
    </div>
  );
};