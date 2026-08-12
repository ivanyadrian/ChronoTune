import { MoveLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

const BackButton = ({ onClick, label, className = "" }: BackButtonProps) => {
  const { t } = useLanguage();
  const displayLabel = label ?? t.back;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all p-2  hover:bg-white/5 rounded-full group ${className}`}
    >
      <MoveLeft 
        size={14} 
        strokeWidth={3}
        className="transition-transform group-hover:-translate-x-1" 
      />
      <span>{displayLabel}</span>
    </button>
  );
};

export default BackButton;