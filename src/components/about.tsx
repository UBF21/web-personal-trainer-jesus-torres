import { Award, Target, TrendingUp } from "lucide-react"
import { useImages } from "@/hooks/use-images"

const FALLBACK_IMAGE = "https://uvfkmhsyrmuvkyzvrumq.supabase.co/storage/v1/object/public/jt-Images/about/1769461177044-12.jpg"

export function About() {
  const { images, loading } = useImages("about")

  // Usa la primera imagen de la categoría "about", o fallback a "hero", o imagen por defecto
  const aboutImage = images[0]?.url || FALLBACK_IMAGE

  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 xl:gap-20 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-4 translate-y-4" />
            {loading ? (
              <div className="relative w-full aspect-[3/4] bg-gray-200 animate-pulse" />
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
              <span className="text-xs font-bold tracking-widest text-black uppercase border border-black/30 px-3 py-1">Mi Historia</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-black">
              Creado para lo
              <span className="block text-gray-500">Extraordinario</span>
            </h2>

            <p className="text-gray-600 leading-relaxed text-pretty">
              Desde muy joven estuve vinculado al mundo de la estética y la imagen, comenzando mi carrera como modelo. A lo largo de los años trabajé en distintos realities de televisión en Sudamérica y desarrollé mi carrera profesional como modelo en Sudamérica, Centroamérica, Norteamérica y Europa, lo que me permitió conocer de cerca la importancia del cuidado físico, la disciplina y los hábitos saludables.
            </p>

            <p className="text-gray-600 leading-relaxed text-pretty">
              A partir de esa experiencia nació mi interés genuino por el fitness y la nutrición. De manera inicial, comencé a ayudar a amigos y familiares a mejorar su condición física y su estética como un hobby, y descubrí lo bien que me hacía ver los cambios positivos que lograban en su cuerpo, su salud y su autoestima.
            </p>

            <p className="text-gray-600 leading-relaxed text-pretty">
              Motivado por esa pasión, decidí formarme profesionalmente, estudiando y perfeccionándome como Personal Trainer y Nutricionista, para luego volcarme de lleno al ámbito profesional y comercial.
            </p>

            <p className="text-gray-600 leading-relaxed text-pretty">
              Hoy, mi principal objetivo es acompañar a las personas en el desarrollo de hábitos saludables y sostenibles, logrando que el bienestar, la salud y la estética vayan de la mano. Me incentiva ayudar a cada persona a sacar su mejor versión, no solo desde lo físico, sino también desde la calidad de vida.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-black">15+</p>
                <p className="text-sm text-gray-500">Años de Experiencia</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-black">500+</p>
                <p className="text-sm text-gray-500">Clientes Elite</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-black">98%</p>
                <p className="text-sm text-gray-500">Tasa de Éxito</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
