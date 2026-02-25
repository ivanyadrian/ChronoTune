import { useState } from "react";
import { User, Users, Play, ChevronLeft } from "lucide-react";

interface MenuViewProps {
  userName: string;
  setUserName: (val: string) => void;
  handleCreateRoom: (isSolo?: boolean) => void; // Bővítve egy opcionális flaggel
  handleJoinRoom: () => void;
  inputCode: string;
  setInputCode: (val: string) => void;
  targetLength: number;
  setTargetLength: (val: number) => void;
  error: string;
}


export const MenuView = ({
  userName, setUserName,
  handleCreateRoom, handleJoinRoom,
  inputCode, setInputCode,
  targetLength, setTargetLength,
  error,
}: MenuViewProps) => {
  // name: név megadása, choice: mód választás, solo: egyjátékos beállítás, multi: többjátékos opciók
  const [step, setStep] = useState<"name" | "choice" | "solo" | "multi">("name");

  // Segédfüggvény a navigációhoz
  const goBack = () => {
    if (step === "choice") setStep("name");
    else setStep("choice");
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl border border-slate-700 space-y-6 animate-in fade-in zoom-in duration-300 relative overflow-hidden">
      
      {/* Vissza gomb (csak ha már túlléptünk a név megadásán) */}
      {step !== "name" && (
        <button 
          onClick={goBack}
          className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* 1. LÉPÉS: NÉV MEGADÁSA */}
      {step === "name" && (
        <div className="space-y-6 pt-4">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white italic">ÜDVÖZLÜNK!</h2>
            <p className="text-slate-400 text-sm">Hogy hívjanak a ranglistán?</p>
          </div>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Becenév..."
            className="w-full p-4 rounded-2xl bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-yellow-500 outline-none transition-all text-center text-xl font-bold"
          />
          <button
            disabled={!userName.trim()}
            onClick={() => setStep("choice")}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 py-4 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            MEHETÜNK <Play size={20} fill="currentColor" />
          </button>
        </div>
      )}

      {/* 2. LÉPÉS: JÁTÉKMÓD VÁLASZTÁS */}
      {step === "choice" && (
        <div className="space-y-4 pt-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">VÁLASSZ JÁTÉKMÓDOT!</h2>
          </div>
          <button
            onClick={() => setStep("solo")}
            className="w-full group bg-slate-700 hover:bg-slate-600 p-6 rounded-3xl border border-slate-600 transition-all flex items-center gap-4 text-left"
          >
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
              <User size={32} />
            </div>
            <div>
              <h3 className="font-black text-lg">EGYJÁTÉKOS</h3>
              <p className="text-slate-400 text-xs">Gyakorolj és mérd a hibáidat!</p>
            </div>
          </button>

          <button
            onClick={() => setStep("multi")}
            className="w-full group bg-slate-700 hover:bg-slate-600 p-6 rounded-3xl border border-slate-600 transition-all flex items-center gap-4 text-left"
          >
            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <div>
              <h3 className="font-black text-lg">TÖBBJÁTÉKOS</h3>
              <p className="text-slate-400 text-xs">Versenyezz másokkal valós időben!</p>
            </div>
          </button>
        </div>
      )}

      {/* 3. LÉPÉS (SOLO): EGYJÁTÉKOS BEÁLLÍTÁS */}
      {step === "solo" && (
        <div className="space-y-6 pt-4">
          <div className="text-center">
            <h2 className="text-xl font-bold">SOLO JÁTÉK</h2>
            <p className="text-slate-400 text-sm italic">Állítsd be a nehézséget!</p>
          </div>
          
          <div className="space-y-4">
            <label className="text-slate-400 text-xs font-bold uppercase block text-center">
              Kártyák száma: {targetLength}
            </label>
            <input
              type="range" min="3" max="25"
              value={targetLength}
              onChange={(e) => setTargetLength(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <button
            onClick={() => handleCreateRoom(true)} // isSolo = true
            className="w-full bg-blue-600 hover:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all"
          >
            JÁTÉK INDÍTÁSA
          </button>
        </div>
      )}

      {/* 4. LÉPÉS (MULTI): TÖBBJÁTÉKOS OPCIÓK */}
      {step === "multi" && (
        <div className="space-y-6 pt-4">
           <button
            onClick={() => handleCreateRoom(false)}
            className="w-full bg-yellow-600 hover:bg-yellow-500 py-4 rounded-2xl font-black transition-all"
          >
            ÚJ SZOBA LÉTREHOZÁSA
          </button>

          <div className="relative flex py-2 items-center">
            <div className="grow border-t border-slate-700"></div>
            <span className="shrink mx-4 text-slate-500 text-xs font-bold uppercase">vagy csatlakozás</span>
            <div className="grow border-t border-slate-700"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="KÓD"
              maxLength={4}
              className="w-1/3 p-4 rounded-2xl bg-slate-700 border border-slate-600 text-center font-mono text-xl font-bold outline-none focus:border-purple-500"
            />
            <button
              onClick={handleJoinRoom}
              className="w-2/3 bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-black transition-all"
            >
              BELÉPÉS
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-center text-sm font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
          {error}
        </p>
      )}
    </div>
  );
};
