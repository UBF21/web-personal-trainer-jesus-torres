"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitted(true)
    setIsSubmitting(false)

    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", phone: "", message: "" })
    }, 3000)
  }

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Contacto</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Comienza Tu
            <span className="block text-primary">Transformación</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            ¿Listo para desbloquear tu potencial completo? Comunícate para programar tu consulta inicial y da el primer
            paso hacia el rendimiento elite.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto">
          <div className="space-y-8">
            <Card className="bg-card border-border p-4 sm:p-5 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Nombre Completo *
                    </label>
                    <Input
                      id="name"
                      placeholder="Juan Pérez"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Correo Electrónico *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Número de Teléfono
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Mensaje *
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Cuéntame sobre tus objetivos y lo que esperas lograr..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="bg-input border-border resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting || isSubmitted}
                >
                  {isSubmitting ? "ENVIANDO..." : isSubmitted ? "¡MENSAJE ENVIADO!" : "ENVIAR MENSAJE"}
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Ponte en Contacto</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ya sea que busques romper un estancamiento, prepararte para la competencia, o transformar completamente
                tu cuerpo y mentalidad, estoy aquí para guiarte en cada paso del camino.
              </p>
            </div>

            <div className="space-y-8 pt-8 border-t border-border">
              <div className="group">
                <a
                  href="mailto:personaltrainerjesustorres@gmail.com"
                  className="flex items-start gap-4 hover:opacity-80 transition-opacity"
                >
                  <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Correo Electrónico
                    </p>
                    <p className="text-lg text-foreground font-light mt-1">personaltrainerjesustorres@gmail.com</p>
                  </div>
                </a>
              </div>

              <div className="group">
                <a href="tel:+34662245562" className="flex items-start gap-4 hover:opacity-80 transition-opacity">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Teléfono</p>
                    <p className="text-lg text-foreground font-light mt-1">(+34) 662 245 562</p>
                  </div>
                </a>
              </div>

              <a
                href="https://wa.me/34662245562"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Ponte en contacto con nosotros</span>
              </a>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Tiempo de respuesta:</span> Todas las consultas reciben
                una respuesta dentro de 24 horas. Para asuntos urgentes, por favor llama directamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
