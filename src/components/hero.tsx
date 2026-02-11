"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useImages } from "@/hooks/use-images"
import { useTranslation } from "@/contexts/language-context"

const FALLBACK_IMAGE = "/hero-bg.jpg"

export function Hero() {
  const { images } = useImages("hero")
  const heroImage = images[0]?.url || FALLBACK_IMAGE
  const { t } = useTranslation()

  const scrollToContact = () => {
    const element = document.getElementById("contact")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/65" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tighter text-balance text-white">
            {t.hero.titleLine1}
            <span className="block text-gray-400">{t.hero.titleLine2}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto text-pretty leading-relaxed">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-base px-8"
              onClick={scrollToContact}
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-base px-8 bg-transparent"
              onClick={() => {
                const element = document.getElementById("plans")
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" })
                }
              }}
            >
              {t.hero.ctaSecondary}
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white rounded-full" />
        </div>
      </div>
    </section>
  )
}
