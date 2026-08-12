import { useLanguage } from "../context/LanguageContext";

export const LanguageSwitcher = () => {
  const { lang, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
      <button
        onClick={() => setLanguage("hu")}
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
          lang === "hu"
            ? "bg-primary text-white shadow-[0_0_10px] shadow-primary/40"
            : "text-white/40 hover:text-white"
        }`}
      >
        HU
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
          lang === "en"
            ? "bg-primary text-white shadow-[0_0_10px] shadow-primary/40"
            : "text-white/40 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
};
