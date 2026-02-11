"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "@/contexts/language-context"

const PAYMENT_URLS = [
  "https://www.paypal.com/ncp/payment/QGTJ67SDUZ58Q",
  "https://www.paypal.com/ncp/payment/WNAYJCKMZXZUL",
  "https://www.paypal.com/ncp/payment/BMX2AHTFL7CE8",
]

const PRICES = [100, 1200, 3000]
const POPULAR_INDEX = 1

export function TrainingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const { t } = useTranslation()

  const plans = t.plans.items.map((item, i) => ({
    ...item,
    price: PRICES[i],
    popular: i === POPULAR_INDEX,
    paymentUrl: PAYMENT_URLS[i],
  }))

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
            <span className="text-xs font-bold tracking-widest text-black uppercase border border-black/30 px-3 py-1">{t.plans.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-black">
            {t.plans.titleLine1}
            <span className="block text-gray-500">{t.plans.titleLine2}</span>
          </h2>
          <p className="text-gray-600 leading-relaxed text-pretty">
            {t.plans.description}
          </p>
        </div>

        <div className="flex justify-center mb-8 sm:mb-10 md:mb-12">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "cards" | "table")} className="w-auto">
            <TabsList className="bg-white border border-gray-300">
              <TabsTrigger
                value="cards"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                {t.plans.viewCards}
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                {t.plans.viewTable}
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
                      {t.plans.popular}
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
                  {t.plans.select} {plan.name.toUpperCase()}
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
                  <th className="text-left py-4 px-4 font-bold text-black">{t.plans.feature}</th>
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
                {t.plans.tableRows.map((row, idx) => (
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
                        {t.plans.selectTable}
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
            {t.plans.guarantee}
            <br />
            {t.plans.guaranteeQuestion}
          </p>
        </div>
      </div>
    </section>
  )
}
