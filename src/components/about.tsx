import { Award, Target, TrendingUp } from "lucide-react"
import { useImages } from "@/hooks/use-images"
import { useTranslation } from "@/contexts/language-context"

const FALLBACK_IMAGE = "/about-photo.jpg"

export function About() {
  const { images, loading } = useImages("about")
  const { t } = useTranslation()

  // Usa la primera imagen del backend, o fallback a imagen local
  const aboutImage = images[0]?.url || FALLBACK_IMAGE

  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 xl:gap-20 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-4 translate-y-4" />
            <img
              src={aboutImage}
              alt={images[0]?.alt || "Entrenador Personal de Elite"}
              className="relative w-full h-auto grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>

          <div className="space-y-6">
            <div className="inline-block">
              <span className="text-xs font-bold tracking-widest text-black uppercase border border-black/30 px-3 py-1">{t.about.badge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-black">
              {t.about.titleLine1}
              <span className="block text-gray-500">{t.about.titleLine2}</span>
            </h2>

            <p className="text-gray-600 leading-relaxed text-pretty">
              {t.about.paragraph1}
            </p>

            <p className="text-gray-600 leading-relaxed text-pretty">
              {t.about.paragraph2}
            </p>

            <p className="text-gray-600 leading-relaxed text-pretty">
              {t.about.paragraph3}
            </p>

            <p className="text-gray-600 leading-relaxed text-pretty">
              {t.about.paragraph4}
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-black">{t.about.statsYears}</p>
                <p className="text-sm text-gray-500">{t.about.statsYearsLabel}</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-black">{t.about.statsClients}</p>
                <p className="text-sm text-gray-500">{t.about.statsClientsLabel}</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-black">{t.about.statsSuccess}</p>
                <p className="text-sm text-gray-500">{t.about.statsSuccessLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
