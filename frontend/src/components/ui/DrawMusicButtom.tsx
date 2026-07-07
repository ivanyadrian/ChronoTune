interface DrawMusicButtonProps {
  onClick: () => void;
  disabled?: boolean;
  waitingForName?: string | null;
}

export const DrawMusicButton = ({
  onClick,
  disabled,
  waitingForName,
}: DrawMusicButtonProps) => {
  return (
    <div
      className={`relative group ${disabled ? "opacity-50 grayscale pointer-events-none" : ""}`}
    >
      <div
        className={`relative transition-all duration-300 ${!disabled ? "transform hover:scale-105 active:scale-95" : ""}`}
      >
        {!disabled && (
          <div
            className="absolute inset-0 bg-linear-to-r from-(--primary)  via-[color-mix(in_srgb,var(--primary)_70%,black)] to-(--primary) 
              rounded-4xl blur-xl opacity-40 
              group-hover:opacity-70 group-hover:blur-2xl 
              transition-all duration-500 scale-95 group-hover:scale-105"
          />
        )}

        <button
          onClick={onClick}
          disabled={disabled}
          className="
            relative py-[clamp(1.5rem,5vw,2.5rem)] px-[clamp(1.5rem,6vw,3rem)]
            bg-bg-dark border-4 border-primary/60
            rounded-[clamp(1.5rem,3vw,2.5rem)] shadow-[0_0_30px] shadow-primary/30
            flex flex-col items-center justify-center gap-2
            transition-all duration-300
            enabled:hover:border-primary overflow-hidden
          "
        >
          <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent opacity-50" />

          <div className="relative z-10 flex flex-col items-center">
            <span className="text-white font-black text-[clamp(1.5rem,4vw,2.2rem)] uppercase italic tracking-tighter leading-none">
              {waitingForName ? "Várakozás" : "Új dal"}
            </span>

            <span className="text-primary font-bold uppercase tracking-widest mt-2 opacity-90 text-[clamp(0.75rem,2.2vw,1rem)]">
              {waitingForName
                ? `${waitingForName} köre`
                : "Húzása a pakliból"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
