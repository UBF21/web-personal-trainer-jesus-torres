"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const plans = [
  {
    name: "Plan Básico",
    price: 100,
    duration: "1 Mes",
    description: "Comienza tu transformación",
    features: [
      "Evaluación personalizada",
      "Programa de entrenamiento hecho a medida",
      "Guía de nutrición adecuada al cliente",
      "Recomendación de suplementación",
      "Soporte continuo por correo electrónico",
    ],
    popular: false,
    paymentUrl: "https://www.paypal.com/ncp/payment/QGTJ67SDUZ58Q",
  },
  {
    name: "Plan Avanzado",
    price: 1200,
    duration: "1 Año",
    description: "Transformación completa del cuerpo y la mente",
    features: [
      "Evaluación personalizada",
      "Programa de entrenamiento hecho a medida",
      "Plan de nutrición adecuado al cliente",
      "Recomendación de suplementación",
      "Control mensual por videollamada personalizado",
      "Soporte por WhatsApp",
    ],
    popular: true,
    paymentUrl: "https://www.paypal.com/ncp/payment/WNAYJCKMZXZUL",
  },
  {
    name: "Plan VIP",
    price: 3000,
    duration: "1 Año",
    description: "El programa de rendimiento definitivo",
    features: [
      "Evaluación personalizada por videollamada",
      "Dos consultas anuales con el doctor (antiaging, péptidos, hormonas)",
      "Programa de entrenamiento personalizado",
      "Dieta personalizada",
      "Programa de suplementación adaptado",
      "Libro de recetas fit exclusivo",
      "Acceso a sorteos VIP exclusivos",
      "Descuentos en diferentes marcas",
      "Seguimiento mensual por videollamada",
      "Soporte por WhatsApp prioritario",
    ],
    popular: false,
    paymentUrl: "https://www.paypal.com/ncp/payment/BMX2AHTFL7CE8",
  },
]

export function TrainingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  const handlePlanSelect = (planName: string, paymentUrl: string | null) => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank")
      return
    }
    setSelectedPlan(planName)
    setTimeout(() => {
      const element = document.getElementById("contact")
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  return (
    <section id="plans" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-black uppercase border border-black/30 px-3 py-1">Planes de Entrenamiento</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-black">
            Elige Tu Camino Hacia
            <span className="block text-gray-500">La Grandeza</span>
          </h2>
          <p className="text-gray-600 leading-relaxed text-pretty">
            Selecciona el programa que se alinee con tus ambiciones. Todos los planes incluyen acceso de por vida a
            recursos exclusivos y comunidad.
          </p>
        </div>

        <div className="flex justify-center mb-8 sm:mb-10 md:mb-12">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "cards" | "table")} className="w-auto">
            <TabsList className="bg-white border border-gray-300">
              <TabsTrigger
                value="cards"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Vista de Tarjetas
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
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
                className={`relative bg-white border-gray-200 p-5 sm:p-6 lg:p-8 flex flex-col ${
                  plan.popular ? "lg:scale-105 border-2 border-black shadow-2xl" : "border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-black text-white text-xs font-bold px-4 py-1.5 uppercase tracking-wider">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="space-y-6 flex-grow">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-black">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">{plan.price}€</span>
                      <span className="text-gray-500">EUR</span>
                    </div>
                    <p className="text-sm text-gray-500">{plan.duration}</p>
                  </div>

                  <div className="space-y-3 pt-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className={`w-full mt-8 ${
                    plan.popular
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-300"
                  }`}
                  size="lg"
                  onClick={() => handlePlanSelect(plan.name, plan.paymentUrl)}
                >
                  SELECCIONAR {plan.name.toUpperCase()}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {viewMode === "table" && (
          <div className="max-w-5xl mx-auto overflow-x-auto bg-white border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-4 font-bold text-black">Característica</th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className={`text-center py-4 px-4 font-bold ${
                        plan.popular ? "bg-gray-100 border-l-2 border-r-2 border-black" : ""
                      }`}
                    >
                      <div className="font-bold text-black">{plan.name}</div>
                      <div className="text-xl mt-2 text-black">{plan.price}€</div>
                      <div className="text-xs text-gray-500 mt-1">{plan.duration}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Duración", values: ["1 Mes", "1 Año", "1 Año"] },
                  { label: "Evaluación Personalizada", values: [true, true, "Por videollamada"] },
                  { label: "Programa de Entrenamiento a Medida", values: [true, true, true] },
                  { label: "Guía de Nutrición", values: [true, false, false] },
                  { label: "Plan de Nutrición / Dieta Personalizada", values: [false, true, true] },
                  { label: "Recomendación de Suplementación", values: [true, true, false] },
                  { label: "Programa de Suplementación Adaptado", values: [false, false, true] },
                  { label: "Control Mensual por Videollamada", values: [false, true, true] },
                  { label: "Consultas con Doctor (Antiaging, Péptidos, Hormonas)", values: [false, false, "2 anuales"] },
                  { label: "Libro de Recetas Fit Exclusivo", values: [false, false, true] },
                  { label: "Acceso a Sorteos VIP Exclusivos", values: [false, false, true] },
                  { label: "Descuentos en Diferentes Marcas", values: [false, false, true] },
                  { label: "Soporte por Correo Electrónico", values: [true, false, false] },
                  { label: "Soporte por WhatsApp", values: [false, true, "Prioritario"] },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-black">{row.label}</td>
                    {row.values.map((value, i) => (
                      <td
                        key={i}
                        className={`text-center py-4 px-4 ${
                          plans[i].popular ? "bg-gray-50 border-l-2 border-r-2 border-black" : ""
                        }`}
                      >
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-black mx-auto" />
                          ) : (
                            <div className="text-gray-400 font-light">−</div>
                          )
                        ) : (
                          <span className="text-gray-600">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300">
                  <td className="py-4 px-4" />
                  {plans.map((plan) => (
                    <td
                      key={`btn-${plan.name}`}
                      className={`text-center py-4 px-4 ${
                        plan.popular ? "bg-gray-50 border-l-2 border-r-2 border-black" : ""
                      }`}
                    >
                      <Button
                        size="sm"
                        className={
                          plan.popular
                            ? "bg-black text-white hover:bg-gray-800 w-full"
                            : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-300 w-full"
                        }
                        onClick={() => handlePlanSelect(plan.name, plan.paymentUrl)}
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
          <p className="text-sm text-gray-600">
            Todos los planes incluyen garantía de satisfacción de 30 días.
            <br />
            ¿No estás seguro de cuál es el plan adecuado? Contáctanos para una recomendación personalizada.
          </p>
        </div>
      </div>
    </section>
  )
}