import { Construction, Clock, Mail, Instagram } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
              <Construction className="w-16 h-16 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Sitio en Mantenimiento
          </h1>
          <p className="text-xl text-muted-foreground">
            Estamos trabajando para mejorar tu experiencia
          </p>
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Estamos realizando mejoras en nuestro sitio web para ofrecerte una mejor
            experiencia. Volveremos muy pronto con novedades increíbles.
          </p>
          <div className="flex items-center justify-center gap-2 text-primary font-medium">
            <Clock className="w-5 h-5" />
            <span>Tiempo estimado: Próximamente</span>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <p className="text-muted-foreground">
            ¿Tienes alguna pregunta? Contáctanos:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:personaltrainerjesustorres@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>Enviar Email</span>
            </a>
            <a
              href="https://www.instagram.com/jjttrainer/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full hover:bg-accent transition-colors"
            >
              <Instagram className="w-5 h-5" />
              <span>Instagram</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Jesus Torres Training. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
