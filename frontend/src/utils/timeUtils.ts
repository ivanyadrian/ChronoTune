/**
 * Utility functions for formatting time, durations, and countdown timers.
 */

/**
 * Formats a duration in seconds to "M:SS" (or "MM:SS" if padMinutes is true).
 */
export const formatDuration = (seconds: number, padMinutes: boolean = false): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedMins = padMinutes ? String(mins).padStart(2, "0") : String(mins);
  const formattedSecs = String(secs).padStart(2, "0");
  return `${formattedMins}:${formattedSecs}`;
};

/**
 * Formats remaining milliseconds into a human-readable countdown string (e.g. "2d 4h 15m 30s").
 */
export const formatTimeLeft = (ms: number | null): string => {
  if (ms === null) return "--:--:--";
  if (ms <= 0) return "Resetelés folyamatban...";

  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  return `${days}d ${hours % 24}h ${mins % 60}m ${secs % 60}s`;
};
