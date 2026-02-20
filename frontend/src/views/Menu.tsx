interface MenuViewProps {
  userName: string;
  setUserName: (val: string) => void;
  handleCreateRoom: () => void;
  handleJoinRoom: () => void;
  inputCode: string;
  setInputCode: (val: string) => void;
  targetLength: number;
  setTargetLength: (val: number) => void;
  error: string;
}

export const MenuView = ({
  userName,
  setUserName,
  handleCreateRoom,
  handleJoinRoom,
  inputCode,
  setInputCode,
  targetLength,
  setTargetLength,
  error,
}: MenuViewProps) => {
  return (
    <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">
          Becenév
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Hogy hívjanak?"
          className="w-full p-4 rounded-2xl bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
        />
      </div>

      <div className="pt-4 space-y-4">
        <button
          onClick={handleCreateRoom}
          className="w-full bg-yellow-600 hover:bg-yellow-500 py-4 rounded-2xl font-bold transition-transform active:scale-95"
        >
          Új szoba indítása
        </button>
        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-slate-700 grow"></div>
          <span className="text-slate-500 text-xs font-bold">VAGY</span>
          <div className="h-px bg-slate-700 grow"></div>
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 text-xs font-bold uppercase">
            Győzelemhez szükséges kártyák: {targetLength}
          </label>
          <input
            type="range"
            min="3"
            max="20"
            value={targetLength}
            onChange={(e) => setTargetLength(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
            <span>3 (Gyors)</span>
            <span>20 (Hosszú)</span>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="KÓD"
            maxLength={4}
            className="w-1/3 p-4 rounded-2xl bg-slate-700 border border-slate-600 text-center font-mono text-xl uppercase outline-none"
          />
          <button
            onClick={handleJoinRoom}
            className="w-2/3 bg-slate-700 hover:bg-slate-600 py-4 rounded-2xl font-bold border border-slate-600"
          >
            Belépés
          </button>
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-center text-sm font-medium animate-bounce">
          {error}
        </p>
      )}
    </div>
  );
};
