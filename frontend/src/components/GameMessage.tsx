interface GameMessageProps {
  message: {
    text: string;
    isSuccess: boolean;
  } | null;
  countdown: number | null;
}

export const GameMessage = ({ message, countdown }: GameMessageProps) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`p-10 rounded-[3rem] shadow-2xl text-center scale-110 border-4 transition-colors ${
          message.isSuccess
            ? "bg-green-600 border-green-400"
            : "bg-red-600 border-red-400"
        }`}
      >
        <h2 className="text-4xl font-black mb-4 drop-shadow-md">
          {message.text}
        </h2>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold opacity-80 uppercase tracking-widest text-white/70">
            Következő kör kezdődik:
          </p>
          <span className="text-6xl font-black tabular-nums">
            {countdown}
          </span>
        </div>
      </div>
    </div>
  );
};