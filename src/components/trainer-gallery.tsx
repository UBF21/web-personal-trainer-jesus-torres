import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useTranslation } from "@/contexts/language-context"

const GALLERY_IMAGES = Array.from(
  { length: 24 },
  (_, i) => `/gallery/trainer-${String(i + 1).padStart(2, "0")}.jpg`,
)

export function TrainerGallery() {
  const { t } = useTranslation()
  const total = GALLERY_IMAGES.length

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

        <Carousel opts={{ loop: true, align: "start" }} className="max-w-6xl mx-auto">
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

          <div className="flex items-center justify-center gap-4 mt-8 sm:mt-10">
            <CarouselPrevious className="static translate-y-0 left-auto right-auto rounded-none size-11 border-white/30 bg-transparent text-white hover:bg-white hover:text-black" />
            <CarouselNext className="static translate-y-0 left-auto right-auto rounded-none size-11 border-white/30 bg-transparent text-white hover:bg-white hover:text-black" />
          </div>
        </Carousel>
      </div>
    </section>
  )
}
