import { Brain, Dumbbell, Heart, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useTranslation } from "@/contexts/language-context"

const icons = [Dumbbell, Brain, Heart, Zap]

export function Services() {
  const { t } = useTranslation()

  const services = t.services.items.map((item, i) => ({
    icon: icons[i],
    ...item,
  }))

  return (
    <section id="services" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-white uppercase border border-white/30 px-3 py-1">{t.services.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-white">
            {t.services.titleLine1}
            <span className="block text-gray-400">{t.services.titleLine2}</span>
          </h2>
          <p className="text-gray-400 leading-relaxed text-pretty">
            {t.services.description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="bg-gray-900 border-gray-800 hover:border-white/50 transition-all duration-300 p-5 sm:p-6 lg:p-8 group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-white flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <service.icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
