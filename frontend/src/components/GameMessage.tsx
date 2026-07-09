interface GameMessageProps {
  message: {
    text: string;
    status: "success" | "error" | "info" | "gameOver" | "lastRound";
    pointsEarned?: number;
    bonusPoints?: number;
  } | null;
  countdown: number | null;
  nextPlayerName?: string | null;
  alwaysVisible?: boolean;
}

export const GameMessage = ({ message, nextPlayerName }: GameMessageProps) => {
  if (!message) return null;

  const isInformation =
    message.status === "lastRound" ||
    message.status === "gameOver" ||
    message.status === "info";

  return (
    //  Full screen overlay with blur and fade-in effect
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div
        className={`
        relative overflow-hidden p-4 sm:p-6 rounded-3xl md:rounded-4xl border-4 shadow-2xl transition-all w-full max-w-4xl flex flex-col items-center
        animate-in zoom-in-95 duration-500
        ${
          isInformation
            ? "bg-[#241631]/95 border-fuchsia-500/50 shadow-fuchsia-500/40"
            : message.status === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 shadow-emerald-500/40"
              : "bg-red-950/90 border-red-500/50 shadow-red-500/40"
        }
      `}
      >
        {/*  Background glow */}
        <div
          className={`absolute -inset-10 blur-3xl opacity-20 pointer-events-none 
            ${isInformation ? "bg-fuchsia-500" : message.status === "success" ? "bg-emerald-500" : "bg-red-500"}`}
        />

        <div className="relative flex flex-col items-center gap-8">
          {/* Icon and Main Text */}
          <div className="flex flex-col items-center gap-4">
            <h2
              className={`text-xl sm:text-3xl font-archivo uppercase tracking-tighter italic text-center leading-tight ${
                isInformation
                  ? "text-fuchsia-400"
                  : message.status === "success"
                    ? "text-emerald-400"
                    : "text-red-400"
              }`}
            >
              {message.text}
            </h2>
            {message.status === "success" &&
              message.pointsEarned !== undefined &&
              message.pointsEarned > 0 && (
                <div className="animate-in zoom-in-50 duration-500 delay-200 flex items-center gap-3">
                  <div className="text-4xl sm:text-6xl font-archivo italic drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-4">
                    {message.bonusPoints && Number(message.bonusPoints) > 0 ? (
                      <>
                        <span className="text-white">
                          +{message.pointsEarned - message.bonusPoints}
                        </span>
                        <span className="text-secondary-light">
                          +{message.bonusPoints}
                        </span>
                      </>
                    ) : (
                      <span className="text-white">
                        +{message.pointsEarned}
                      </span>
                    )}
                  </div>

                  {/* always shown */}
                  <span className="text-white/60 text-2xl sm:text-4xl font-archivo not-italic uppercase">
                    pont
                  </span>
                </div>
              )}
            {message.status === "error" &&
              message.pointsEarned !== undefined && (
                <div className="animate-in zoom-in-50 duration-500 delay-200 flex items-center gap-3">
                  <div className="text-4xl sm:text-6xl font-archivo italic drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center gap-4">
                    {message.bonusPoints && Number(message.bonusPoints) > 0 ? (
                      <>
                        <span className="text-white">
                          {message.pointsEarned + message.bonusPoints}
                        </span>
                        <span className="text-red-400">
                          -{message.bonusPoints}
                        </span>
                      </>
                    ) : (
                      <span className="text-white">{message.pointsEarned}</span>
                    )}
                  </div>

                  <span className="text-white/60 text-2xl sm:text-4xl font-archivo not-italic uppercase">
                    pont
                  </span>
                </div>
              )}
          </div>

          {/* Multiplayer mode: Next player indicator */}
          {nextPlayerName && (
            <div className="flex flex-col items-center gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
              <div className="h-px w-20 bg-white/10 mb-2" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                Soron következő:
              </span>
              <span className="text-3xl sm:text-5xl font-archivo text-white italic uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {nextPlayerName}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar that shows the remaining time */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full overflow-hidden">
          <div
            className={`h-full 
              ${isInformation ? "bg-fuchsia-500" : message.status === "success" ? "bg-emerald-500" : "bg-red-500"}`}
            style={{
              /* How long the progress bar should take to shrink */
              animation: "shrink-width 1.5s linear forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
};
