/**
 * Leaderboard and ranking utility functions.
 */

export interface ScoredPlayer {
  score: number;
}

/**
 * Calculates a player's 1-indexed rank based on sorted player list, handling ties (identical scores get identical rank).
 */
export const getPlayerRank = (index: number, sortedPlayers: ScoredPlayer[]): number => {
  for (let i = 0; i < index; i++) {
    if (sortedPlayers[i].score === sortedPlayers[index].score) {
      return i + 1;
    }
  }
  return index + 1;
};
