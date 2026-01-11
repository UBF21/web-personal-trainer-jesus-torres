"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
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
          backgroundImage: `url(/placeholder.svg?height=1080&width=1920&query=professional+athlete+elite+fitness+training+luxury+gym+motivational)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/65" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-primary uppercase border border-primary/40 px-4 py-2">
              Entrenamiento de Rendimiento Elite
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-balance text-white">
            Transforma Tu
            <span className="block text-primary">Rendimiento</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto text-pretty leading-relaxed">
            Entrenamiento personal exclusivo para emprendedores y atletas profesionales que exigen excelencia. Eleva tu
            cuerpo, agudiza tu mente, domina tu campo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8"
              onClick={scrollToContact}
            >
              COMIENZA TU JORNADA
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
              VER PLANES
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  )
}
