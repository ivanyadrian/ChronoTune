import { useState, useEffect } from "react";
import { Trophy, Timer, Play, AlertCircle, Calendar, MessageSquareWarning } from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import { socket } from "../../socket";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { getScoreColor } from "../../utils/scoreUtils";
import { API_BASE } from "../../utils/apiUtils";
import { formatDuration, formatTimeLeft } from "../../utils/timeUtils";
import { useLanguage } from "../../context/LanguageContext";

interface LeaderboardEntry {
  username: string;
  mistakes: number;
  correctPlacements: number;
  timeInSeconds: number;
  createdAt: string;
}

interface ActiveRunInfo {
  username: string;
  runId?: string;
}

interface WeeklyChallengeViewProps {
  userName: string;
  setUserName: (name: string) => void;
  onBack: () => void;
  onStartChallenge: () => void;
}



export const WeeklyChallengeView = ({
  userName,
  setUserName,
  onBack,
  onStartChallenge,
}: WeeklyChallengeViewProps) => {
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextResetMs, setNextResetMs] = useState<number | null>(null);

  // Active run & played notice state
  const [activeRunInfo, setActiveRunInfo] = useState<ActiveRunInfo | null>(null);
  const [showNotice, setShowNotice] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  // 1. Check for active run and played status by fingerprint on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        setStatusLoading(true);
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprint = result.visitorId;

        const res = await fetch(
          `${API_BASE}/api/weekly-challenge/status?fingerprint=${encodeURIComponent(fingerprint)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.hasActiveRun && data.username) {
            setActiveRunInfo({ username: data.username, runId: data.runId });
            setShowNotice(true);
            setUserName(data.username);
          }
          if (data.hasPlayed) {
            setHasPlayed(true);
          }
        }
      } catch (err) {
        console.error("Hiba az aktív futás ellenőrzésekor:", err);
      } finally {
        setStatusLoading(false);
      }
    }

    checkStatus();
  }, []);

  // 2. Fetch info & leaderboard on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const infoRes = await fetch(`${API_BASE}/api/weekly-challenge/info`);
        if (infoRes.ok) {
          const infoData = await infoRes.json();
          setNextResetMs(infoData.nextResetInMs);
        }

        const lbRes = await fetch(`${API_BASE}/api/weekly-challenge/leaderboard`);
        if (lbRes.ok) {
          const lbData = await lbRes.json();
          setLeaderboard(lbData);
        } else {
          setError(t.weeklyLoading);
        }
      } catch (err) {
        console.error("Hiba az adatok lekérése során:", err);
        setError(t.weeklyLoading);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 3. Countdown timer effect
  useEffect(() => {
    if (nextResetMs === null || nextResetMs <= 0) return;

    const interval = setInterval(() => {
      setNextResetMs((prev) => {
        if (prev === null || prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextResetMs]);

  // 4. Real-time leaderboard updates
  useEffect(() => {
    if (!socket) return;

    const handleLeaderboardUpdate = (updatedLeaderboard: LeaderboardEntry[]) => {
      setLeaderboard(updatedLeaderboard);
    };

    socket.on("weeklyLeaderboardUpdated", handleLeaderboardUpdate);

    return () => {
      socket.off("weeklyLeaderboardUpdated", handleLeaderboardUpdate);
    };
  }, []);



  const isDataLoading = loading || statusLoading;
  const nameAlreadyInLeaderboard = leaderboard.some(
    (entry) => entry.username.toLowerCase() === userName.trim().toLowerCase()
  );
  const isPlayerBlocked = hasPlayed || (!!userName.trim() && nameAlreadyInLeaderboard);
  const isStartDisabled = !userName.trim() || isPlayerBlocked || isDataLoading;

  const handleStart = () => {
    if (!userName.trim() || isStartDisabled) {
      return;
    }
    onStartChallenge();
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Active Run Notification Modal */}
      {showNotice && activeRunInfo && (
        <div className="fixed inset-0 z-50 h-full flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface-dark border border-slate-600 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-secondary border border-yellow-500/20 flex items-center justify-center text-black">
              <MessageSquareWarning size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-archivo text-white">
                {t.weeklyActiveTitle}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.weeklyActiveDesc}{" "}
                <span className="text-primary font-semibold">„{activeRunInfo.username}"</span>{" "}
                {t.weeklyActiveUsing}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 w-full">
              <button
                onClick={() => {
                  setShowNotice(false);
                  onStartChallenge();
                }}
                className="w-full py-3.5 px-4 rounded-full bg-linear-to-b from-(--primary) to-[color-mix(in_srgb,var(--primary)_80%,black)] cursor-pointer flex items-center justify-center gap-1.5 shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-white font-bold text-sm"
              >
                <Play size={16} fill="white" /> {t.weeklyContinue}
              </button>

              <button
                onClick={onBack}
                className="w-full py-3 px-4 rounded-full border border-white/10 bg-white/5 font-semibold text-sm text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {t.weeklyBackToMenu}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col min-[350px]:flex-row items-start min-[350px]:items-center justify-between gap-2.5 min-[350px]:gap-0">
        <BackButton onClick={onBack} />
        <div className="flex items-center gap-2 text-cyan-400 bg-cyan-600/10 border border-cyan-500/20 px-4 py-1.5 rounded-full text-[9px] xs:text-xs font-archivo tracking-wider max-[350px]:self-center min-[350px]:self-auto">
          <Calendar size={14} />
          <span className="uppercase">{t.weeklyResetTime}</span>
        </div>
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-fluid-h1 font-archivo text-white tracking-tighter">
          {t.weeklyTitle}
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-fluid-p leading-relaxed">
          {t.weeklySubtitle}
          <span className="pl-1 text-secondary italic">
            {t.weeklySameList}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Info & Rules Card */}
        <div className="md:col-span-1 flex flex-col gap-6 rounded-3xl border border-white/5 bg-surface-dark p-6 backdrop-blur-md justify-between overflow-hidden">
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-archivo text-secondary-light">{t.weeklyRulesTitle}</h2>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex gap-3">
                <div className="p-1.5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">1</div>
                <p>{t.weeklyRule1}</p>
              </div>
              <div className="flex gap-3">
                <div className="p-1.5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">2</div>
                <p>{t.weeklyRule2Start} <span className="font-archivo underline text-green-400">{t.weeklyRule2Title}</span> {t.weeklyRule2Mid} <span className="font-archivo text-blue-400 underline">{t.weeklyRule2Time}</span> {t.weeklyRule2End}</p>
              </div>
              <div className="flex gap-3">
                <div className="p-1.5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">3</div>
                <p>{t.weeklyRule3}</p>
              </div>
            </div>

            {/* Countdown widget */}
            <div className="bg-bg-dark/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[10px] text-zinc-500 font-archivo tracking-widest uppercase">{t.weeklyCountdownLabel}</span>
              <div className="flex items-center gap-2 text-xl font-bold font-archivo text-blue-400 mt-1">
                <Timer size={18} className="hidden xxs:block" />
                <span>{formatTimeLeft(nextResetMs)}</span>
              </div>
            </div>
          </div>

          {/* Action area */}
          <div className="space-y-4 pt-6 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-xs font-archivo text-slate-500 uppercase tracking-widest block">
                {t.weeklyNameLabel}
              </label>
              <input
                type="text"
                placeholder={t.weeklyNamePlaceholder}
                value={userName}
                onChange={(e) => setUserName(e.target.value.slice(0, 20))}
                className="w-full bg-bg-dark font-archivo border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-secondary-light transition text-center font-bold placeholder:text-white/20"
              />
            </div>

            <button
              onClick={handleStart}
              disabled={isStartDisabled}
              aria-label={t.weeklyStart}
              className="w-full font-archivo tracking-widest rounded-full bg-linear-to-r from-(--primary) to-[color-mix(in_srgb,var(--primary)_70%,black)] py-4 font-bold p-[clamp(0.85rem,2.5vw,1.15rem)] text-fluid-p uppercase shadow-[0_0_30px] shadow-primary/30 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer text-white
              disabled:opacity-20 disabled:grayscale disabled:pointer-events-none"
            >
              <Play fill="white" className="w-[clamp(1rem,2vw,1.25rem)]" strokeWidth="3" /> {t.weeklyStart}
            </button>

            {hasPlayed ? (
              <p className="text-xs text-amber-400/90 text-start font-archivo flex items-center justify-center gap-1.5 pt-1">
                <AlertCircle size={14} /> {t.weeklyAlreadyPlayed}
              </p>
            ) : nameAlreadyInLeaderboard ? (
              <p className="text-xs text-amber-400/90 text-start font-archivo flex items-center justify-center gap-1.5 pt-1">
                <AlertCircle size={14} /> {t.weeklyNameTaken}
              </p>
            ) : null}
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="md:col-span-2 rounded-3xl border border-white/5 bg-surface-dark p-6 backdrop-blur-md flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg xs:text-xl font-bold font-archivo text-white flex items-center gap-2">
              {t.weeklyLeaderboardTitle}
            </h2>
            <span className="text-[10px] xs:text-xs text-zinc-500 font-archivo">{t.weeklyLeaderboardTop}</span>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-secondary-light border-t-transparent rounded-full mb-3" />
              <p className="text-slate-400 text-sm">{t.weeklyLoading}</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-2 text-red-400">
              <AlertCircle size={32} />
              <p className="text-sm">{error}</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3 border-2 border-dashed border-white/5 rounded-2xl">
              <Trophy size={40} className="text-white/15" />
              <div className="space-y-1">
                <p className="text-slate-300 font-semibold">{t.weeklyNoEntries}</p>
                <p className="text-slate-500 text-xs max-w-xs">{t.weeklyBeFirst}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-archivo text-slate-500 uppercase tracking-widest">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4 text-center">{t.weeklyColName}</th>
                    <th className="py-3 px-4 text-center">{t.weeklyColResult}</th>
                    <th className="py-3 px-4 text-right">{t.weeklyColTime}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {leaderboard.slice(0, 10).map((entry, index) => {
                    const podiumClass =
                      index === 0
                        ? "bg-linear-to-r from-[#FFF4B0] via-[#FFD700] to-[#B8860B] bg-clip-text text-transparent font-archivo"
                        : index === 1
                          ? "bg-linear-to-r from-[#F8F8F8] via-[#C0C0C0] to-[#7A7A7A] bg-clip-text text-transparent font-archivo"
                          : index === 2
                            ? "bg-linear-to-r from-[#F0B27A] via-[#CD7F32] to-[#8C4A1E] bg-clip-text text-transparent font-archivo"
                            : ""

                    return (
                      <tr
                        key={index}
                        className={`hover:bg-white/2 transition-colors ${index === 0
                          ? "bg-[#FFD700]/5"
                          : index === 1
                            ? "bg-[#C0C0C0]/5"
                            : index === 2
                              ? "bg-[#CD7F32]/5"
                              : ""
                          }`}
                      >
                        <td
                          className={`py-3.5 px-4 font-archivo ${index === 0
                            ? "bg-linear-to-r from-[#fdec81] via-[#FFD700] to-[#B8860B] bg-clip-text text-transparent"
                            : index === 1
                              ? "bg-linear-to-r from-[#F8F8F8] via-[#C0C0C0] to-[#7A7A7A] bg-clip-text text-transparent"
                              : index === 2
                                ? "bg-linear-to-r from-[#F0B27A] via-[#CD7F32] to-[#8C4A1E] bg-clip-text text-transparent"
                                : "text-white"
                            }`}
                        >
                          #{index + 1}
                        </td>

                        <td className={`py-3.5 px-4 font-archivo text-center ${podiumClass}`}>
                          {entry.username}
                        </td>

                        <td className="py-3.5 px-4 text-center font-archivo">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getScoreColor(entry.correctPlacements)}`}
                          >
                            {entry.correctPlacements} <span className="text-slate-300">/ 20</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-archivo text-blue-400">
                          {formatDuration(entry.timeInSeconds)}
                        </td>
                      </tr>
                    );
                  })}

                  {leaderboard.length > 10 && (
                    <tr className="border-t border-white/5">
                      <td
                        colSpan={4}
                        className="pt-12 px-4 text-center text-slate-400 italic"
                      >
                        +{leaderboard.length - 10} {t.weeklyMore}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
