"use client"

import { useState } from "react"
import { useTranslation } from "@/contexts/language-context"

const partners = [
  { name: "Exclusive Life Magazine", code: null, logo: "/elm-logo-white.png", link: "https://issuu.com/exclusivelifemagazine/docs/exclusive_life_magazine_24_90cc935d256558", isDiscount: false },
  { name: "Raph-Corp", code: null, logo: "/isotipo-solido-alt.png", link: "https://raph-corp.com", isDiscount: false },
  { name: "Zumub", code: null, logo: "/zumub-logo.png", link: "http://zumu.be/JESUSTORRES", isDiscount: true },
  { name: "Biolab", code: null, logo: "/biolab-logo.jpg", link: "https://biolabshop.co.uk", isDiscount: false },
  { name: "Fitblood", code: null, logo: "/fitblood-logo.png", link: "https://instagram.com/fit.blood", isDiscount: false },
  { name: "Gaspar", code: null, logo: "/gaspar-logo.jpeg", link: "https://www.instagram.com/gaspar.microcapilar", isDiscount: false },
  { name: "Jose Bulnes", code: null, logo: "/josebulnes-logo.png", link: "https://www.josebulnes.com", isDiscount: false },
  { name: "TrainerStudio", code: null, logo: "/trainerstudio-logo.png", link: "https://www.trainerstudio.com", isDiscount: false },
  { name: "GREAT I AM", code: null, logo: "/greatiam-logo.png", link: "https://greatiamwear.com/es/", isDiscount: false },
]

export function PartnersCarousel() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { t } = useTranslation()

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
      return t.partners.codeCopied
    }
    if (partner.isDiscount) {
      return t.partners.activateDiscount
    }
    if (partner.link) {
      return t.partners.visitWeb
    }
    return ""
  }

  const PartnerCard = ({ partner }: { partner: typeof partners[0] }) => (
    <div className="flex-shrink-0 group">
      <div
        className="bg-white border-2 border-gray-200 hover:border-black transition-all duration-300 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center w-44 sm:w-52 lg:w-56 h-52 sm:h-58 lg:h-64 cursor-pointer relative overflow-hidden group"
        onClick={() => handleClick(partner)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-white group-hover:from-black/5 group-hover:to-white transition-all duration-300" />

        {/* Logo de fondo - siempre visible con transparencia */}
        {partner.logo && (
          <img
            src={partner.logo}
            alt=""
            className={`absolute inset-0 m-auto w-32 h-32 sm:w-40 sm:h-40 object-contain opacity-10 ${
              partner.name === "TrainerStudio" ? "-translate-y-12" : ""
            }`}
          />
        )}

        {/* Nombre */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-2">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-wider text-center leading-tight text-black">{partner.name}</h3>
        </div>

        <div className="relative z-10 text-center mt-auto pb-4">
          <div className="text-xs text-black font-semibold">
            {getActionText(partner)}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="py-14 sm:py-16 md:py-20 lg:py-24 bg-gray-100 border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <p className="text-sm font-semibold tracking-widest text-black uppercase mb-3 border border-black/30 inline-block px-3 py-1">{t.partners.badge}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance text-black mt-4">
            {t.partners.titleLine1}<span className="block text-gray-500">{t.partners.titleLine2}</span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            {t.partners.description}
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex gap-6 md:gap-8 animate-scroll hover:[animation-play-state:paused]"
            style={{ width: 'max-content' }}
          >
            {/* First set */}
            {partners.map((partner, index) => (
              <PartnerCard key={`set1-${index}`} partner={partner} />
            ))}
            {/* Second set for seamless loop */}
            {partners.map((partner, index) => (
              <PartnerCard key={`set2-${index}`} partner={partner} />
            ))}
            {/* Third set for buffer */}
            {partners.map((partner, index) => (
              <PartnerCard key={`set3-${index}`} partner={partner} />
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-10">
          {t.partners.bottomNote}
        </p>
      </div>
    </section>
  )
}
