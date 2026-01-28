"use client"

import { useState } from "react"

const partners = [
  { name: "Feast Fit", code: "FEASTFIT10", logo: "/feastfit-logo.svg", link: null, isDiscount: true },
  { name: "Exclusive Life Magazine", code: "ELM20", logo: "/elm-logo.svg", link: null, isDiscount: true },
  { name: "Raph-Corp", code: null, logo: "/isotipo-solido-alt.png", link: "https://raph-corp.com", isDiscount: false },
  { name: "Zumub", code: null, logo: "/zumub-logo.png", link: "http://zumu.be/JESUSTORRES", isDiscount: true },
]

export function PartnersCarousel() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleClick = (partner: typeof partners[0]) => {
    if (partner.link) {
      window.open(partner.link, "_blank")
    } else if (partner.code) {
      navigator.clipboard.writeText(partner.code)
      setCopiedCode(partner.code)
      setTimeout(() => setCopiedCode(null), 2000)
    }
  }

  const getActionText = (partner: typeof partners[0]) => {
    if (partner.code && copiedCode === partner.code) {
      return "¡CÓDIGO COPIADO!"
    }
    if (partner.isDiscount) {
      return "Haz clic para activar descuento"
    }
    if (partner.link) {
      return "Visita nuestra web"
    }
    return ""
  }

  const PartnerCard = ({ partner }: { partner: typeof partners[0] }) => (
    <div className="flex-shrink-0 group">
      <div
        className="bg-background border-2 border-border hover:border-primary transition-all duration-300 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center w-44 sm:w-52 lg:w-56 h-52 sm:h-58 lg:h-64 cursor-pointer relative overflow-hidden group"
        onClick={() => handleClick(partner)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/5 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-300" />

        {/* Logo de fondo - aparece discreto en hover */}
        {partner.logo && (
          <img
            src={partner.logo}
            alt=""
            className="absolute inset-0 m-auto w-32 h-32 sm:w-40 sm:h-40 object-contain opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          />
        )}

        <div className="relative z-10 flex-1 flex items-center justify-center px-2">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-wider text-center leading-tight">{partner.name}</h3>
        </div>

        <div className="relative z-10 text-center mt-auto pb-4">
          <div className="text-xs text-primary font-semibold">
            {getActionText(partner)}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="py-14 sm:py-16 md:py-20 lg:py-24 bg-secondary border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-3">Asociados de Confianza</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
            Acceso Exclusivo a<span className="block text-primary">Nuestros Partners</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Descuentos especiales y colaboraciones con marcas de fitness, nutrición y tecnología
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex gap-6 md:gap-8 animate-scroll hover:[animation-play-state:paused]">
            {/* Original set */}
            {partners.map((partner, index) => (
              <PartnerCard key={`original-${index}`} partner={partner} />
            ))}
            {/* Duplicate for seamless loop */}
            {partners.map((partner, index) => (
              <PartnerCard key={`duplicate-${index}`} partner={partner} />
            ))}
            {/* Third set for extra smoothness */}
            {partners.map((partner, index) => (
              <PartnerCard key={`triplicate-${index}`} partner={partner} />
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Haz clic en cualquier tarjeta para acceder a tu descuento exclusivo
        </p>
      </div>
    </section>
  )
}
