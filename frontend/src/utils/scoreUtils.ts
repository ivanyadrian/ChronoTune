/**
 * Returns Tailwind CSS background and text color classes based on correct placements (score).
 */
export const getScoreColor = (correctPlacements: number): string => {
  if (correctPlacements <= 7) {
    return "bg-red-500/10 text-red-400";
  }
  if (correctPlacements <= 11) {
    return "bg-orange-500/10 text-orange-400";
  }
  if (correctPlacements <= 15) {
    return "bg-yellow-500/10 text-yellow-400";
  }
  if (correctPlacements <= 18) {
    return "bg-green-500/10 text-green-400";
  }
  return "bg-emerald-500/10 text-emerald-400";
};

/**
 * Returns text color Tailwind class based on mistake ratio (0.0 to 1.0).
 */
export const getMistakeColor = (mistakePercent: number): string => {
  if (mistakePercent >= 0.8) {
    return "text-red-400";
  }
  if (mistakePercent >= 0.5) {
    return "text-yellow-300";
  }
  return "text-green-400";
};

