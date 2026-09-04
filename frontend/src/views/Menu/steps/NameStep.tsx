import { useState, useEffect } from "react";
import {
  AudioLines,
  MoveRight,
  User,
  HelpCircle,
  Music,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { StatItem } from "../components/StatItem";
import { Divider } from "../components/Divider";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { useLanguage } from "../../../context/LanguageContext";
import { InfoModal } from "../../../components/ui/InfoModal";
import { PrivacyModal } from "../../../components/ui/PrivacyModal";
import {
  STORAGE_KEYS,
  isTutorialHidden,
  setTutorialHidden,
} from "../../../utils/storageUtils";

interface NameStepProps {
  userName: string;
  setUserName: (name: string) => void;
  onNext: () => void;
}

export const NameStep = ({ userName, setUserName, onNext }: NameStepProps) => {
  const { t } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (!isTutorialHidden(STORAGE_KEYS.TUTORIAL_NAME)) {
      setShowInfo(true);
    }
  }, []);

  const handleCloseInfo = (dontShowAgain: boolean) => {
    setShowInfo(false);
    setTutorialHidden(STORAGE_KEYS.TUTORIAL_NAME, dontShowAgain);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* Main container */}
      <div className="w-full max-w-2xl p-[clamp(1rem,5vw,1.125rem)] bg-surface-dark/90 backdrop-blur-xl border border-white/5 border-t-4 border-t-purple-600/40 rounded-4xl sm:rounded-[3rem] shadow-2xl flex flex-col items-center gap-[clamp(1.5rem,4vw,2.5rem)]">
        <div className="w-full flex justify-between items-center">
          <button
            onClick={() => setShowInfo(true)}
            title={t.tutorialInfoTooltip}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <HelpCircle size={18} />
          </button>
          <LanguageSwitcher />
        </div>

        <AudioLines
          size={64}
          className="text-secondary-light bg-white/5 rounded-full p-4 w-16 h-16 sm:w-20 sm:h-20"
        />
        <Badge text="Musical Timeline Challenge" />

        <div className="space-y-4 text-center">
          <h1 className="text-fluid-h1 font-archivo text-white tracking-tighter leading-none pl-2">
            Chrono
            <span className="bg-linear-to-r from-(--secondary-light) to-(--secondary) bg-clip-text text-transparent pr-2">
              Tune
            </span>
          </h1>
          <p className="text-slate-400 text-fluid-p leading-relaxed max-w-[45ch] mx-auto">
            {t.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-[clamp(1rem,3vw,1.5rem)] w-full max-w-md mx-auto">
          <div className="flex items-center p-[clamp(0.25rem,1vw,0.2rem)] bg-black/40 border border-white/10 focus-within:border-secondary/50 rounded-[clamp(1rem,2vw,1.5rem)] focus-within:ring-4 focus-within:ring-secondary/5 transition-all group">
            <div className="pl-[clamp(0.75rem,2vw,1.25rem)] text-slate-500 group-focus-within:text-secondary-light transition-colors">
              <User
                size={20}
                className="w-[clamp(1.1rem,2vw,1.25rem)] h-auto"
              />
            </div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t.namePlaceholder}
              maxLength={15}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userName.trim()) {
                  onNext();
                }
              }}
              className="font-extrabold w-full text-fluid-h4 p-[clamp(0.75rem,2vw,1rem)] bg-transparent border-none outline-none text-white placeholder:text-slate-700 tracking-wider"
            />
          </div>

          <button
            disabled={!userName.trim()}
            onClick={onNext}
            aria-label={t.next}
            className="bg-primary rounded-2xl flex items-center justify-center p-[clamp(0.85rem,2vw,1.15rem)] font-archivo gap-2 tracking-widest uppercase
              disabled:opacity-20 disabled:grayscale disabled:pointer-events-none
              shadow-[0_10px_20px_-10px] shadow-primary/50 
              hover:shadow-[0_15px_30px_-10px] hover:shadow-primary/50 hover:-translate-y-0.5
              active:translate-y-0.5 active:scale-[0.98] transition-all duration-300"
          >
            <span>{t.next}</span>
            <MoveRight
              size={22}
              className="w-[clamp(1.1rem,2vw,1.4rem)]"
              strokeWidth={3}
            />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 pt-1">
          <p className="text-fluid-badge text-slate-500/80 italic text-center mx-auto">
            {t.noRegNeeded}
          </p>

          <button
            onClick={() => setShowPrivacy(true)}
            className="group inline-flex items-center gap-1.5 text-slate-400 hover:text-secondary-light transition-all duration-200 py-1 px-3 rounded-full hover:bg-white/5 active:scale-95 cursor-pointer"
          >
            <span className="font-archivo tracking-widest uppercase text-[10px] sm:text-[11px] opacity-80 group-hover:opacity-100 transition-opacity">
              {t.privacyAndStorage}
            </span>
            <ExternalLink
              size={12}
              className="text-secondary-light/60 group-hover:text-secondary-light transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>

      </div>

      {/* Statistics bar */}
      <div className="mt-14 w-full max-w-4xl px-[clamp(1rem,4vw,2rem)] flex flex-col items-center gap-4">
        <p className="font-archivo text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em] text-center opacity-80">
          {t.statHeader}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-y-6 gap-x-10 w-full">
          <StatItem value={t.statItem_1} label={t.statItem_1_desc} />
          <div className="hidden md:block">
            <Divider />
          </div>
          <StatItem value={t.statItem_2} label={t.statItem_2_desc} />
          <div className="hidden md:block">
            <Divider />
          </div>
          <div className="flex justify-center min-w-30">
            <StatItem value={t.statItem_3} label={t.statItem_3_desc} />
          </div>
        </div>
      </div>
     
      <InfoModal
        isOpen={showInfo}
        onClose={handleCloseInfo}
        storageKey={STORAGE_KEYS.TUTORIAL_NAME}
        title={t.tutorialNameTitle}
        subtitle={t.tutorialNameSubtitle}
        icon={<AudioLines className="w-7 h-7" />}
        sections={[
          {
            icon: <Music className="w-5 h-5" />,
            title: t.tutorialNameItem1Title,
            description: t.tutorialNameItem1Desc,
          },
          {
            icon: <Sparkles className="w-5 h-5" />,
            title: t.tutorialNameItem3Title,
            description: t.tutorialNameItem3Desc,
          },
        ]}
      />

      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </div>
  );
};
