import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/home"
import RecetasPage from "./pages/recetas"
import RecipeDetailPage from "./pages/recipe-detail"
import MaintenancePage from "./pages/maintenance"

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
    </Routes>
  )
}

export default App
