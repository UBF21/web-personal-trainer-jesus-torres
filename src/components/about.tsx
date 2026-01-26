import { Award, Target, TrendingUp } from "lucide-react"
import { useImages } from "@/hooks/use-images"

const FALLBACK_IMAGE = "https://uvfkmhsyrmuvkyzvrumq.supabase.co/storage/v1/object/public/jt-Images/hero/1769461177044-12.jpg"

export function About() {
  const { images, loading } = useImages("about")

  // Usa la primera imagen de la categoría "about", o fallback a "hero", o imagen por defecto
  const aboutImage = images[0]?.url || FALLBACK_IMAGE

  return (
    <section id="about" className="py-24 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 translate-x-4 translate-y-4" />
            {loading ? (
              <div className="relative w-full aspect-[3/4] bg-muted animate-pulse" />
            ) : (
              <img
                src={aboutImage}
                alt={images[0]?.alt || "Entrenador Personal de Elite"}
                className="relative w-full h-auto grayscale hover:grayscale-0 transition-all duration-500"
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="inline-block">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">Mi Historia</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Creado para lo
              <span className="block text-primary">Extraordinario</span>
            </h2>

            <p className="text-muted-foreground leading-relaxed text-pretty">
              Con más de 15 años de experiencia entrenando atletas de clase mundial, ejecutivos y profesionales de alto
              rendimiento, he desarrollado una metodología que trasciende el entrenamiento físico tradicional. Mi enfoque
              integra ciencia deportiva de vanguardia, acondicionamiento mental y estrategias nutricionales personalizadas.
            </p>

            <p className="text-muted-foreground leading-relaxed text-pretty">
              Después de competir profesionalmente y obtener certificaciones de las instituciones de fitness más
              prestigiosas del mundo, fundé Jesus Torres Training para servir a quienes se niegan a conformarse con lo
              promedio. Cada cliente recibe un programa de entrenamiento personalizado diseñado para desbloquear el máximo
              rendimiento físico y mental.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">15+</p>
                <p className="text-sm text-muted-foreground">Años de Experiencia</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-muted-foreground">Clientes Elite</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
