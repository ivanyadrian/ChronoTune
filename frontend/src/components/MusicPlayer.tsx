import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Move,
  RotateCw,
  RotateCcw,
  Trash,
} from "lucide-react";
import { AudioVisualizer } from "./ui/AudioVisualizer";

export const MusicPlayer = ({
  currentSong,
  handleTogglePlay,
  playbackState,
  setPlaybackState,
  seekTo,
  onSeek,
  onCardMouseDown,
  isDraggable,
  canDiscard,
  onDiscard,
  isMyTurn,
  syncMusic,
}: any) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const canControl = !syncMusic || isMyTurn;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Volume states
  const [volume, setVolume] = useState<number>(() => {
    const savedVolume = localStorage.getItem("chronotune-volume");
    return savedVolume ? parseInt(savedVolume) : 50;
  });
  const [previousVolume, setPreviousVolume] = useState<number>(volume);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const fetchFreshPreview = async () => {
      if (!currentSong?.deezerId) {
        setIsReady(false);
        return;
      }

      setIsReady(false);
      setProgress(0);
      setPlaybackState(-1);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/deezer-proxy/${currentSong.deezerId}`,
        );
        const data = await response.json();

        if (data.preview && audioRef.current) {
          const secureAudioUrl = data.preview.replace("http://", "https://");
          audioRef.current.src = secureAudioUrl;
          audioRef.current.load();

          if (audioRef.current.readyState >= 3) {
            setIsReady(true);
          }
        } else {
          throw new Error("No preview URL in Deezer response.");
        }
      } catch (err) {
        console.error("Error refreshing music link:", err);
        setIsReady(false);
      }
    };

    fetchFreshPreview();
  }, [currentSong?.deezerId, currentSong?.id]);

  useEffect(() => {
    if (audioRef.current) {
      const actualVolume = isMuted ? 0 : volume;
      audioRef.current.volume = actualVolume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  useEffect(() => {
    if (!audioRef.current || !isReady) return;

    if (playbackState === 1) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Playback error:", err);
          setPlaybackState(0);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [playbackState, isReady]);

  // Watch for incoming seek commands via prop (synchronization)
  useEffect(() => {
    if (audioRef.current && seekTo !== null) {
      console.log("MusicPlayer: Tekerés a kért pozícióra:", seekTo);
      audioRef.current.currentTime = seekTo;
    }
  }, [seekTo]);

  const handleVolumeChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { value: number } },
  ) => {
    const newVolume =
      typeof e.target.value === "string"
        ? parseInt(e.target.value)
        : e.target.value;

    setVolume(newVolume);
    setIsMuted(false);
    localStorage.setItem("chronotune-volume", newVolume.toString());
  };

  const toggleMute = () => {
    if (isMuted) {
      // Restore previous volume
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      // Save current volume and mute
      setPreviousVolume(volume);
      setIsMuted(true);
    }
  };

  // Displayed volume (0 if muted)
  const displayVolume = isMuted ? 0 : volume;

  return (
    <div
      className="w-full max-w-70 sm:max-w-2xl"
      onMouseDown={onCardMouseDown}
      style={{ cursor: isDraggable ? "grab" : "active", userSelect: "none" }}
    >
      {/* Discard button */}
      <div className="relative">
        {canDiscard && (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onDiscard}
            className="
              absolute group
              top-0 left-1/2 -translate-x-1/2 -translate-y-2/5

              sm:top-auto sm:left-auto sm:translate-x-4 sm:translate-y-49
              sm:-right-10 sm:bottom-8

              flex px-[clamp(10px,15vw,40px)] sm:px-5 py-10
              border border-secondary-light/30 rounded-lg
              text-white
              bg-linear-to-t sm:bg-linear-to-r from-red-500/20 to-red-500/40
              hover:from-red-500/30 hover:to-red-500/60

              animate-slide-responsive
              hover:scale-105 transition-all
              text-[10px] backdrop-blur-sm cursor-pointer
            "
          >
            <Trash className="w-5 h-5 sm:w-6 sm:h-6 stroke-2 group-hover:stroke-3 transition-all -translate-y-7.5 sm:translate-y-0" />
          </button>
        )}
      </div>

      <div className="bg-bg-dark/90 backdrop-blur-xl border border-secondary-light/30 rounded-4xl sm:rounded-[2.5rem] p-5 sm:p-4 sm:px-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group">
        {/* Visualizer */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <AudioVisualizer isPlaying={playbackState === 1} />
        </div>

        {/* MAIN LAYOUT: Column on mobile (flex-col), row on desktop (sm:flex-row) */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* 1. BAKELIT */}
          <div className="hidden sm:flex shrink-0 flex-col items-center group/vinyl">
            <div className="w-32 h-32 sm:w-36 sm:h-36 bg-black rounded-full flex items-center justify-center shadow-2xl border-4 border-neutral-900 relative">
              {/* Vinyl */}
              <div
                className={`w-[94%] h-[94%] rounded-full vinyl-texture flex items-center justify-center border border-neutral-800 transition-transform animate-vinyl-spin ${
                  playbackState !== 1 ? "animation-paused" : ""
                } relative`}
              >
                {/* Center Label */}
                <div className="w-[35%] h-[35%] bg-primary rounded-full flex items-center justify-center shadow-inner relative z-10">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>

                {/* Text on Vinyl */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <path
                        id="circlePath"
                        d="M 50,50
                        m -32,0
                        a 32,32 0 1,1 64,0
                        a 32,32 0 1,1 -64,0"
                      />
                    </defs>

                    <text className="fill-white/60 text-[12px] font-black tracking-wider uppercase opacity-10">
                      <textPath href="#circlePath" startOffset="50%">
                        CHRONOTUNE
                      </textPath>
                    </text>
                  </svg>
                </div>
              </div>

              {/* Tonearm */}
              <div
                className={`absolute right-2.5 w-[45%] h-2 bg-neutral-600 rounded-full origin-right transition-transform duration-500 z-10 shadow-md ${
                  playbackState === 1 ? "rotate-[-25deg]" : "rotate-[-10deg]"
                }`}
                style={{ top: "15%" }}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-3 bg-neutral-800 rounded-sm border border-neutral-700" />
              </div>
            </div>
          </div>

          {/* Divider line - desktop only */}
          <div className="hidden sm:block w-1 h-32 bg-white/10 rounded-full" />

          {/* 2. CONTROLS (Timeline + Buttons) */}
          <div className="grow w-full flex flex-col items-center gap-5 sm:gap-6">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[11px] sm:text-[13px] font-black text-white tabular-nums">
                <span>
                  0:
                  {Math.floor((progress / 100) * 30)
                    .toString()
                    .padStart(2, "0")}
                </span>
                <span>0:30</span>
              </div>
              <div className="relative h-6 flex items-center">
                <div className="absolute left-0 w-1 h-3 sm:h-4 bg-secondary-light rounded-full" />
                <div className="absolute right-0 w-1 h-3 sm:h-4 bg-secondary-light rounded-full" />
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary shadow-[0_0_15px] shadow-primary transition-all duration-300 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-[clamp(2px,5vw,48px)] sm:gap-6">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                  if (audioRef.current && onSeek) {
                    const newTime = Math.max(
                      0,
                      audioRef.current.currentTime - 5,
                    );
                    onSeek(newTime);
                  }
                }}
                disabled={!canControl}
                className="relative p-2 group/seek text-white/70 hover:text-primary disabled:hover:text-white/70 transition-colors active:scale-90 disabled:active:scale-100 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="hidden group-hover/seek:flex absolute inset-0 items-center justify-center text-[6px] sm:text-[8px] font-bold">
                  -5
                </span>
              </button>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleTogglePlay}
                disabled={!canControl}
                className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px] shadow-primary/40 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:scale-100 disabled:grayscale disabled:cursor-not-allowed"
              >
                {playbackState === 1 ? (
                  <Pause
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                    fill="white"
                  />
                ) : (
                  <Play
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                    fill="white"
                  />
                )}
              </button>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                  if (audioRef.current && onSeek) {
                    const newTime = Math.min(
                      30,
                      audioRef.current.currentTime + 5,
                    );
                    onSeek(newTime);
                  }
                }}
                disabled={!canControl}
                className="relative group/seek p-2 text-white/70 hover:text-primary disabled:hover:text-white/70 transition-colors active:scale-90 disabled:active:scale-100 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <RotateCw className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="hidden group-hover/seek:flex absolute inset-0 items-center justify-center text-[6px] sm:text-[8px] font-bold">
                  +5
                </span>
              </button>
            </div>
          </div>

          {/* 3. Volume Control */}
          <div className="flex sm:flex-col items-center gap-4 sm:gap-3 px-4 py-3 sm:px-3 sm:py-4 bg-bg-dark/50 backdrop-blur-sm rounded-full border border-secondary/10 w-full sm:w-auto shrink-0">
            <div
              className="relative h-2 sm:h-20 w-full sm:w-2 flex justify-center cursor-pointer touch-none"
              onMouseDown={(mouseDownEvent) => {
                mouseDownEvent.stopPropagation();
                mouseDownEvent.preventDefault();
                const container = mouseDownEvent.currentTarget;
                const updateVolume = (clientXOrY: number) => {
                  const rect = container.getBoundingClientRect();
                  let percentage;
                  if (window.innerWidth < 640) {
                    const relativeX = clientXOrY - rect.left;
                    percentage = (relativeX / rect.width) * 100;
                  } else {
                    const relativeY = rect.bottom - clientXOrY;
                    percentage = (relativeY / rect.height) * 100;
                  }
                  const newVolume = Math.round(
                    Math.max(0, Math.min(100, percentage)),
                  );
                  handleVolumeChange({ target: { value: newVolume } });
                };
                updateVolume(
                  window.innerWidth < 640
                    ? mouseDownEvent.clientX
                    : mouseDownEvent.clientY,
                );
                const onMouseMove = (moveEvent: MouseEvent) =>
                  updateVolume(
                    window.innerWidth < 640
                      ? moveEvent.clientX
                      : moveEvent.clientY,
                  );
                const onMouseUp = () => {
                  document.removeEventListener("mousemove", onMouseMove);
                  document.removeEventListener("mouseup", onMouseUp);
                };
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
              }}
            >
              <div className="absolute inset-0 bg-white/5 rounded-full overflow-hidden" />
              <div
                className="absolute bottom-0 left-0 bg-linear-to-r sm:bg-linear-to-t from-[color-mix(in_srgb,var(--primary)_40%,black)] to-(--primary) rounded-full transition-all duration-75 ease-out"
                style={{
                  height:
                    window.innerWidth < 640 ? "100%" : `${displayVolume}%`,
                  width: window.innerWidth < 640 ? `${displayVolume}%` : "100%",
                }}
              />
            </div>

            {/* Mute button - instead of Volume2 */}
            <button
              onClick={toggleMute}
              onMouseDown={(e) => e.stopPropagation()}
              className="focus:outline-none transition-all hover:scale-110 active:scale-95"
              aria-label={isMuted ? "Hang visszakapcsolása" : "Némítás"}
            >
              {isMuted ? (
                <VolumeX
                  className={`w-5 h-5 transition-colors text-secondary-light`}
                />
              ) : (
                <Volume2
                  className={`w-5 h-5 transition-colors ${volume > 0 ? "text-white" : "text-slate-600"}`}
                />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 sm:mt-3 text-center border-t border-white/5 pt-4">
          <p className="text-[clamp(7px,1.5vw,10px)] font-black text-slate-500 uppercase tracking-[0.2em] opacity-80">
            {canControl ? "Húzd a kártyát a megfelelő helyre!" : "\u00A0"}
          </p>
        </div>

        <div className="absolute bottom-4 right-4 text-white/20 hidden sm:block">
          {canControl ? <Move className="w-5 h-5" /> : null}
        </div>
      </div>
      <audio
        ref={audioRef}
        src={
          currentSong?.deezerId
            ? `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/deezer-proxy/${currentSong.deezerId}`
            : undefined
        }
        crossOrigin="anonymous"
        onCanPlay={() => setIsReady(true)}
        onEnded={() => {
          setPlaybackState(0);
          setProgress(0);
        }}
      />
    </div>
  );
};
