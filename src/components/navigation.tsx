"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false)

    // Si no estamos en home, navegar primero
    if (location.pathname !== "/") {
      navigate("/")
      // Esperar a que cargue el home y luego hacer scroll
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } else {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm border-b border-gray-200" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => scrollToSection("hero")} className={`text-2xl font-bold tracking-tight transition-colors ${isScrolled ? "text-black" : "text-white"}`}>
            JT TRAINING
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("about")}
              className={`text-sm font-medium transition-colors ${isScrolled ? "text-gray-600 hover:text-black" : "text-white/80 hover:text-white"}`}
            >
              SOBRE MÍ
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className={`text-sm font-medium transition-colors ${isScrolled ? "text-gray-600 hover:text-black" : "text-white/80 hover:text-white"}`}
            >
              SERVICIOS
            </button>
            <button
              onClick={() => scrollToSection("credentials")}
              className={`text-sm font-medium transition-colors ${isScrolled ? "text-gray-600 hover:text-black" : "text-white/80 hover:text-white"}`}
            >
              CREDENCIALES
            </button>
            <button
              onClick={() => scrollToSection("plans")}
              className={`text-sm font-medium transition-colors ${isScrolled ? "text-gray-600 hover:text-black" : "text-white/80 hover:text-white"}`}
            >
              PLANES
            </button>
            <Button
              onClick={() => scrollToSection("contact")}
              className={isScrolled ? "bg-black text-white hover:bg-gray-800" : "bg-white text-black hover:bg-gray-200"}
            >
              CONTACTO
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className={`md:hidden transition-colors ${isScrolled ? "text-black" : "text-white"}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden py-6 space-y-4 border-t ${isScrolled ? "border-gray-200" : "border-white/20 bg-black/80 backdrop-blur-sm"}`}>
            <button
              onClick={() => scrollToSection("about")}
              className={`block w-full text-left text-sm font-medium transition-colors ${isScrolled ? "text-gray-600 hover:text-black" : "text-white/80 hover:text-white"}`}
            >
              SOBRE MÍ
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className={`block w-full text-left text-sm font-medium transition-colors ${isScrolled ? "text-gray-600 hover:text-black" : "text-white/80 hover:text-white"}`}
            >
              SERVICIOS
            </button>
            <button
              onClick={() => scrollToSection("credentials")}
              className={`block w-full text-left text-sm font-medium transition-colors ${isScrolled ? "text-gray-600 hover:text-black" : "text-white/80 hover:text-white"}`}
            >
              CREDENCIALES
            </button>
            <button
              onClick={() => scrollToSection("plans")}
              className={`block w-full text-left text-sm font-medium transition-colors ${isScrolled ? "text-gray-600 hover:text-black" : "text-white/80 hover:text-white"}`}
            >
              PLANES
            </button>
            <Button
              onClick={() => scrollToSection("contact")}
              className={`w-full ${isScrolled ? "bg-black text-white hover:bg-gray-800" : "bg-white text-black hover:bg-gray-200"}`}
            >
              CONTACTO
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
