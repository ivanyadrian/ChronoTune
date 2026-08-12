import hu from "./hu";
import en from "./en";

export type Language = "hu" | "en";
export type Translations = typeof hu;

const translations: Record<Language, Translations> = { hu, en };

// Returns the initial language:
// 1. If saved in localStorage → use that
// 2. Otherwise → check browser language
export function getInitialLanguage(): Language {
  const saved = localStorage.getItem("chronotune-language");
  if (saved === "hu" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("hu") ? "hu" : "en";
}

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export { hu, en };
