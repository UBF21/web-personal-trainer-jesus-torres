import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/home"
import RecetasPage from "./pages/recetas"
import RecipeDetailPage from "./pages/recipe-detail"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/recetas" element={<RecetasPage />} />
      <Route path="/recetas/:id" element={<RecipeDetailPage />} />
    </Routes>
  )
}

export default App
