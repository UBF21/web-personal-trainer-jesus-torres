"use client"

import { useEffect, useState } from "react"

const partners = [
  { name: "Nike", discount: "15%", code: "ELITE15" },
  { name: "Lululemon", discount: "12%", code: "ELITE12" },
  { name: "Apple Fitness", discount: "20%", code: "ELITE20" },
  { name: "Gatorade", discount: "18%", code: "ELITE18" },
  { name: "Fitbit", discount: "25%", code: "ELITE25" },
  { name: "Peloton", discount: "10%", code: "ELITE10" },
]

export function PartnersCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    const carousel = document.getElementById("partners-scroll")
    if (!carousel) return

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const newPosition = prev + 1
        return newPosition > 100 ? 0 : newPosition
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <section className="py-20 md:py-24 bg-secondary border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-3">Asociados de Confianza</p>
          <h2 className="text-3xl md:text-4xl font-bold text-balance">
            Acceso Exclusivo a<span className="block text-primary">Marcas Premium</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Obtén descuentos especiales en las marcas líderes en fitness y bienestar
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div
            id="partners-scroll"
            className="flex gap-6 md:gap-8"
            style={{
              transform: `translateX(-${scrollPosition}%)`,
              transition: "transform 0.03s linear",
            }}
          >
            {partners.map((partner, index) => (
              <div key={`original-${index}`} className="flex-shrink-0 min-w-max group">
                <div
                  className="bg-background border-2 border-border hover:border-primary transition-all duration-300 p-8 flex flex-col items-center justify-center min-w-56 h-64 cursor-pointer relative overflow-hidden group"
                  onClick={() => handleCopyCode(partner.code)}
                >
                  {/* Brand logo placeholder with proper dimensions */}
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/5 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-300" />

                  {/* Brand name at top */}
                  <div className="relative z-10 mb-auto pt-6">
                    <h3 className="text-2xl font-bold tracking-wider text-center">{partner.name}</h3>
                  </div>

                  {/* Discount badge in center */}
                  <div className="relative z-10 text-center my-6">
                    <div className="text-5xl font-bold text-primary mb-2">{partner.discount}</div>
                    <div className="text-sm font-semibold text-muted-foreground">DESCUENTO</div>
                  </div>

                  {/* CTA at bottom */}
                  <div className="relative z-10 mt-auto pb-6 text-center">
                    <div className="text-xs font-mono font-semibold text-primary mb-2 tracking-wider">
                      {copiedCode === partner.code ? "¡COPIADO!" : partner.code}
                    </div>
                    <div className="text-xs text-muted-foreground">Haz clic para copiar código</div>
                  </div>
                </div>
              </div>
            ))}

            {partners.map((partner, index) => (
              <div key={`duplicate-${index}`} className="flex-shrink-0 min-w-max group">
                <div
                  className="bg-background border-2 border-border hover:border-primary transition-all duration-300 p-8 flex flex-col items-center justify-center min-w-56 h-64 cursor-pointer relative overflow-hidden group"
                  onClick={() => handleCopyCode(partner.code)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/5 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-300" />

                  <div className="relative z-10 mb-auto pt-6">
                    <h3 className="text-2xl font-bold tracking-wider text-center">{partner.name}</h3>
                  </div>

                  <div className="relative z-10 text-center my-6">
                    <div className="text-5xl font-bold text-primary mb-2">{partner.discount}</div>
                    <div className="text-sm font-semibold text-muted-foreground">DESCUENTO</div>
                  </div>

                  <div className="relative z-10 mt-auto pb-6 text-center">
                    <div className="text-xs font-mono font-semibold text-primary mb-2 tracking-wider">
                      {copiedCode === partner.code ? "¡COPIADO!" : partner.code}
                    </div>
                    <div className="text-xs text-muted-foreground">Haz clic para copiar código</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Haz clic en cualquier tarjeta para copiar tu código de descuento exclusivo
        </p>
      </div>
    </section>
  )
}
