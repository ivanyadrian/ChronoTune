export const MISTAKE_MODES = [
  {
    id: "hardcore",
    value: 1,
    label: "HARDCORE",
    desc: "Egyetlen hiba, és a játék azonnal véget ér.",
    colorClass: "text-red-500",
    fillClass: "fill-red-500",
    borderClass: "border-red-500/50",
    badgeClass: "bg-red-500/20 border-red-500/30 text-red-400",
    activeGlow: "rgba(239,68,68,0.2)",
    glowBg: "bg-red-500/10",
    activeBg: "bg-red-500/10 ring-red-500/20",
  },
  {
    id: "normal",
    value: 3,
    label: "NORMAL",
    desc: "A 3. hiba után a játék véget ér!",
    colorClass: "text-orange-500",
    fillClass: "fill-orange-500",
    borderClass: "border-orange-500/50",
    badgeClass: "bg-orange-500/20 border-orange-500/30 text-orange-400",
    activeGlow: "rgba(249,115,22,0.2)",
    glowBg: "bg-orange-500/10",
    activeBg: "bg-orange-500/10 ring-orange-500/20",
  },
  {
    id: "easy",
    value: 5,
    label: "EASY",
    desc: "Az 5. hiba után a játék véget ér!",
    colorClass: "text-green-500",
    fillClass: "fill-green-500",
    borderClass: "border-green-500/50",
    badgeClass: "bg-green-500/20 border-green-500/30 text-green-400",
    activeGlow: "rgba(16,185,129,0.2)",
    glowBg: "bg-green-500/10",
    activeBg: "bg-green-500/10 ring-green-500/20",
  },
  {
    id: "relaxed",
    value: null,
    label: "RELAXED",
    desc: "Nincs hibakorlát!",
    colorClass: "text-blue-300",
    fillClass: "fill-blue-300",
    borderClass: "border-blue-300/50",
    badgeClass: "bg-blue-300/20 border-blue-300/30 text-blue-200",
    activeGlow: "rgba(147,197,253,0.2)",
    glowBg: "bg-blue-300/10",
    activeBg: "bg-blue-300/10 ring-blue-300/20",
  },
] as const;

// Extract the type of a single element from the array
export type MistakeMode = typeof MISTAKE_MODES[number];

// Keep the existing type if needed elsewhere (e.g. in database or state)
export type MistakeModeValue = MistakeMode["value"];