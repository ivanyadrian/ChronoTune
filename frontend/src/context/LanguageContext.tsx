import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { getInitialLanguage, getTranslations } from "../i18n";
import type { Language, Translations } from "../i18n";

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(getInitialLanguage);

  const setLanguage = (newLang: Language) => {
    localStorage.setItem("chronotune-language", newLang);
    setLang(newLang);
  };

  const t = getTranslations(lang);

  return (
    <LanguageContext.Provider value={{ lang, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook – ezt hívod majd minden komponensben
export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
