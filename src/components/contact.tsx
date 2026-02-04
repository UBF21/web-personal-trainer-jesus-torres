"use client"

import type React from "react"

import { useState } from "react"
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
    <section id="contact" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-widest text-black uppercase border border-black/30 px-3 py-1">Contacto</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance text-black">
            Comienza Tu
            <span className="block text-gray-500">Transformación</span>
          </h2>
          <p className="text-gray-600 leading-relaxed text-pretty">
            ¿Listo para desbloquear tu potencial completo? Comunícate para programar tu consulta inicial y da el primer
            paso hacia el rendimiento elite.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <Card className="bg-white border-gray-200 p-4 sm:p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-black">
                    Nombre Completo *
                  </label>
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-black">
                    Correo Electrónico *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-black">
                  Número de Teléfono
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-black">
                  Mensaje *
                </label>
                <Textarea
                  id="message"
                  placeholder="Cuéntame sobre tus objetivos y lo que esperas lograr..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400 resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isSubmitting || isSubmitted}
              >
                {isSubmitting ? "ENVIANDO..." : isSubmitted ? "¡MENSAJE ENVIADO!" : "ENVIAR MENSAJE"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}
