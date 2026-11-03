import { useEffect, useState } from "react"
import { Routes, Route } from "react-router-dom"
import { api } from "@/config/api"
import HomePage from "./pages/home"
import RecetasPage from "./pages/recetas"
import RecipeDetailPage from "./pages/recipe-detail"
import LoginPage from "./pages/login"
import PanelLayout, { RequireRole } from "./pages/panel/panel-layout"
import PanelOverview from "./pages/panel/overview"
import PanelProfile from "./pages/panel/profile"
import { ClientAppointments, ClientPlan } from "./pages/panel/client-pages"
import { AdminAgenda, AdminClients } from "./pages/panel/admin-pages"
import { AdminPlans } from "./pages/panel/plans"
import { WebmasterSite, WebmasterUsers } from "./pages/panel/webmaster-pages"
import PanelGallery from "./pages/panel/gallery"
import ClientDetailPage from "./pages/panel/client-detail"
import MaintenancePage from "./pages/maintenance"
import PaymentSuccessPage from "./pages/payment-success"
import PaymentCancelledPage from "./pages/payment-cancelled"

function App() {
  // Null mientras se confirma el valor real en Supabase — evita el
  // parpadeo de mostrar el sitio normal un instante antes de bloquearlo.
  const [maintenance, setMaintenance] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    api.settings.getMaintenanceMode().then((res) => {
      if (active) setMaintenance(res.success ? !!res.data : false)
    })
    return () => {
      active = false
    }
  }, [])

  if (maintenance === null) return null

  // El mantenimiento solo bloquea las páginas públicas — /login y /panel
  // quedan siempre accesibles, si no nadie podría entrar a apagarlo.
  return (
    <Routes>
      <Route path="/" element={maintenance ? <MaintenancePage /> : <HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/panel" element={<PanelLayout />}>
        <Route index element={<PanelOverview />} />
        <Route path="perfil" element={<PanelProfile />} />
        <Route path="plan" element={<RequireRole roles={["cliente"]}><ClientPlan /></RequireRole>} />
        <Route path="citas" element={<RequireRole roles={["cliente"]}><ClientAppointments /></RequireRole>} />
        <Route path="clientes" element={<RequireRole roles={["administrador", "webmaster"]}><AdminClients /></RequireRole>} />
        <Route path="clientes/:id" element={<RequireRole roles={["administrador", "webmaster"]}><ClientDetailPage /></RequireRole>} />
        <Route path="planes" element={<RequireRole roles={["administrador", "webmaster"]}><AdminPlans /></RequireRole>} />
        <Route path="agenda" element={<RequireRole roles={["administrador", "webmaster"]}><AdminAgenda /></RequireRole>} />
        <Route path="galeria" element={<RequireRole roles={["administrador", "webmaster"]}><PanelGallery /></RequireRole>} />
        <Route path="usuarios" element={<RequireRole roles={["webmaster"]}><WebmasterUsers /></RequireRole>} />
        <Route path="sitio" element={<RequireRole roles={["webmaster"]}><WebmasterSite /></RequireRole>} />
      </Route>
      <Route path="/recetas" element={maintenance ? <MaintenancePage /> : <RecetasPage />} />
      <Route path="/recetas/:id" element={maintenance ? <MaintenancePage /> : <RecipeDetailPage />} />
      <Route path="/pago/exito" element={<PaymentSuccessPage />} />
      <Route path="/pago/cancelado" element={<PaymentCancelledPage />} />
    </Routes>
  )
}

export default App
