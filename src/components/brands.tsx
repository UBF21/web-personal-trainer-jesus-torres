import { useTranslation } from "@/contexts/language-context"
import { Sparkles } from "lucide-react"

const partnerships = [
  {
    name: "Biolab",
    logo: "/biolab-logo.jpg",
    lightBg: true,
  },
  {
    name: "Exclusive Life Magazine",
    logo: "/elm-logo-white.png",
    lightBg: false,
  },
  {
    name: "Fitblood",
    logo: "/fitblood-logo.png",
    lightBg: true,
  },
  {
    name: "Gaspar",
    logo: "/gaspar-logo.jpeg",
    lightBg: true,
  },
  {
    name: "GREAT I AM",
    logo: "/greatiam-logo.png",
    lightBg: true,
  },
  {
    name: "Jose Bulnes",
    logo: "/josebulnes-logo.png",
    lightBg: true,
  },
  {
    name: "Raph-Corp",
    logo: "/isotipo-solido-alt.png",
    lightBg: true,
  },
  {
    name: "TrainerStudio",
    logo: "/trainerstudio-logo.png",
    lightBg: true,
  },
  {
    name: "Zumub",
    logo: "/zumub-logo.png",
    lightBg: false,
  },
  {
    name: "Diamond Shine",
    logo: "/diamondshine-logo.jpeg",
    lightBg: true,
  },
]

export function Brands() {
  const { t } = useTranslation()

  return (
    <section id="brands" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-black text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-6">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-xs font-bold tracking-widest text-white uppercase border border-white/30 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm">
              {t.brands.badge}
            </span>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              {t.brands.titleLine1}
            </span>
            <span className="block mt-2 text-gray-400">{t.brands.titleLine2}</span>
          </h2>
          <p className="text-gray-300 leading-relaxed text-pretty max-w-2xl mx-auto text-lg">
            {t.brands.description}
          </p>
        </div>

        {/* Brands Grid */}
        <div className="max-w-5xl mx-auto">
          {/* Row 1: 5 logos */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-5 md:mb-6">
            {partnerships.slice(0, 5).map((partner, index) => (
              <div
                key={index}
                className="group relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 bg-white border border-gray-200 hover:border-black rounded-2xl flex items-center justify-center p-5 sm:p-6 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-white/20"
              >
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className={`w-full h-auto object-contain max-h-14 sm:max-h-16 md:max-h-20 transition-all duration-500 opacity-70 group-hover:opacity-100 ${
                    partner.name === "Exclusive Life Magazine" ? "invert" : ""
                  }`}
                />
                {/* Brand name tooltip */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 group-hover:-bottom-4 transition-all duration-300 whitespace-nowrap shadow-lg">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>
          {/* Row 2: 4 logos centered */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6">
            {partnerships.slice(5).map((partner, index) => (
              <div
                key={index + 5}
                className="group relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 bg-white border border-gray-200 hover:border-black rounded-2xl flex items-center justify-center p-5 sm:p-6 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-white/20"
              >
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className="w-full h-auto object-contain max-h-14 sm:max-h-16 md:max-h-20 transition-all duration-500 opacity-70 group-hover:opacity-100"
                />
                {/* Brand name tooltip */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 group-hover:-bottom-4 transition-all duration-300 whitespace-nowrap shadow-lg">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>

          {/* Stats with enhanced design */}
          <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {partnerships.length}
                  </span>
                </div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{t.brands.statsPartners}</p>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    100%
                  </span>
                </div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{t.brands.statsCommitment}</p>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    +5
                  </span>
                </div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{t.brands.statsYears}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
