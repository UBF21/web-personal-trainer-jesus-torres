import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/config/api"

// Cuenta las visitas a la web pública para el dashboard del panel. Solo
// guarda un id anónimo por navegador (localStorage), sin cookies de
// terceros ni datos personales. No cuenta las páginas del panel ni al
// propio equipo (administrador/webmaster), para no inflar las visitas.

const VISITOR_KEY = "jt_vid"

function getVisitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

export function PageViewTracker() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const lastTracked = useRef<string | null>(null)
  const referrerSent = useRef(false)

  useEffect(() => {
    if (loading) return
    if (user && (user.role === "administrador" || user.role === "webmaster")) return
    if (location.pathname.startsWith("/panel") || location.pathname === "/login") return
    if (lastTracked.current === location.pathname) return
    lastTracked.current = location.pathname

    const visitorId = getVisitorId()
    if (!visitorId) return

    // El referrer solo tiene sentido en la primera página de la visita.
    const referrer = referrerSent.current ? null : document.referrer || null
    referrerSent.current = true

    api.analytics.trackPageView(location.pathname, visitorId, referrer)
  }, [location.pathname, loading, user])

  return null
}
