import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/home"
import RecetasPage from "./pages/recetas"
import RecipeDetailPage from "./pages/recipe-detail"
import MaintenancePage from "./pages/maintenance"
import PaymentSuccessPage from "./pages/payment-success"
import PaymentCancelledPage from "./pages/payment-cancelled"

const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === "true"

function App() {
  if (isMaintenanceMode) {
    return <MaintenancePage />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/recetas" element={<RecetasPage />} />
      <Route path="/recetas/:id" element={<RecipeDetailPage />} />
      <Route path="/pago/exito" element={<PaymentSuccessPage />} />
      <Route path="/pago/cancelado" element={<PaymentCancelledPage />} />
    </Routes>
  )
}

export default App
