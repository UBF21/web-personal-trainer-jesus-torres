"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const plans = [
  {
    name: "Fundamentos",
    price: 100,
    duration: "1 Mes",
    description: "Comienza tu transformación",
    features: [
      "Evaluación personalizada",
      "Programa de entrenamiento personalizado",
      "Guías de nutrición",
      "Seguimiento semanal del progreso",
      "Soporte por correo electrónico",
    ],
    popular: false,
  },
  {
    name: "Transformación Elite",
    price: 500,
    duration: "6 Meses",
    description: "Transformación completa del cuerpo y la mente",
    features: [
      "Todo en Fundamentos",
      "Consultas de video quincenales",
      "Pruebas metabólicas avanzadas",
      "Entrenamiento de rendimiento mental",
      "Protocolos de recuperación",
      "Soporte prioritario",
    ],
    popular: true,
  },
  {
    name: "Campeonato",
    price: 900,
    duration: "12 Meses",
    description: "El programa de rendimiento definitivo",
    features: [
      "Todo en Transformación Elite",
      "Sesiones semanales 1 a 1",
      "Protocolo personalizado de suplementos",
      "Preparación para la competencia",
      "Optimización del estilo de vida",
      "Acceso directo 24/7",
      "Invitación al retiro exclusivo",
    ],
    popular: false,
  },
]

export function TrainingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName)
    setTimeout(() => {
      const element = document.getElementById("contact")
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  return (
    <section id="plans" className="py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Planes de Entrenamiento</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Elige Tu Camino Hacia
            <span className="block text-primary">La Grandeza</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Selecciona el programa que se alinee con tus ambiciones. Todos los planes incluyen acceso de por vida a
            recursos exclusivos y comunidad.
          </p>
        </div>

        <div className="flex justify-center mb-8 sm:mb-10 md:mb-12">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "cards" | "table")} className="w-auto">
            <TabsList className="bg-card border border-border">
              <TabsTrigger
                value="cards"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Vista de Tarjetas
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Comparar Planes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {viewMode === "cards" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative bg-card border-border p-5 sm:p-6 lg:p-8 flex flex-col ${
                  plan.popular ? "lg:scale-105 border-2 border-primary shadow-2xl" : "border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 uppercase tracking-wider">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="space-y-6 flex-grow">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">{plan.price}€</span>
                      <span className="text-muted-foreground">EUR</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.duration}</p>
                  </div>

                  <div className="space-y-3 pt-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className={`w-full mt-8 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-foreground hover:bg-muted"
                  }`}
                  size="lg"
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  SELECCIONAR {plan.name.toUpperCase()}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {viewMode === "table" && (
          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-4 px-4 font-bold text-foreground">Característica</th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className={`text-center py-4 px-4 font-bold ${
                        plan.popular ? "bg-primary/10 border-l-2 border-r-2 border-primary/30" : ""
                      }`}
                    >
                      <div className="font-bold">{plan.name}</div>
                      <div className="text-xl mt-2 text-primary">{plan.price}€</div>
                      <div className="text-xs text-muted-foreground mt-1">{plan.duration}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Duración", values: ["1 Mes", "6 Meses", "12 Meses"] },
                  { label: "Evaluación Personalizada", values: [true, true, true] },
                  { label: "Programa de Entrenamiento Personalizado", values: [true, true, true] },
                  { label: "Guías de Nutrición", values: [true, true, true] },
                  { label: "Seguimiento Semanal", values: [true, true, true] },
                  { label: "Consultas de Video", values: [false, true, true] },
                  { label: "Entrenamiento de Rendimiento Mental", values: [false, true, true] },
                  { label: "Sesiones Semanales 1 a 1", values: [false, false, true] },
                  { label: "Acceso Directo 24/7", values: [false, false, true] },
                  { label: "Retiro Exclusivo", values: [false, false, true] },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-foreground">{row.label}</td>
                    {row.values.map((value, i) => (
                      <td
                        key={i}
                        className={`text-center py-4 px-4 ${
                          plans[i].popular ? "bg-primary/5 border-l-2 border-r-2 border-primary/30" : ""
                        }`}
                      >
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          ) : (
                            <div className="text-muted-foreground font-light">−</div>
                          )
                        ) : (
                          <span className="text-muted-foreground">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-4 px-4" />
                  {plans.map((plan) => (
                    <td
                      key={`btn-${plan.name}`}
                      className={`text-center py-4 px-4 ${
                        plan.popular ? "bg-primary/5 border-l-2 border-r-2 border-primary/30" : ""
                      }`}
                    >
                      <Button
                        size="sm"
                        className={
                          plan.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                            : "bg-secondary text-foreground hover:bg-muted w-full"
                        }
                        onClick={() => handlePlanSelect(plan.name)}
                      >
                        Seleccionar
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Todos los planes incluyen garantía de satisfacción de 30 días.
            <br />
            ¿No estás seguro de cuál es el plan adecuado? Contáctanos para una recomendación personalizada.
          </p>
        </div>
      </div>
    </section>
  )
}
