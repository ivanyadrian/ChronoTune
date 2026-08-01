import React from "react";

export interface AccentStyle {
  colorClass: string;
  hoverBg: string;
  borderColor: string;
}

export const ACCENT_CONFIGS = {
  pink: {
    colorClass: "text-primary",
    hoverBg: "group-hover:bg-primary",
    borderColor: "border-primary/10 hover:border-primary",
  },
  yellow: {
    colorClass: "text-[#FFFF8F]",
    hoverBg: "group-hover:bg-[#FFFF8F]",
    borderColor: "border-[#FFFF8F]/10 hover:border-[#FFFF8F]",
  },
  cyan: {
    colorClass: "text-cyan-400",
    hoverBg: "group-hover:bg-cyan-400",
    borderColor: "border-cyan-400/10 hover:border-cyan-400/50",
  },
} as const;

export type ModeCardAccent = keyof typeof ACCENT_CONFIGS;

interface ModeCardProps {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size: number; strokeWidth?: number; className?: string }>;
  img: string;
  onClick: () => void;
  accentColor?: ModeCardAccent | (string & {});
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
  status,
  imgAlt,
}: ModeCardProps) => {
  const accent = ACCENT_CONFIGS[accentColor as ModeCardAccent] || {
    colorClass: accentColor.startsWith("text-") ? accentColor : `text-[${accentColor}]`,
    hoverBg: accentColor.startsWith("text-")
      ? `group-hover:bg-${accentColor.replace(/^text-/, "")}`
      : `group-hover:bg-[${accentColor}]`,
    borderColor: accentColor.startsWith("text-")
      ? `border-${accentColor.replace(/^text-/, "")}/30 hover:border-${accentColor.replace(/^text-/, "")}`
      : `border-[${accentColor}]/30 hover:border-[${accentColor}]`,
  };

  const { colorClass, hoverBg, borderColor } = accent;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col justify-end w-full
      min-h-[clamp(12rem,25vh,24rem)] 
      py-[clamp(1.5rem,4vw,2.5rem)]
      px-[clamp(0.75rem,6vw,2.5rem)]
      bg-black/40 border-2 ${borderColor}
      rounded-[clamp(1.5rem,3vw,2.5rem)] 
      transition-all duration-500
      hover:bg-white/2 active:scale-[0.98] overflow-hidden`}
      aria-label={imgAlt || title}
    >
      {/* Image masking - modern fade effect */}
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

      {/* Content */}
      <div className="relative z-10 w-full text-left">
        {/* Icon container - dynamic sizing */}
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

        {/* Title - dynamic font size */}
        <h3
          className={`
            text-fluid-h2 
            font-archivo italic uppercase tracking-tighter 
            ${colorClass}
            leading-[1.1]
          `}
        >
          {title}
        </h3>

        {/* Description - dynamic font size */}
        <p className="
          text-fluid-p 
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