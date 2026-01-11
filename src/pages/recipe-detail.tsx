"use client"

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Navigation } from "../components/navigation"
import { ChevronLeft, Copy, Check } from "lucide-react"

const RECIPES_DATA = [
  {
    id: 1,
    title: "Avocado Toast con Huevo",
    type: "Desayuno",
    image: "/avocado-toast-egg.png",
    macros: { protein: 13.3, carbs: 10, fat: 12, calories: 201 },
    tags: ["Alto en proteínas", "Vegano", "Sin gluten"],
    servings: "1 porción",
    prepTime: "5 minutos",
    difficulty: "Fácil",
    ingredients: [
      { name: "Pan integral", amount: "1 rebanada" },
      { name: "Aguacate", amount: "1/2" },
      { name: "Huevo", amount: "1" },
      { name: "Limón", amount: "1/4" },
      { name: "Sal y pimienta", amount: "Al gusto" },
    ],
    instructions: [
      "Tuesta el pan integral hasta que esté crujiente.",
      "Corta el aguacate por la mitad y extrae la pulpa. Aplástala en el pan tostado.",
      "Exprime el jugo de limón sobre el aguacate.",
      "Calienta una sartén y cocina el huevo al gusto (frito o pochado).",
      "Coloca el huevo sobre el aguacate tostado.",
      "Sazona con sal y pimienta al gusto y sirve inmediatamente.",
    ],
    supplements: [
      { name: "Omega-3", benefit: "Mejora la recuperación y la salud cardiovascular" },
      { name: "Vitamina D", benefit: "Esencial para la absorción de calcio y la función inmunológica" },
      { name: "Complejo B", benefit: "Aumenta los niveles de energía y el metabolismo" },
    ],
    recommendations: [
      "Combina con un café verde para mayor energía.",
      "Añade sriracha para un toque picante.",
      "Usa huevos de corral para mejores nutrientes.",
    ],
  },
  {
    id: 2,
    title: "Ensalada de Quinoa",
    type: "Comida",
    image: "/colorful-quinoa-salad.png",
    macros: { protein: 7.5, carbs: 15, fat: 5, calories: 135 },
    tags: ["Balanceado", "Vegano"],
    servings: "1 porción",
    prepTime: "15 minutos",
    difficulty: "Fácil",
    ingredients: [
      { name: "Quinoa cocida", amount: "150g" },
      { name: "Pepino", amount: "1/4" },
      { name: "Tomate", amount: "1/2" },
      { name: "Cebolla roja", amount: "30g" },
      { name: "Cilantro", amount: "Un puñado" },
      { name: "Limón", amount: "1/2" },
      { name: "Aceite de oliva", amount: "1 cucharada" },
    ],
    instructions: [
      "Cocina la quinoa según las instrucciones del empaque (si no está cocida).",
      "Pica el pepino, tomate y cebolla en cubos pequeños.",
      "Mezcla la quinoa cocida con las verduras picadas.",
      "Agrega el cilantro fresco picado.",
      "En un recipiente pequeño, mezcla el jugo de limón con aceite de oliva.",
      "Vierte el aderezo sobre la ensalada y mezcla bien.",
      "Sazona al gusto con sal y pimienta.",
    ],
    supplements: [
      { name: "Spirulina", benefit: "Proteína completa y antioxidantes para mayor energía" },
      { name: "Magnesio", benefit: "Reduce la fatiga muscular y mejora la recuperación" },
    ],
    recommendations: [
      "Añade pollo a la parrilla para más proteína.",
      "Usa vinagre balsámico en lugar de limón para más sabor.",
      "Prepara porciones para el resto de la semana.",
    ],
  },
  {
    id: 3,
    title: "Pasta Vegetariana",
    type: "Cena",
    image: "/vegetarian-pasta.png",
    macros: { protein: 4, carbs: 20, fat: 3.2, calories: 125 },
    tags: ["Vegano"],
    servings: "1 porción",
    prepTime: "20 minutos",
    difficulty: "Fácil",
    ingredients: [
      { name: "Pasta integral", amount: "100g" },
      { name: "Brócoli", amount: "100g" },
      { name: "Tomate cherry", amount: "10 unidades" },
      { name: "Ajo", amount: "1 diente" },
      { name: "Aceite de oliva", amount: "1 cucharada" },
      { name: "Perejil", amount: "Un poco" },
    ],
    instructions: [
      "Cocina la pasta integral según las instrucciones.",
      "En otra olla, hierve el brócoli hasta que esté tierno.",
      "En una sartén, sofríe el ajo en aceite de oliva.",
      "Agrega los tomates cherry y cocina por 3 minutos.",
      "Añade el brócoli a la sartén y mezcla.",
      "Drena la pasta y combina con las verduras.",
      "Decora con perejil fresco y sirve.",
    ],
    supplements: [
      { name: "Vitamina C", benefit: "Fortalece el sistema inmunológico" },
      { name: "Fibra", benefit: "Mejora la digestión y la saciedad" },
    ],
    recommendations: ["Añade queso parmesano bajo en grasa.", "Experimenta con diferentes vegetales de temporada."],
  },
]

export default function RecipeDetailPage() {
  const { id } = useParams()
  const [copiedSupp, setCopiedSupp] = useState<string | null>(null)
  const recipe = RECIPES_DATA.find((r) => r.id === Number.parseInt(id || "0"))

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Receta no encontrada</h1>
          <Link to="/recetas" className="text-primary hover:underline">
            Volver a las recetas
          </Link>
        </div>
      </div>
    )
  }

  const copyToClipboard = (text: string, supp: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSupp(supp)
    setTimeout(() => setCopiedSupp(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/recetas" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <ChevronLeft size={20} />
          Volver a Recetas
        </Link>
      </div>

      {/* Recipe Header */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative h-96 rounded-lg overflow-hidden bg-muted/50">
              <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="w-full h-full object-cover" />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <p className="text-primary text-sm font-semibold mb-2">{recipe.type}</p>
              <h1 className="text-4xl font-bold mb-4 text-balance">{recipe.title}</h1>

              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Tiempo</p>
                  <p className="font-semibold">{recipe.prepTime}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Dificultad</p>
                  <p className="font-semibold">{recipe.difficulty}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Porciones</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-3 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{recipe.macros.protein.toFixed(1)}g</p>
                  <p className="text-xs text-muted-foreground">Proteína</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{recipe.macros.carbs.toFixed(1)}g</p>
                  <p className="text-xs text-muted-foreground">Carbohidratos</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{recipe.macros.fat.toFixed(1)}g</p>
                  <p className="text-xs text-muted-foreground">Grasas</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{recipe.macros.calories.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Calorías</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Ingredients */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Ingredientes</h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <input type="checkbox" className="mt-1 cursor-pointer" />
                      <div>
                        <p className="font-medium">{ingredient.name}</p>
                        <p className="text-sm text-muted-foreground">{ingredient.amount}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Instrucciones</h2>
                <ol className="space-y-3">
                  {recipe.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary text-background rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <p className="pt-1">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Supplements */}
              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">💊 Suplementación Recomendada</h3>
                <div className="space-y-3">
                  {recipe.supplements.map((supp, idx) => (
                    <div key={idx} className="bg-background p-4 rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-sm">{supp.name}</p>
                        <button
                          onClick={() => copyToClipboard(supp.name, supp.name)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                        >
                          {copiedSupp === supp.name ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} className="text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{supp.benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="text-lg font-bold mb-4">💡 Recomendaciones</h3>
                <ul className="space-y-2">
                  {recipe.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold mb-3">Características</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Recipes */}
      <section className="py-12 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Recetas Relacionadas</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {RECIPES_DATA.filter((r) => r.id !== recipe.id)
              .slice(0, 3)
              .map((relatedRecipe) => (
                <Link key={relatedRecipe.id} to={`/recetas/${relatedRecipe.id}`} className="group">
                  <div className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary transition-all duration-300">
                    <div className="relative h-48 bg-muted/50">
                      <img
                        src={relatedRecipe.image || "/placeholder.svg"}
                        alt={relatedRecipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-primary mb-2">{relatedRecipe.type}</p>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">
                        {relatedRecipe.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
