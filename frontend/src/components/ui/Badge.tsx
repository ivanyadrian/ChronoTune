interface BadgeProps {
  text: string;
  className?: string;
}

export const Badge = ({ text, className = "" }: BadgeProps) => {
  return (
  <div
    className={`
      w-fit rounded-full shrink-0
      border border-primary/30 
      shadow-[0_0_20px] shadow-primary/30
      bg-purple-950/10
      px-[clamp(0.75rem,2vw,1.25rem)] 
      py-[clamp(0.4rem,0.8vw,0.5rem)]
      ${className}
    `}
  >
    <span className="
      text-purple-300 font-lilita
      flex justify-center items-center 
      font-extrabold 
      text-[clamp(0.625rem,1.2vw,0.8rem)] 
      text-center uppercase 
      tracking-[0.2em]
      leading-none pt-0.5
    ">
      {text}
    </span>
  </div>
);
};
