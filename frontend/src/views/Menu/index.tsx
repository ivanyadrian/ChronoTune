import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { NameStep } from "./steps/NameStep";
import { ModeChoiceStep } from "./steps/ModeChoiceStep";
import { SoloConfigStep } from "./steps/SoloConfigStep";
import { MultiplayerConfigStep } from "./steps/MultiplayerConfigStep";

interface MenuViewProps {
  userName: string;
  setUserName: Dispatch<SetStateAction<string>>;
  handleCreateRoom: (isSolo?: boolean) => void;
  handleJoinRoom: () => void;
  inputCode: string;
  setInputCode: Dispatch<SetStateAction<string>>;
  error: string;
  targetLength: number;
  setTargetLength: (val: number) => void;
  isConnected: boolean;
  selectedMaxMistakes: number | null | undefined;
  setSelectedMaxMistakes: Dispatch<SetStateAction<number | null | undefined>>;
  step: "name" | "choice" | "solo" | "multi";
  setStep: Dispatch<SetStateAction<"name" | "choice" | "solo" | "multi">>;
}

export const MenuView = ({
  userName,
  setUserName,
  handleCreateRoom,
  handleJoinRoom,
  setInputCode,
  error,
  targetLength,
  setTargetLength,
  isConnected,
  selectedMaxMistakes,
  setSelectedMaxMistakes,
  step,
  setStep,
  inputCode,
}: MenuViewProps) => {
  // Preload images
  useEffect(() => {
    const imagesToPreload = [
      "/img/singleplayer_cover.jpg",
      "/img/multiplayer_cover.jpg",
    ];
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto sm:p-4 space-y-8 px-2">
      {step === "name" && (
        <NameStep
          userName={userName}
          setUserName={setUserName}
          onNext={() => setStep("choice")}
        />
      )}

      {step === "choice" && (
        <ModeChoiceStep
          isConnected={isConnected}
          onSelectSolo={() => setStep("solo")}
          onSelectMulti={() => setStep("multi")}
          onBack={() => setStep("name")}
        />
      )}

      {step === "solo" && (
        <SoloConfigStep
          userName={userName}
          targetLength={targetLength}
          setTargetLength={setTargetLength}
          selectedMaxMistakes={selectedMaxMistakes}
          setSelectedMaxMistakes={setSelectedMaxMistakes}
          onStart={() => handleCreateRoom(true)}
          onBack={() => setStep("choice")}
        />
      )}

      {step === "multi" && (
        <MultiplayerConfigStep
          // userName={userName}
          // targetLength={targetLength}
          // setTargetLength={setTargetLength}
          // selectedMaxMistakes={selectedMaxMistakes}
          // setSelectedMaxMistakes={setSelectedMaxMistakes}
          onCreateRoom={() => handleCreateRoom(false)}
          inputCode={inputCode}
          setInputCode={setInputCode}
          onJoinRoom={(code) => {
            setInputCode(code);
            handleJoinRoom();
          }}
          onBack={() => setStep("choice")}
        />
      )}

      {error && (
        <div className="relative overflow-hidden p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-center text-sm animate-in fade-in slide-in-from-top-2">
          {error}
          <div className="absolute bottom-0 left-0 h-0.5 bg-red-500 animate-[shrink-width_3s_linear_forwards]" />
        </div>
      )}
    </div>
  );
};
