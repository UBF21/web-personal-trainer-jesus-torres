import { Award, ExternalLink } from "lucide-react"

export function Doctor() {
  return (
    <section id="doctor" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-black uppercase border border-black/30 px-3 py-1">
              Nuestro Médico
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-black">
            Respaldo Médico de
            <span className="block text-gray-500">Primer Nivel</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-gray-100">
              <img
                src="/doctor.jpeg"
                alt="Dr. Francisco Martínez Peñalver"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-black">
                Dr. Francisco "Curro" Martínez Peñalver
              </h3>
              <p className="text-gray-600 mt-2 font-medium">
                Médico Internista | Especialista en Longevidad y Medicina de Precisión | Fundador de Lilibe
              </p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              El Dr. Francisco Martínez Peñalver es un referente internacional en Medicina de Longevidad y
              gestión del envejecimiento (Age Management). Médico internista con más de 15 años de
              experiencia clínica, combina su sólida base hospitalaria con las últimas innovaciones en
              biotecnología y medicina preventiva para extender no solo la vida, sino la calidad de la misma
              (Healthspan).
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong className="text-black">"Excellence in Healthcare Award"</strong> - Health 2.0 (Dubái, 2025)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong className="text-black">"Preventive Medicine Leader of the Year"</strong> - Fluxx Awards (Doha, 2025)
                </span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Como divulgador y ponente, el Dr. Martínez Peñalver comparte su visión sobre el futuro de la salud
              en foros de primer nivel. Sus próximas intervenciones incluyen la{" "}
              <a
                href="https://longevityfederation.com/4th-edition-global-longevity-federation-glf-2026/speakers/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black font-semibold underline underline-offset-2 hover:text-gray-600 inline-flex items-center gap-1"
              >
                Global Longevity Federation (GLF)
                <ExternalLink className="w-3 h-3" />
              </a>{" "}
              en Roma (Marzo 2026), donde abordará las nuevas fronteras en los tratamientos de
              longevidad, y una esperada participación en Oxford este mismo año.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
