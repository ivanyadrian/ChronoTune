import { Router } from "express";
import { Leaderboard, ActiveWeeklyRun } from "../db.js";
import {
  getWeekIdentifier,
  getChallengePeriodStart,
  startWeeklyRun,
  removeWeeklyRun,
} from "../services/weeklyService.js";

const router = Router();

// Get current challenge info
router.get("/info", async (req, res) => {
  try {
    const now = new Date();
    const currentWeekId = getWeekIdentifier(now);
    const periodStart = getChallengePeriodStart(now);
    const expiresAt = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    res.json({
      weekIdentifier: currentWeekId,
      expiresAt: expiresAt.toISOString(),
      nextResetInMs: expiresAt.getTime() - now.getTime(),
    });
  } catch (error) {
    console.error("Hiba a heti kihívás infó lekérése közben:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// Get current weekly leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const now = new Date();
    const currentWeekId = getWeekIdentifier(now);

    const entries = await Leaderboard.find({ weekIdentifier: currentWeekId })
      .sort({ correctPlacements: -1, timeInSeconds: 1 });

    res.json(entries);
  } catch (error) {
    console.error("Hiba a ranglista lekérése közben:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// Check if a fingerprint has an active run or has already played for this week
router.get("/status", async (req, res) => {
  try {
    const fingerprint = req.query.fingerprint as string | undefined;
    const username = req.query.username as string | undefined;
    if (!fingerprint) {
      return res.status(400).json({ error: "fingerprint param required" });
    }

    const devFingerprint = process.env.DEVELOPER_FINGERPRINT || "DEVELOPER_BYPASS_FINGERPRINT";
    const isDeveloper = fingerprint && fingerprint === devFingerprint;

    const activeRun = await ActiveWeeklyRun.findOne({ fingerprint }).lean() as any;

    const currentWeekId = getWeekIdentifier(new Date());

    let hasPlayed = false;
    if (!isDeveloper) {
      const leaderboardEntry = await Leaderboard.findOne({
        weekIdentifier: currentWeekId,
        fingerprint,
      }).lean();

      if (leaderboardEntry) {
        hasPlayed = true;
      }
    }

    if (!hasPlayed && username && typeof username === "string" && username.trim()) {
      const escapedName = username.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const caseInsensitiveRegex = new RegExp(`^${escapedName}$`, "i");
      const entryByName = await Leaderboard.findOne({
        weekIdentifier: currentWeekId,
        username: { $regex: caseInsensitiveRegex },
      }).lean();

      if (entryByName) {
        hasPlayed = true;
      }
    }

    return res.json({
      hasActiveRun: !!activeRun,
      runId: activeRun?.runId,
      username: activeRun?.username,
      hasPlayed,
    });
  } catch (error) {
    console.error("Hiba a weekly status lekérése közben:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// Start weekly challenge (Checks availability & registers active run lock)
router.post("/start", async (req, res) => {
  try {
    const { username, fingerprint, runId } = req.body;
    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return res.status(400).json({ error: "Érvénytelen felhasználónév!" });
    }

    const result = await startWeeklyRun(username, fingerprint || "", runId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, runId: result.runId });
  } catch (error) {
    console.error("Hiba a heti kihívás indításakor:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// Explicitly finish / remove active weekly run lock
router.post("/finish", async (req, res) => {
  try {
    const { runId } = req.body;
    if (runId && typeof runId === "string") {
      await removeWeeklyRun(runId);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Hiba a futás törlése során:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

// Submit score to the weekly leaderboard
router.post("/submit", async (req, res) => {
  try {
    const { username, fingerprint, mistakes, correctPlacements, timeInSeconds, weekIdentifier, runId } = req.body;

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return res.status(400).json({ error: "Érvénytelen felhasználónév!" });
    }
    if (typeof mistakes !== "number" || mistakes < 0) {
      return res.status(400).json({ error: "Érvénytelen hibaszám!" });
    }
    if (typeof timeInSeconds !== "number" || timeInSeconds < 0) {
      return res.status(400).json({ error: "Érvénytelen időtartam!" });
    }

    const now = new Date();
    const currentWeekId = getWeekIdentifier(now);

    if (weekIdentifier !== currentWeekId) {
      return res.status(400).json({ error: "Ez a kihívási időszak már lejárt!" });
    }

    const entry = new Leaderboard({
      username: username.trim().substring(0, 15),
      fingerprint: fingerprint || "",
      mistakes,
      correctPlacements: typeof correctPlacements === "number" ? correctPlacements : Math.max(0, 20 - mistakes),
      timeInSeconds,
      weekIdentifier: currentWeekId,
    });

    await entry.save();

    // Clean up active weekly run record upon submission
    if (runId && typeof runId === "string") {
      await removeWeeklyRun(runId);
    }
    
    res.status(201).json({ success: true, entry });
  } catch (error) {
    console.error("Hiba az eredmény beküldése során:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
});

export default router;
