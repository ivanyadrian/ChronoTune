interface StatItemProps {
  value: string;
  label: string;
}

export const StatItem = ({ value, label }: StatItemProps) => (
  <div className="flex flex-col items-center">
    <span className="font-archivo text-2xl md:text-4xl text-white italic leading-none">
      {value}
    </span>
    <span className="font-archivo text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">
      {label}
    </span>
  </div>
);