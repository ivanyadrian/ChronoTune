export interface Song {
  id: number;
  deezerId: string;
  title: string;
  artist: string;
  year: number;
  month: number;
  day: number;
  fullDate: string;
  cover: string;
  isStartCard?: boolean;
}

export interface Player {
  id: string;
  name: string;
  timeline: Song[];
  mistakes: number;
  correctPlacements: number;
  attempts: number;
  personalDeck: Song[];
  score: number;
  winStreak: number;
  loseStreak: number;
  pendingIndex: number | null;
}

export interface Room {
  players: Player[];
  targetLength: number;
  deck: Song[];
  gameStarted: boolean;
  turnIndex: number;
  turnLocked: boolean;
  maxMistakes: number | null;
  syncMusic: boolean;
  songLibrary: "hu" | "en";
  activeCard?: Song;
  playbackState: number;
  currentPlayingDeezerId: string | null;
  isWeekly?: boolean;
  weeklyElapsedMs?: number;
  sessionStartTime?: number;
  weekIdentifier?: string;
  weeklyRunId?: string;
  fingerprint?: string;
  weeklySessionToken?: string;
}
