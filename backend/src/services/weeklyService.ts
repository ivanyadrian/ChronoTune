import { WeeklyChallenge, Leaderboard, ActiveWeeklyRun } from "../db.js";
import type { Song } from "../types.js";
import { shuffle } from "../utils/shuffle.js";
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

export const ACTIVE_RUN_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

export function computeWeeklyElapsedMs(
  accumulatedMs: number,
  sessionStartTime?: number
): number {
  if (!sessionStartTime) return accumulatedMs;
  return accumulatedMs + Math.max(0, Date.now() - sessionStartTime);
}

export function computeWeeklyTimeInSeconds(
  accumulatedMs: number,
  sessionStartTime?: number
): number {
  return Math.floor(computeWeeklyElapsedMs(accumulatedMs, sessionStartTime) / 1000);
}

export interface StartWeeklyRunResult {
  success: boolean;
  runId?: string;
  sessionToken?: string;
  existingRun?: any;
  error?: string;
}

// Start or resume an active weekly run
export async function startWeeklyRun(
  username: string,
  fingerprint: string,
  clientRunId?: string | null
): Promise<StartWeeklyRunResult> {
  const trimmedName = username.trim();
  const currentWeekId = getWeekIdentifier();
  const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const caseInsensitiveRegex = new RegExp(`^${escapedName}$`, "i");

  const devFingerprint = process.env.DEVELOPER_FINGERPRINT || "DEVELOPER_BYPASS_FINGERPRINT";
  const isDeveloper = fingerprint && fingerprint === devFingerprint;

  // 1. Check: Has this NAME (always) or this FINGERPRINT (unless developer) already played this week?
  const leaderboardQuery = isDeveloper
    ? { weekIdentifier: currentWeekId, username: { $regex: caseInsensitiveRegex } }
    : {
      weekIdentifier: currentWeekId,
      $or: [
        { username: { $regex: caseInsensitiveRegex } },
        { fingerprint: fingerprint }
      ]
    };

  const alreadyPlayed = await Leaderboard.findOne(leaderboardQuery);

  if (alreadyPlayed) {
    const isSameName = alreadyPlayed.username.toLowerCase() === trimmedName.toLowerCase();
    return {
      success: false,
      error: isSameName
        ? "Ezzel a névvel már játszottak ezen a héten!"
        : "Te már részt vettél az e heti kihívásban!",
    };
  }

  const now = new Date();
  const periodStart = getChallengePeriodStart(now);
  const nextResetDate = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 2. Check: Is there an active run for this name (always) or fingerprint (unless developer)
  const activeRunQuery = isDeveloper
    ? { username: { $regex: caseInsensitiveRegex } }
    : {
      $or: [
        { username: { $regex: caseInsensitiveRegex } },
        { fingerprint: fingerprint }
      ]
    };

  const existingRun = await ActiveWeeklyRun.findOne(activeRunQuery);

  if (existingRun) {
    // Resumption criteria:
    // - clientRunId matches existingRun.runId
    // - OR (if not developer) the fingerprint matches existingRun.fingerprint
    const isOwner = (clientRunId && existingRun.runId === clientRunId) ||
      (!isDeveloper && existingRun.fingerprint === fingerprint);

    if (isOwner) {
      // Generate a FRESH session token every resumption — this immediately
      // invalidates any other tab that held the previous token.
      const sessionToken = crypto.randomUUID();
      existingRun.sessionToken = sessionToken;
      existingRun.expiresAt = nextResetDate;
      await existingRun.save();
      return { success: true, runId: existingRun.runId, sessionToken, existingRun };
    }

    const isSameName = existingRun.username.toLowerCase() === trimmedName.toLowerCase();
    return {
      success: false,
      error: isSameName
        ? "Ez a név jelenleg használatban van egy aktív heti kihívásban!"
        : "Ez a böngésző jelenleg használatban van egy aktív játékban!",
    };
  }

  // 3. Create and save new run
  const runId = crypto.randomUUID();
  const sessionToken = crypto.randomUUID();

  // Clean up any stale record with same username or fingerprint (if not developer)
  const deleteQuery = isDeveloper
    ? { username: { $regex: caseInsensitiveRegex } }
    : {
      $or: [
        { username: { $regex: caseInsensitiveRegex } },
        { fingerprint: fingerprint }
      ]
    };
  await ActiveWeeklyRun.deleteMany(deleteQuery);

  const newRun = new ActiveWeeklyRun({
    username: trimmedName,
    fingerprint,
    runId,
    sessionToken,
    startedAt: now,
    expiresAt: nextResetDate,
  });

  await newRun.save();
  return { success: true, runId, sessionToken, existingRun: newRun };
}


// Update game state within the active run
export async function updateWeeklyRunState(
  runId: string,
  state: {
    timeline?: Song[];
    personalDeck?: Song[];
    activeCard?: Song | null;
    mistakes?: number;
    correctPlacements?: number;
    attempts?: number;
  }
): Promise<void> {
  if (!runId) return;
  const now = new Date();
  const periodStart = getChallengePeriodStart(now);
  const nextResetDate = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const updateFields: any = { expiresAt: nextResetDate };

  if (state.timeline !== undefined) updateFields.timeline = state.timeline;
  if (state.personalDeck !== undefined) updateFields.personalDeck = state.personalDeck;
  if (state.activeCard !== undefined) updateFields.activeCard = state.activeCard;
  if (state.mistakes !== undefined) updateFields.mistakes = state.mistakes;
  if (state.correctPlacements !== undefined) updateFields.correctPlacements = state.correctPlacements;
  if (state.attempts !== undefined) updateFields.attempts = state.attempts;

  await ActiveWeeklyRun.updateOne({ runId }, { $set: updateFields });
}

// Pause timer and persist elapsed time when the player disconnects
export async function pauseWeeklyRun(
  runId: string,
  sessionStartTime: number,
  accumulatedMs: number = 0
): Promise<void> {
  if (!runId) return;
  const now = new Date();
  const totalElapsed = computeWeeklyElapsedMs(accumulatedMs, sessionStartTime);
  const periodStart = getChallengePeriodStart(now);
  const nextResetDate = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  await ActiveWeeklyRun.updateOne(
    { runId },
    { $set: { elapsedTimeMs: totalElapsed, expiresAt: nextResetDate } }
  );
}

// Remove an active run on completion or explicit abandon
export async function removeWeeklyRun(runId: string): Promise<void> {
  if (!runId) return;
  await ActiveWeeklyRun.deleteOne({ runId });
}



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get the current challenge period start (most recent Wednesday 12:00)
export function getChallengePeriodStart(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);

  const day = d.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
  const diffToWednesday = (day + 4) % 7;

  d.setDate(d.getDate() - diffToWednesday);

  // If the calculated Wednesday 12:00 is in the future relative to 'now',
  // it means we are in Wednesday morning, so the period started last Wednesday at 12:00
  if (d.getTime() > now.getTime()) {
    d.setDate(d.getDate() - 7);
  }

  return d;
}

// Format the period start date to a unique string like "2026-07-13-12-00"
export function getWeekIdentifier(now: Date = new Date()): string {
  const start = getChallengePeriodStart(now);
  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, "0");
  const day = String(start.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}-12-00`;
}

// Generate a weekly challenge deck of 20 songs with unique years
export function generateWeeklyChallengeDeck(songs: Song[], targetLength: number = 21): Song[] {
  const shuffled = shuffle([...songs]);
  const deck: Song[] = [];
  const usedYears = new Set<number>();

  for (const song of shuffled) {
    if (!usedYears.has(song.year)) {
      deck.push(song);
      usedYears.add(song.year);
    }
    if (deck.length === targetLength) break;
  }
  return deck;
}

// Read weekly_challenge_songs.json
function loadSongs(): Song[] {
  const songsPath = path.join(__dirname, "../data/weekly_challenge_songs.json");
  try {
    const rawData = fs.readFileSync(songsPath, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Hiba a weekly_challenge_songs.json beolvasása közben:", error);
    return [];
  }
}

// Perform check & reset if needed
export async function checkAndResetWeeklyChallenge(): Promise<void> {
  const now = new Date();
  const weekId = getWeekIdentifier(now);
  const periodStart = getChallengePeriodStart(now);
  const expiresAt = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  try {
    // Check if the challenge for the current period already exists
    const existing = await WeeklyChallenge.findOne({ weekIdentifier: weekId });

    if (!existing) {
      console.log(`[WeeklyChallenge] Új időszak kezdődik! Új heti kihívás generálása: ${weekId}`);

      // Wipe old weekly challenges, leaderboards, and active weekly runs to keep DB clean
      await WeeklyChallenge.deleteMany({});
      await Leaderboard.deleteMany({});
      await ActiveWeeklyRun.deleteMany({});


      const songs = loadSongs();
      if (songs.length === 0) {
        console.error("Nem sikerült dalokat betölteni a heti kihíváshoz!");
        return;
      }

      const weeklyDeck = generateWeeklyChallengeDeck(songs, 21);

      const challenge = new WeeklyChallenge({
        weekIdentifier: weekId,
        songs: weeklyDeck,
        expiresAt,
      });

      await challenge.save();
      console.log("[WeeklyChallenge] Új heti kihívás sikeresen mentve!");
    } else {
      console.log(`[WeeklyChallenge] A heti kihívás már létezik ehhez az időszakhoz: ${weekId}`);
    }
  } catch (error) {
    console.error("Hiba a heti kihívás ellenőrzése/resetelése során:", error);
  }
}

// Setup the Scheduler
export function initWeeklyScheduler(): void {
  // node-cron syntax for every Wednesday at 12:00:
  // Minute(0) Hour(12) DayOfMonth(*) Month(*) DayOfWeek(3)
  cron.schedule("0 12 * * 3", async () => {
    console.log("[WeeklyScheduler] Heti reset ütemezett futása (Szerda 12:00)");
    await checkAndResetWeeklyChallenge();
  });
  console.log("[WeeklyScheduler] Heti kihívás ütemező inicializálva.");
}
