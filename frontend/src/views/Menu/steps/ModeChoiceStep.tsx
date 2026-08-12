import { User, Users, Calendar } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import ModeCard from "../../../components/ui/ModeCard";
import BackButton from "../../../components/ui/BackButton";
import { useLanguage } from "../../../context/LanguageContext";

interface ModeChoiceStepProps {
  isConnected: boolean;
  onSelectSolo: () => void;
  onSelectMulti: () => void;
  onSelectWeekly: () => void;
  onBack: () => void;
}

export const ModeChoiceStep = ({
  // isConnected,
  onSelectSolo,
  onSelectMulti,
  onSelectWeekly,
  onBack,
}: ModeChoiceStepProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto py-[clamp(1.5rem,5vw,3rem)] space-y-[clamp(2rem,6vw,4rem)] @container">
      <Badge text="Ready to Play?" />

      <div className="space-y-[clamp(0.5rem,1.5vw,1rem)] text-center">
        <h1 className="text-fluid-h1 font-archivo text-white tracking-tighter leading-[1.1]">
          {t.modeTitle}
        </h1>
        <p className="text-slate-400 text-fluid-p max-w-[45ch] mx-auto leading-relaxed">
          {t.modeSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 @[40rem]:grid-cols-2 gap-[clamp(1rem,3vw,1.5rem)] w-full px-4">
        <ModeCard
          title={t.modeSoloTitle}
          desc={t.modeSoloDesc}
          icon={User}
          img="/img/singleplayer_cover.webp"
          imgAlt={t.modeSoloAlt}
          onClick={onSelectSolo}
          accentColor="cyan"
        />

        <ModeCard
          title={t.modeMultiTitle}
          desc={t.modeMultiDesc}
          icon={Users}
          img="/img/multiplayer_cover.webp"
          imgAlt={t.modeMultiAlt}
          onClick={onSelectMulti}
          accentColor="pink"
          // status={<ConnectionStatus isConnected={isConnected} />}
        />

        {/* Weekly Challenge Mode Card – full width row, centered */}
        <div className="col-span-1 @[40rem]:col-span-2 flex justify-center w-full">
          <div className="flex justify-center w-full @[40rem]:w-[calc(70%-clamp(1rem,3vw,1.5rem)/2)]">
            <ModeCard
              title={t.modeWeeklyTitle}
              desc={t.modeWeeklyDesc}
              icon={Calendar}
              img="/img/weekly_challenge_cover.webp"
              imgAlt={t.modeWeeklyAlt}
              onClick={onSelectWeekly}
              accentColor="yellow"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <BackButton onClick={onBack} />
      </div>
    </div>
  );
};

// const ConnectionStatus = ({ isConnected }: { isConnected: boolean }) => (
//   <div className="absolute top-[clamp(1rem,3%,1.5rem)] right-[clamp(1rem,3%,1.5rem)] z-20">
//     <div className={`px-3 py-1.5 rounded-full text-[clamp(0.6rem,1vw,0.7rem)] font-archivo border backdrop-blur-md flex 
//       items-center gap-2 ${isConnected ? "border-green-500/30 text-green-500 bg-green-500/10" : "border-red-500/30 text-red-500 bg-red-500/10"}`}>
//       <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
//       {isConnected ? "ONLINE" : "OFFLINE"}
//     </div>
//   </div>
// );