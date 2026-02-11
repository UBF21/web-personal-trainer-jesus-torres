import { CheckCircle2 } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"

export function Credentials() {
  const { t } = useTranslation()

  return (
    <section id="credentials" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-black uppercase border border-black/30 px-3 py-1">{t.credentials.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-black">
            {t.credentials.titleLine1}
            <span className="block text-gray-500">{t.credentials.titleLine2}</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-black text-center">{t.credentials.subtitle}</h3>
            <div className="space-y-4">
              {t.credentials.certifications.map((cert, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
