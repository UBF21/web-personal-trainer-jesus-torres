import { useTranslation } from "@/contexts/language-context"

const partnerships = [
  {
    name: "Banus Medical",
    logo: "/banus-medical-logo.png",
    lightBg: true,
  },
  {
    name: "Exclusive Life Magazine",
    logo: "/elm-logo-white.png",
    lightBg: false,
  },
  {
    name: "Raph-Corp",
    logo: "/isotipo-solido-alt.png",
    lightBg: true,
  },
  {
    name: "Zumub",
    logo: "/zumub-logo.png",
    lightBg: false,
  },
  {
    name: "Biolab",
    logo: "/biolab-logo.jpg",
    lightBg: true,
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
    name: "Jose Bulnes",
    logo: "/josebulnes-logo.png",
    lightBg: true,
  },
  {
    name: "TrainerStudio",
    logo: "/trainerstudio-logo.png",
    lightBg: true,
  },
]

export function Brands() {
  const { t } = useTranslation()

  return (
    <section id="brands" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-black text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-white uppercase border border-white/30 px-3 py-1">
              {t.brands.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-white">
            {t.brands.titleLine1}
            <span className="block text-gray-400">{t.brands.titleLine2}</span>
          </h2>
          <p className="text-gray-400 leading-relaxed text-pretty max-w-2xl mx-auto">
            {t.brands.description}
          </p>
        </div>

        {/* Brands Grid - 3x3 */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {partnerships.map((partner, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-700 hover:border-white/50 transition-all duration-300 aspect-square flex items-center justify-center p-6 sm:p-8 lg:p-10 relative overflow-hidden"
              >
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className={`w-full h-auto object-contain max-h-16 sm:max-h-20 md:max-h-24 transition-all duration-300 opacity-80 group-hover:opacity-100 ${
                    partner.name === "Exclusive Life Magazine" ? "invert" : ""
                  }`}
                />
                {/* Brand name on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-black text-white text-xs font-semibold py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-gray-800">
            <div className="text-center">
              <span className="block text-4xl sm:text-5xl font-bold text-white">{partnerships.length}</span>
              <span className="text-sm text-gray-400 mt-1 block">{t.brands.statsPartners}</span>
            </div>
            <div className="hidden sm:block w-px h-14 bg-gray-800" />
            <div className="text-center">
              <span className="block text-4xl sm:text-5xl font-bold text-white">100%</span>
              <span className="text-sm text-gray-400 mt-1 block">{t.brands.statsCommitment}</span>
            </div>
            <div className="hidden sm:block w-px h-14 bg-gray-800" />
            <div className="text-center">
              <span className="block text-4xl sm:text-5xl font-bold text-white">+5</span>
              <span className="text-sm text-gray-400 mt-1 block">{t.brands.statsYears}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
