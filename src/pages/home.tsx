import { useMemo } from "react"
import { Hero } from "../components/hero"
import { About } from "../components/about"
import { Services } from "../components/services"
import { Credentials } from "../components/credentials"
import { TrainingPlans } from "../components/training-plans"
import { Navigation } from "../components/navigation"
import { PartnersCarousel } from "../components/partners-carousel"
import { Contact } from "../components/contact"
import { Link } from "react-router-dom"
import { Instagram } from "lucide-react"

const RECIPE_IMAGES = [
  { id: 1, title: "Avocado Toast con Huevo", image: "/avocado-toast-egg.png" },
  { id: 2, title: "Ensalada de Quinoa", image: "/colorful-quinoa-salad.png" },
  { id: 3, title: "Pasta Vegetariana", image: "/vegetarian-pasta.png" },
  { id: 4, title: "Yogur con Nueces", image: "/yogurt-nuts.jpg" },
  { id: 5, title: "Avena con Frutas", image: "/oatmeal-fruits.jpg" },
  { id: 6, title: "Smoothie de Espinaca", image: "/spinach-smoothie.jpg" },
  { id: 7, title: "Pechuga de Pollo a la Plancha", image: "/grilled-chicken-breast.png" },
  { id: 8, title: "Salmón al Horno con Espárragos", image: "/salmon-asparagus.jpg" },
  { id: 9, title: "Bowl de Arroz y Salmón", image: "/salmon-rice-bowl.png" },
  { id: 10, title: "Tacos de Pavo", image: "/turkey-tacos.jpg" },
  { id: 11, title: "Wrap Integral de Pollo", image: "/chicken-wrap.png" },
  { id: 12, title: "Crepes de Avena y Plátano", image: "/oatmeal-crepes-banana.jpg" },
]

export default function HomePage() {
  // Seleccionar 2 recetas aleatorias
  const randomRecipes = useMemo(() => {
    const shuffled = [...RECIPE_IMAGES].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 2)
  }, [])
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Hero />
      <div className="border-t border-gray-200" />
      <PartnersCarousel />
      <div className="border-t border-gray-200" />
      <About />
      <div className="border-t border-gray-200" />
      <Services />
      <div className="border-t border-gray-200" />
      <Credentials />
      <div className="border-t border-gray-200" />
      <TrainingPlans />
      <div className="border-t border-gray-200" />
      <section id="recetas" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">

            {/* Left: Content */}
            <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-block">
                <span className="text-xs font-bold tracking-widest text-white uppercase border border-white/30 px-3 py-1">Alimentación Inteligente</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-white">
                Nutrición &
                <span className="block text-gray-400">Recetas</span>
              </h2>
              <p className="text-gray-400 leading-relaxed text-pretty max-w-md mx-auto lg:mx-0">
                Descubre nuestro catálogo completo de recetas saludables, diseñadas para maximizar tu rendimiento y
                recuperación. Cada plato pensado para potenciar tus resultados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link
                  to="/recetas"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
                >
                  Explorar Recetas
                </Link>
                <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-400">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-white">12+</span>
                    <span>Recetas</span>
                  </div>
                  <div className="w-px h-10 bg-gray-700" />
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-white">100%</span>
                    <span>Saludables</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Images */}
            <div className="relative order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                {randomRecipes.map((recipe, index) => (
                  <Link
                    key={recipe.id}
                    to="/recetas"
                    className={`group relative overflow-hidden ${
                      index === 0 ? "aspect-[4/5] translate-y-6" : "aspect-[4/5] -translate-y-6"
                    }`}
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className="text-white text-sm font-medium block">{recipe.title}</span>
                        <span className="text-white/70 text-xs">Ver receta →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Decorative element */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            </div>

          </div>
        </div>
      </section>
      <div className="border-t border-gray-200" />
      <Contact />
      <footer className="border-t border-gray-800 py-8 sm:py-10 md:py-12 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Jesus Torres Training</h3>
              <p className="text-sm text-gray-400">
                Entrenamiento de élite para atletas y emprendedores que buscan transformación.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                    Acerca de
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-gray-400 hover:text-white transition-colors">
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Síguenos</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.instagram.com/jjttrainer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-white text-gray-300 hover:text-black transition-colors"
                >
                  <Instagram size={18} />
                  <span className="text-sm font-medium">@jjttrainer</span>
                </a>
                <a
                  href="https://www.instagram.com/julitojesustorres/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-white text-gray-300 hover:text-black transition-colors"
                >
                  <Instagram size={18} />
                  <span className="text-sm font-medium">@julitojesustorres</span>
                </a>
                <a
                  href="https://www.instagram.com/fit.blood/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-white text-gray-300 hover:text-black transition-colors"
                >
                  <Instagram size={18} />
                  <span className="text-sm font-medium">@fit.blood</span>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright and Contact Info */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <p className="text-xs sm:text-sm text-gray-500">
                © 2026 Jesus Torres Training. Todos los derechos reservados.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs sm:text-sm">
                <a
                  href="mailto:personaltrainerjesustorres@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  personaltrainerjesustorres@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
