import { useEffect, useRef, useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useTranslation } from "@/contexts/language-context"

const GALLERY_IMAGES = Array.from(
  { length: 24 },
  (_, i) => `/gallery/trainer-${String(i + 1).padStart(2, "0")}.jpg`,
)

const AUTOPLAY_INTERVAL_MS = 3500

export function TrainerGallery() {
  const { t } = useTranslation()
  const total = GALLERY_IMAGES.length
  const [api, setApi] = useState<CarouselApi>()
  const isHovering = useRef(false)

  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      if (isHovering.current) return
      api.scrollNext()
    }, AUTOPLAY_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [api])

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-32 bg-black text-white">
      {/* Decorative elements */}
      <div className="absolute -z-0 top-0 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -z-0 bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-white uppercase border border-white/30 px-3 py-1">
              {t.gallery.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-white">
            {t.gallery.titleLine1}
            <span className="block text-gray-400">{t.gallery.titleLine2}</span>
          </h2>
          <p className="text-gray-400 leading-relaxed text-pretty">{t.gallery.description}</p>
        </div>

        <Carousel
          opts={{ loop: true, align: "start" }}
          setApi={setApi}
          className="group/carousel max-w-6xl mx-auto"
          onMouseEnter={() => {
            isHovering.current = true
          }}
          onMouseLeave={() => {
            isHovering.current = false
          }}
        >
          <CarouselContent className="-ml-4 sm:-ml-6">
            {GALLERY_IMAGES.map((image, index) => (
              <CarouselItem key={index} className="pl-4 sm:pl-6 basis-[78%] sm:basis-1/2 lg:basis-1/3">
                <div className="group relative aspect-[3/4] overflow-hidden border border-white/10">
                  <img
                    src={image}
                    alt={`Personal Trainer Jesús Torres ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute bottom-4 left-4 text-xs font-bold tracking-widest text-white/80">
                    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious
            className="hidden sm:flex left-2 lg:-left-5 top-1/2 -translate-y-1/2 rounded-none size-10 lg:size-11 border-white/30 bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover/carousel:opacity-100 hover:bg-white hover:text-black transition-opacity"
          />
          <CarouselNext
            className="hidden sm:flex right-2 lg:-right-5 top-1/2 -translate-y-1/2 rounded-none size-10 lg:size-11 border-white/30 bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover/carousel:opacity-100 hover:bg-white hover:text-black transition-opacity"
          />
        </Carousel>
      </div>
    </section>
  )
}
