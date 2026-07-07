//Fisher-Yates shuffle
export function shuffle<T>(array: T[]): T[] {
  // If empty or has only 1 element, nothing to shuffle
  if (array.length <= 1) return [...array];
  
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}