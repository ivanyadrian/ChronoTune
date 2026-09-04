export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  month: number;
  day: number;
  fullDate: string;
  deezerId: string;
  cover: string;
  isStartCard?: boolean;
}

export interface Player {
  id: string;
  name: string;
  timeline: Song[];
  mistakes: number;
  isHost: boolean;
  attempts: number;
  pendingIndex?: number | null;
  personalDeck?: Song[];
  score: number;
  winStreak: number;
  loseStreak: number;
  failedCardIds: number[];
}

export interface Room {
  players: Player[];
  deck: Song[];
  gameStarted: boolean;
  turnIndex: number;
  turnLocked: boolean;
  activeCard?: Song;
  targetLength: number;
  maxMistakes: number | null;
}

export interface PlacementResultData {
  success: boolean;
  playerName: string;
  activePlayerId: string;
  cardYear: number;
  cardMonth: number;
  cardDay: number;
  fullDate: string;
  players: Player[];
  pointsEarned: number;
  bonusPoints: number;
  isLastRoundImminent: boolean;
  isGameOver: boolean;
}

export interface GameStartedData {
  players: Player[];
  currentTurn: string;
  roomCode: string;
  maxMistakes: number | null;
  targetLength?: number;
  isSolo: boolean;
  isWeekly?: boolean;
  weekIdentifier?: string;
  runId?: string;
  weeklyElapsedMs?: number;
}

export interface RoomConfigData {
  targetLength: number;
  maxMistakes: number | null;
  syncMusic: boolean;
  songLibrary?: "hu" | "en";
}

export * from "./game";
