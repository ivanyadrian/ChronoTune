/**
 * Type-safe localStorage accessors and keys.
 */

export const STORAGE_KEYS = {
  WEEKLY_RUN_ID: "chrono_weekly_runId",
  VOLUME: "chronotune-volume",
  TUTORIAL_NAME: "chronotune_tutorial_name",
  TUTORIAL_SOLO: "chronotune_tutorial_solo",
  TUTORIAL_MULTI: "chronotune_tutorial_multi",
  TUTORIAL_WEEKLY: "chronotune_tutorial_weekly",
} as const;

export const getStoredWeeklyRunId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.WEEKLY_RUN_ID);
};

export const setStoredWeeklyRunId = (runId: string): void => {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_RUN_ID, runId);
};

export const removeStoredWeeklyRunId = (): void => {
  localStorage.removeItem(STORAGE_KEYS.WEEKLY_RUN_ID);
};

export const getStoredVolume = (defaultVolume: number = 100): number => {
  const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
  if (savedVolume !== null) {
    const parsed = Number(savedVolume);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      return parsed;
    }
  }
  return defaultVolume;
};

export const setStoredVolume = (volume: number): void => {
  localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
};

export const isTutorialHidden = (key: string): boolean => {
  return localStorage.getItem(key) === "true";
};

export const setTutorialHidden = (key: string, hidden: boolean): void => {
  if (hidden) {
    localStorage.setItem(key, "true");
  } else {
    localStorage.removeItem(key);
  }
};

