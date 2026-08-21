import { BookOpen } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"

const PRESS_ITEMS = [
  {
    image: "/exclusive-life-magazine.png",
    href: "https://issuu.com/exclusivelifemagazine/docs/exclusive_life_magazine_24_90cc935d256558",
  },
  {
    image: "/press/elm-nutrition-training-longevity.jpg",
    href: "https://exclusivelifemagazine.com/nutrition-training-and-longevity-a-comprehensive-approach-to-living-better/",
  },
  {
    image: "/press/elm-30-cayetana.jpg",
    href: "https://issuu.com/exclusivelifemagazine/docs/exclusive_life_magazine_30",
  },
]

export function MagazineFeature() {
  const { t } = useTranslation()

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-black uppercase border border-black/30 px-3 py-1">
              {t.magazine.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-black">
            {t.magazine.titleLine1}
            <span className="block text-gray-500">{t.magazine.titleLine2}</span>
          </h2>
          <p className="text-gray-600 leading-relaxed text-pretty">{t.magazine.description}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {PRESS_ITEMS.map((item, index) => {
            const content = t.magazine.items[index]
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={content.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col flex-1 p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-black mb-2 text-balance">
                    {content.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-pretty mb-4">
                    {content.subtitle}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-black group-hover:gap-3 transition-all">
                    <BookOpen className="w-4 h-4" />
                    {t.magazine.readButton}
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
