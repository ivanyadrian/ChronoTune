import mongoose from "mongoose";
// Connection function
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Hiba: A MONGODB_URI környezeti változó nincs beállítva a .env fájlban!");
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("Sikeresen csatlakozva a MongoDB Atlas-hoz!");
  } catch (error) {
    console.error("MongoDB kapcsolódási hiba:", error);
    process.exit(1);
  }
}
// Song Schema
const SongSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  deezerId: { type: String, required: true },
  title: { type: String, required: true },
  artist: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  day: { type: Number, required: true },
  fullDate: { type: String, required: true },
  cover: { type: String, required: true },
});
// Weekly Challenge Schema (Stores the selected 20 songs for the week)
const WeeklyChallengeSchema = new mongoose.Schema({
  weekIdentifier: { type: String, required: true, unique: true }, // e.g. "2026-W29"
  songs: [SongSchema],
  expiresAt: { type: Date, required: true },
});
// Leaderboard Schema (Stores entries for the current week)
const LeaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  fingerprint: { type: String, required: true, index: true },
  mistakes: { type: Number, required: true },
  correctPlacements: { type: Number, required: true, default: 0 },
  timeInSeconds: { type: Number, required: true },
  weekIdentifier: { type: String, required: true }, // Links to the weekly challenge
  createdAt: { type: Date, default: Date.now },
});
// Create index to sort efficiently by mistakes (asc) and then timeInSeconds (asc)
LeaderboardSchema.index({ weekIdentifier: 1, correctPlacements: -1, timeInSeconds: 1 });
export const WeeklyChallenge = mongoose.model("WeeklyChallenge", WeeklyChallengeSchema);
export const Leaderboard = mongoose.model("Leaderboard", LeaderboardSchema);
// Active Weekly Run Schema (Tracks ongoing weekly runs)
const ActiveWeeklyRunSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, index: true },
  fingerprint: { type: String, required: true, index: true },
  runId: { type: String, required: true, unique: true },
  // sessionToken: Every time a run is resumed (even from a 2nd tab), a new token is
  // generated and stored here. The Room object keeps the token issued at start-time.
  // On game-over, we compare the room's token against the DB — if they differ, a newer
  // session has taken over and this one must NOT write to the leaderboard.
  sessionToken: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  timeline: [SongSchema],
  personalDeck: [SongSchema],
  activeCard: SongSchema,
  mistakes: { type: Number, default: 0 },
  correctPlacements: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  elapsedTimeMs: { type: Number, default: 0 },
});
export const ActiveWeeklyRun = mongoose.model("ActiveWeeklyRun", ActiveWeeklyRunSchema);