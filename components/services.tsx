import { Brain, Dumbbell, Heart, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

const services = [
  {
    icon: Dumbbell,
    title: "Elite Strength Training",
    description:
      "Customized strength and conditioning programs designed to build explosive power, functional movement, and athletic dominance.",
  },
  {
    icon: Brain,
    title: "Mental Performance",
    description:
      "Cognitive training and mindset coaching to develop the mental resilience and focus that separates champions from competitors.",
  },
  {
    icon: Heart,
    title: "Metabolic Optimization",
    description:
      "Advanced nutrition planning and metabolic testing to optimize body composition, energy levels, and overall health markers.",
  },
  {
    icon: Zap,
    title: "Peak Performance",
    description:
      "Integrated recovery protocols, mobility work, and lifestyle optimization to maintain peak performance and prevent injuries.",
  },
]

export function Services() {
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Services</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            A Holistic Approach to
            <span className="block text-primary">Elite Performance</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Every aspect of your training is meticulously crafted to deliver measurable results and sustainable
            excellence.
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
