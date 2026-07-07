import React from "react";

interface ModeCardProps {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size: number; strokeWidth?: number; className?: string }>;
  img: string;
  onClick: () => void;
  accentColor?: "purple" | "pink";
  titleColor?: string;
  status?: React.ReactNode;
  imgAlt?: string;
}

const ModeCard = ({
  title,
  desc,
  icon: Icon,
  img,
  onClick,
  accentColor = "purple",
  titleColor,
  status,
}: ModeCardProps) => {
  const colorClass = accentColor === "pink" ? "text-primary" : "text-secondary-light";
  const hoverBg = accentColor === "pink" ? "group-hover:bg-primary" : "group-hover:bg-secondary";
  const borderColor = accentColor === "pink" ? "hover:border-primary/50" : "hover:border-secondary/50";

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col justify-end 
      min-h-[clamp(12rem,25vh,24rem)] 
      py-[clamp(1.5rem,4vw,2.5rem)]
      px-[clamp(0.75rem,6vw,2.5rem)]
      bg-black/40 border-2 border-white/5 
      rounded-[clamp(1.5rem,3vw,2.5rem)] 
      transition-all duration-500
      ${borderColor} hover:bg-white/2 active:scale-[0.98] overflow-hidden`}
    >
      {/* Kép maszkolás - modern fade effekt */}
      <div
        className="absolute inset-0 opacity-30 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-in-out pointer-events-none"
        style={{
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "linear-gradient(to bottom, black 20%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 90%)",
        }}
      />

      {/* Tartalom */}
      <div className="relative z-10 w-full text-left">
        {/* Ikon konténer - dinamikus méretek */}
        <div
          className={`
            mb-[clamp(1rem,3vw,1.5rem)] 
            p-[clamp(0.75rem,2vw,1rem)] 
            w-fit bg-white/5 rounded-[clamp(0.75rem,1.5vw,1rem)] 
            ${colorClass} ${hoverBg} group-hover:text-black 
            transition-all duration-300 shadow-inner flex items-center justify-center
          `}
        >
          <Icon 
            size={32} 
            className="w-[clamp(1.5rem,3vw,2rem)] h-auto" 
            strokeWidth={1.5} 
          />
        </div>

        {/* Cím - dinamikus betűméret */}
        <h3
          className={`
            text-[clamp(1.5rem,3.5vw,2.2rem)] 
            font-black italic uppercase tracking-tighter 
            ${titleColor || colorClass}
            leading-[1.1]
          `}
        >
          {title}
        </h3>

        {/* Leírás - dinamikus betűméret */}
        <p className="
          text-[clamp(0.8rem,1.5vw,0.9rem)] 
          text-slate-400 mt-[clamp(0.5rem,1.5vw,0.75rem)] 
          group-hover:text-slate-200 transition-colors 
          leading-relaxed max-w-[28ch]
        ">
          {desc}
        </p>
      </div>

      {status}
    </button>
  );
};

export default ModeCard;