import { CheckCircle2 } from "lucide-react"

const certifications = [
  "EREPS Fitness Instructor - EQF Level 3 (EuropeActive)",
  "Personal Trainer EQF4 - FiveStars International Graduate School (460h)",
  "Fitness Instructor EQF3 - FiveStars International Graduate School (200h)",
  "Especialista en Nutrición Deportiva, Suplementación y Ayudas Ergogénicas (150h)",
]

const partnerships = [
  {
    name: "Feast Fit",
    logo: "/feastfit-logo.svg",
  },
  {
    name: "Exclusive Life Magazine",
    logo: "/elm-logo.svg",
  },
  {
    name: "Raph-Corp",
    logo: "/isotipo-solido-alt.png",
  },
  {
    name: "Zumub",
    logo: "/zumub-logo.png",
  },
]

export function Credentials() {
  return (
    <section id="credentials" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Credenciales</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Experiencia en la que Puedes
            <span className="block text-primary">Confiar</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 xl:gap-20 items-start max-w-6xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold">Certificaciones y Educación</h3>
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold">Colaboraciones con Marcas</h3>
            <p className="text-muted-foreground leading-relaxed">
              Respaldado por las marcas líderes mundiales en atletismo y bienestar para desarrollar programas de
              entrenamiento de élite y representar la excelencia en coaching de rendimiento.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 pt-4">
              {partnerships.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-4 sm:p-5 lg:p-6 bg-muted/30 hover:bg-muted/50 transition-colors grayscale hover:grayscale-0"
                >
                  <img
                    src={partner.logo || "/placeholder.svg"}
                    alt={partner.name}
                    className="w-full h-auto max-h-12 object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
