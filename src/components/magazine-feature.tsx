import { BookOpen } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"

export function MagazineFeature() {
  const { t } = useTranslation()

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3">
                {t.credentials.magazine.title}
              </h3>
              <p className="text-gray-600 text-lg">
                {t.credentials.magazine.subtitle}
              </p>
            </div>

            {/* Magazine Image */}
            <div className="relative mb-8 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="/exclusive-life-magazine.png"
                alt="Exclusive Life Magazine"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <a
                href="https://issuu.com/exclusivelifemagazine/docs/exclusive_life_magazine_24_90cc935d256558"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <BookOpen className="w-5 h-5" />
                <span>{t.credentials.magazine.magazineButton}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
