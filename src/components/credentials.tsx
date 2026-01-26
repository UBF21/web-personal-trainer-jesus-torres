import { CheckCircle2 } from "lucide-react"

const certifications = [
  "Certified Strength & Conditioning Specialist (CSCS)",
  "National Academy of Sports Medicine (NASM) Master Trainer",
  "Precision Nutrition Level 2 Certified",
  "USA Weightlifting Sports Performance Coach",
  "Functional Movement Systems (FMS) Certified",
  "PhD in Exercise Physiology",
]

const partnerships = [
  {
    name: "Nike",
    logo: "/nike-logo-white.jpg",
  },
  {
    name: "Under Armour",
    logo: "/under-armour-logo-white.jpg",
  },
  {
    name: "Gatorade",
    logo: "/gatorade-logo-white.jpg",
  },
  {
    name: "Reebok",
    logo: "/reebok-logo-white.jpg",
  },
]

export function Credentials() {
  return (
    <section id="credentials" className="py-24 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Credenciales</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Experiencia en la que Puedes
            <span className="block text-primary">Confiar</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-6xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Certificaciones y Educación</h3>
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
            <h3 className="text-2xl font-bold">Colaboraciones con Marcas</h3>
            <p className="text-muted-foreground leading-relaxed">
              Respaldado por las marcas líderes mundiales en atletismo y bienestar para desarrollar programas de
              entrenamiento de élite y representar la excelencia en coaching de rendimiento.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              {partnerships.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-6 bg-muted/30 hover:bg-muted/50 transition-colors grayscale hover:grayscale-0"
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
