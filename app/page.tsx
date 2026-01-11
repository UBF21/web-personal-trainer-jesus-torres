import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Services } from "@/components/services"
import { Credentials } from "@/components/credentials"
import { TrainingPlans } from "@/components/training-plans"
import { Navigation } from "@/components/navigation"
import { PartnersCarousel } from "@/components/partners-carousel"
import { Contact } from "@/components/contact"
import Link from "next/link"
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Hero />
      <PartnersCarousel />
      <About />
      <Services />
      <Credentials />
      <TrainingPlans />
      <Contact />
      <section className="py-16 bg-gradient-to-br from-background to-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Nutrición & Recetas</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubre nuestro catálogo completo de recetas saludables, diseñadas para maximizar tu rendimiento y
            recuperación.
          </p>
          <Link
            href="/recetas"
            className="inline-block px-8 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ver Recetas
          </Link>
        </div>
      </section>
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Elite Performance</h3>
              <p className="text-sm text-muted-foreground">
                Entrenamiento de élite para atletas y emprendedores que buscan transformación.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                    Acerca de
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors flex items-center justify-center"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors flex items-center justify-center"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors flex items-center justify-center"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors flex items-center justify-center"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright and Contact Info */}
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 Elite Performance Training. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a
                  href="mailto:contact@eliteperformancept.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  contact@eliteperformancept.com
                </a>
                <span className="text-border">|</span>
                <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary transition-colors">
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
