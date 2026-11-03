import { useState } from "react"
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom"
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Globe,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROLE_LABEL, useAuth, type Role } from "@/contexts/auth-context"
import { useClients } from "@/contexts/clients-context"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const OVERVIEW: NavItem = { to: "/panel", label: "Resumen", icon: LayoutDashboard, end: true }
// Administrador y webmaster: en lugar del resumen del cliente, el dashboard de la plataforma
const DASHBOARD: NavItem = { to: "/panel", label: "Dashboard", icon: BarChart3, end: true }

const ADMIN_ITEMS: NavItem[] = [
  // Oculto por ahora a pedido — la ruta /panel/agenda sigue activa, solo
  // no aparece en el menú. Descomentar para volver a mostrarlo.
  // { to: "/panel/agenda", label: "Calendario", icon: CalendarCheck },
  { to: "/panel/clientes", label: "Clientes", icon: Users },
  { to: "/panel/planes", label: "Planes", icon: ClipboardList },
  { to: "/panel/galeria", label: "Galería", icon: Images },
]

// El webmaster ve todo lo del administrador y además la gestión del sitio y de los usuarios.
// "Mi perfil" ya no está acá — se accede tocando el bloque de nombre/avatar del header.
const MENU: Record<Role, NavItem[]> = {
  cliente: [
    OVERVIEW,
    { to: "/panel/plan", label: "Mi plan", icon: Dumbbell },
    { to: "/panel/citas", label: "Mis citas", icon: CalendarDays },
  ],
  administrador: [DASHBOARD, ...ADMIN_ITEMS],
  webmaster: [
    DASHBOARD,
    { to: "/panel/usuarios", label: "Usuarios y roles", icon: ShieldCheck },
    { to: "/panel/sitio", label: "Sitio web", icon: Globe },
    ...ADMIN_ITEMS,
  ],
}

export default function PanelLayout() {
  const { user, loading, logout } = useAuth()
  const { pending } = useClients()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Mientras se confirma si ya hay sesión (p. ej. al recargar la página),
  // no redirigir a /login todavía — si no, una sesión real se "cerraría" sola.
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  const items = MENU[user.role]
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex items-center justify-center border-b border-white/10 px-6 py-5">
        <img src="/jt-logo-white.png" alt="JT Training" className="h-20 w-auto" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
            {to === "/panel/clientes" && pending.length > 0 && (
              <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">{pending.length}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Home className="h-4 w-4" />
          Ir al sitio
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-dvh w-64 md:block">{sidebar}</aside>

      {/* Sidebar móvil */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menú">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="hidden md:block" />
          <button
            type="button"
            onClick={() => navigate("/panel/perfil")}
            className="flex items-center gap-3 transition-opacity hover:opacity-70"
          >
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
              {initials}
            </div>
          </button>
        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** Protege una ruta del panel: solo entran los roles indicados; el resto vuelve al resumen. */
export function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return <Navigate to="/panel" replace />
  return <>{children}</>
}
