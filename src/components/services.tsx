import { Brain, Dumbbell, Heart, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

const services = [
  {
    icon: Dumbbell,
    title: "Entrenamiento de Fuerza Elite",
    description:
      "Programas personalizados de fuerza y acondicionamiento diseñados para desarrollar potencia explosiva, movimiento funcional y dominio atlético.",
  },
  {
    icon: Brain,
    title: "Rendimiento Mental",
    description:
      "Entrenamiento cognitivo y coaching de mentalidad para desarrollar la resiliencia mental y el enfoque que separa a los campeones de los competidores.",
  },
  {
    icon: Heart,
    title: "Optimización Metabólica",
    description:
      "Planificación nutricional avanzada y pruebas metabólicas para optimizar la composición corporal, los niveles de energía y los marcadores de salud.",
  },
  {
    icon: Zap,
    title: "Máximo Rendimiento",
    description:
      "Protocolos de recuperación integrados, trabajo de movilidad y optimización del estilo de vida para mantener el máximo rendimiento y prevenir lesiones.",
  },
]

export function Services() {
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Servicios</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Un Enfoque Integral en
            <span className="block text-primary">Jesus Torres Training</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Cada aspecto de tu entrenamiento está meticulosamente diseñado para ofrecer resultados medibles y
            excelencia sostenible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 p-8 group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
