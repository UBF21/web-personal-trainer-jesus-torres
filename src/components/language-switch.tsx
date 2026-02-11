import { useTranslation } from "@/contexts/language-context"

export function LanguageSwitch() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => setLanguage("es")}
        className={`px-2 py-1 transition-colors ${
          language === "es" ? "text-white" : "text-white/40 hover:text-white/70"
        }`}
      >
        ES
      </button>
      <span className="text-white/30">|</span>
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 transition-colors ${
          language === "en" ? "text-white" : "text-white/40 hover:text-white/70"
        }`}
      >
        EN
      </button>
    </div>
  )
}
