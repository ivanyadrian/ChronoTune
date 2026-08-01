/**
 * Centralized API configuration and URL resolution.
 */
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Returns a full API endpoint URL for the given path.
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};
