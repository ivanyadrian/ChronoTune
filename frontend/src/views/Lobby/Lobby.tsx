import { Badge } from "../../components/ui/Badge";
import {
  Copy,
  Users,
  Flag,
  Play,
  DoorClosed,
  DoorOpen,
  Repeat2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import LeaveGameButton from "../../components/ui/LeaveGameButton";
import RangeSlider from "../../components/RangeSlider";
import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useLanguage } from "../../context/LanguageContext";
import { SongLibrarySelector } from "../Menu/components/SongLibrarySelector";

interface LobbyViewProps {
  roomCode: string;
  players: string[];
  isHost: boolean;
  currentUserName: string;
  targetLength: number;
  syncMusic: boolean;
  songLibrary: 'hu' | 'en';
  onSyncMusicChange: (val: boolean) => void;
  onTargetLengthChange: (val: number) => void;
  onSongLibraryChange: (val: 'hu' | 'en') => void;
  onShowToast: (
    message: string,
    type?: "success" | "info" | "leave" | "error",
    icon?: ReactNode,
  ) => void;
  startGame: () => void;
  onLeave: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomCode,
  players,
  isHost,
  currentUserName,
  targetLength,
  syncMusic,
  songLibrary,
  onSyncMusicChange,
  onTargetLengthChange,
  onSongLibraryChange,
  onShowToast,
  startGame,
  onLeave,
}) => {
  const { t } = useLanguage();
  const textToCopy = roomCode;

  // MISSING STATES
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);
  const playerListRef = useRef<HTMLDivElement>(null);

  // Checks if there is anything to scroll and where we are
  const checkScroll = () => {
    const element = playerListRef.current;
    if (!element) return;

    const hasScroll = element.scrollHeight > element.clientHeight;
    const atTop = element.scrollTop <= 10;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    
    setShowTopIndicator(hasScroll && !atTop);
    setShowBottomIndicator(hasScroll && !atBottom);
  };

  // Watch scrolling and new players
useEffect(() => {
  const element = playerListRef.current;
  if (!element) return;

  // Save a small delay in a variable
  const timer = setTimeout(checkScroll, 100);
  
  element.addEventListener('scroll', checkScroll);
  
  return () => {
    clearTimeout(timer); 
    element.removeEventListener('scroll', checkScroll);
  };
}, [players]);

  // Check on resize too
  useEffect(() => {
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className="w-full max-w-6xl my-8 px-3 xs:px-6 rounded-3xl flex flex-col items-center gap-6">
      <Badge text="Lobby" />
      <h2 className="text-fluid-h1 font-mono font-extrabold text-white tracking-wide leading-none">
        {roomCode}
      </h2>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 w-full max-w-md mx-auto rounded-4xl bg-bg-dark border border-white/7 p-2 gap-4">
        <div className="flex flex-col gap-1 px-4 py-2 text-center sm:text-left">
          <p className="text-primary text-[0.7rem] font-archivo uppercase tracking-[0.2em]">
            {t.lobbyInvite}
          </p>
          <p className="text-slate-400 text-[0.8rem] leading-tight sm:max-w-none">
            {t.lobbyShareCode}
          </p>
        </div>

        <CopyToClipboard 
          text={textToCopy}
          onCopy={() => onShowToast(t.lobbyCopied, "success")}
        >
          <div
            className="w-full sm:w-auto rounded-3xl flex items-center justify-center bg-[#2d1b3e] border border-white/10 px-6 py-4 gap-3 cursor-pointer hover:bg-[#39224f] hover:border-primary/50 transition-all active:scale-95 group"
          >
            <Copy
              className="text-white group-hover:text-primary transition-colors"
              size={18}
            />
            <p className="text-white text-[0.9rem] font-bold tracking-wide whitespace-nowrap">
              {t.lobbyCopyCode}
            </p>
          </div>
        </CopyToClipboard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto">
        {/* LEFT BLOCK - Player list */}
        <div className="lg:col-span-4 border-2 bg-surface-dark border-secondary/20 p-4 sm:p-6 rounded-3xl min-h-50 flex flex-col items-start text-slate-500 font-medium">
          <div className="flex gap-2 justify-center items-center shrink-0">
            <Users size={22} className="text-pink-500 fill-pink-500 inline-block shrink-0" />
            <p className="text-white font-extrabold text-fluid-h3">
              {t.lobbyPlayers}{" "}
              <span className="text-pink-500 font-bold">[{players.length}]</span>
            </p>
          </div>
          
          {/* Scrollable list - relative position to the gradient */}
          <div className="relative w-full">
            {/* Top gradient */}
            {showTopIndicator && (
              <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none bg-linear-to-b from-surface-dark to-transparent z-10" />
            )}
            
            {/* The list */}
            <div 
              ref={playerListRef}
              className="flex flex-col gap-2 mt-6 w-full overflow-y-auto max-h-50 md:max-h-115 hide-scrollbar"
            >
              {players.map((player, index) => (
                <div
                  key={player}
                  className={`bg-slate-700/50 text-white tracking-wider px-4 py-3 rounded-xl flex justify-between border text-sm font-bold w-full text-center sm:text-left shrink-0
                    ${player === currentUserName ? "border-secondary bg-purple-900/50" : "border-slate-600"}
                  `}
                >
                  {player}{" "}
                  <span className={`italic capitalize ${player === currentUserName ? "text-secondary-light" : "text-[color-mix(in_srgb,var(--primary)_45%,black)]"}`}>
                    {index === 0 ? "host" : "player"}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Bottom gradient and arrow */}
            {showBottomIndicator && (
              <>
                <div className="absolute -bottom-1 left-0 right-0 h-16 pointer-events-none bg-linear-to-t from-surface-dark to-transparent z-10" />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white rounded-full p-2 transition-all duration-200 z-20 animate-bounce">
                  <ChevronDown size={20} />
                </div>
              </>
            )}

            {/* Top arrow (optional) */}
            {showTopIndicator && !showBottomIndicator && (
              <>
                <div className="absolute -top-1 left-0 right-0 h-16 pointer-events-none bg-linear-to-b from-surface-dark to-transparent z-10" />
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white rounded-full p-2 transition-all duration-200 z-20 animate-bounce">
                  <ChevronUp size={20} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT BLOCK - Settings */}
        <div className="lg:col-span-8 border-2 bg-surface-dark border-secondary/20 rounded-3xl p-4 sm:p-6 flex flex-col gap-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Flag className="text-primary shrink-0" size={24} />
              <h3 className="text-white font-archivo uppercase tracking-widest text-fluid-h4">
                {t.lobbyGameLength}
              </h3>
            </div>
            <p className="text-slate-400 text-fluid-p max-w-md mb-7">
              {t.lobbyTurnsDesc}{" "}
              <span className="text-primary text-lg sm:text-xl font-archivo italic leading-none drop-shadow-[0_0_10px] shadow-primary/30">
                {targetLength} {""}
              </span>
              {t.lobbyTurnsDesc2}
              <br />
              {isHost ? (
                <span className="text-[#46ef87] font-archivo block mt-2">
                  {t.lobbyHostCanEdit}
                </span>
              ) : (
                <span className="text-[#ff0303] font-archivo block mt-2">
                  {t.lobbyOnlyHostEdit}
                </span>
              )}
            </p>
          </div>
          
          <div className={!isHost ? "pointer-events-none opacity-60" : ""}>
            <RangeSlider
              min={5}
              max={25}
              step={1}
              value={targetLength}
              onChange={onTargetLengthChange}
              marks={[5, 10, 15, 20, 25]}
            />
          </div>

                    {/* Song Library */}
          <div className="mt-7">
            <SongLibrarySelector
              value={songLibrary}
              onChange={onSongLibraryChange}
              disabled={!isHost}
            />
          </div>

          <div className="flex flex-col mt-7">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Repeat2 className="text-primary shrink-0" size={24} />
                <h3 className="text-white font-archivo uppercase tracking-widest text-fluid-h4">
                  {t.lobbySyncMusic}
                </h3>
              </div>

              <button
                type="button"
                disabled={!isHost}
                onClick={() => onSyncMusicChange(!syncMusic)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  syncMusic ? "bg-primary" : "bg-gray-600"
                } ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                role="switch"
                aria-checked={syncMusic}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    syncMusic ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="text-slate-400 text-sm max-w-md mt-3">
              {t.lobbySyncMusicDesc}
            </p>
          </div>

          <div className="w-full">
            <button
              onClick={() => isHost && startGame()}
              disabled={!isHost}
              className="p-3.5 font-archivo sm:p-4 bg-primary w-full rounded-full mt-7 sm:mt-10 text-white font-bold flex items-center justify-center gap-2 tracking-widest uppercase hover:brightness-110 hover:scale-102 hover:shadow-[0_0_20px_3px_rgba(239,77,255,0.4)] active:scale-105 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <Play size={18} className="fill-white sm:w-5 sm:h-5" />
              <span className="text-fluid-p">
                {t.lobbyStartGame}
              </span>
            </button>

            {!isHost && (
              <p className="text-slate-500 italic text-xs mt-3 text-center animate-pulse">
                {t.lobbyOnlyHostStart}
              </p>
            )}
          </div>
        </div>
      </div>

      <LeaveGameButton onConfirm={onLeave}>
        <button className="group w-full py-3 rounded-2xl font-bold text-sm text-slate-400 border border-slate-700 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-all active:scale-95 flex items-center justify-center gap-2">
          <DoorClosed size={18} className="group-hover:hidden transition-all" />
          <DoorOpen
            size={18}
            className="hidden group-hover:block transition-all"
          />
          <span>{t.lobbyLeave}</span>
        </button>
      </LeaveGameButton>
    </div>
  );
};