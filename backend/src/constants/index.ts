// src/constants/index.ts

/**
 * ═══════════════════════════════════════════════════════
 *  CONSTANTS - GAME SETTINGS
 * ═══════════════════════════════════════════════════════
 */

/**
 * SCORING SYSTEM
 */
export const SCORES = {
  CORRECT_PLACE: 100,
  MISTAKE_PENALTY: -15,
  DISCARD_PENALTY: -20,

  BASE_BONUS: 50,
  BONUS_INCREMENT: 20,
  STREAK_THRESHOLD: 3,
  EXTRA_PENALTY_BASE: 5,
  EXTRA_PENALTY_MULTIPLIER: 5,

  PERFECT_GAME_BONUS: 500,
  GAME_OVER_DELAY_MS: 3500,
} as const;

/**
 * PLAYBACK STATES
 */
export const PLAYBACK_STATE = {
  STOPPED: -1,
  PAUSED: 0,
  PLAYING: 1,
} as const;

/**
 * ERROR CODES
 */
export const ERROR_CODES = {
  NOT_YOUR_TURN: "NOT_YOUR_TURN",
  NO_ACTIVE_CARD: "NO_ACTIVE_CARD",
  ALREADY_HAS_ACTIVE_CARD: "ALREADY_HAS_ACTIVE_CARD",
  INVALID_INDEX: "INVALID_INDEX",
  CARD_NOT_FOUND: "CARD_NOT_FOUND",
  GAME_NOT_STARTED: "GAME_NOT_STARTED",
  ROOM_NOT_FOUND: "ROOM_NOT_FOUND",
  SERVER_ERROR: "SERVER_ERROR",
  NO_MORE_CARDS: "NO_MORE_CARDS",
  ACTION_IN_PROGRESS: "ACTION_IN_PROGRESS",
} as const;

export type ScoreKeys = keyof typeof SCORES;
export type ErrorCodeKeys = keyof typeof ERROR_CODES;
export type PlaybackStateKeys = keyof typeof PLAYBACK_STATE;