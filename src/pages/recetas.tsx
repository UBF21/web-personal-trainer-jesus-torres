"use client"

import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Navigation } from "../components/navigation"

const RECIPES_DATA = [
  {
    id: 1,
    title: "Avocado Toast con Huevo",
    type: "Desayuno",
    image: "/avocado-toast-egg.png",
    macros: { protein: 13.3, carbs: 10, fat: 12, calories: 201 },
    tags: ["Alto en proteínas", "Vegano", "Sin gluten"],
  },
  {
    id: 2,
    title: "Ensalada de Quinoa",
    type: "Comida",
    image: "/colorful-quinoa-salad.png",
    macros: { protein: 7.5, carbs: 15, fat: 5, calories: 135 },
    tags: ["Balanceado", "Vegano"],
  },
  {
    id: 3,
    title: "Pasta Vegetariana",
    type: "Cena",
    image: "/vegetarian-pasta.png",
    macros: { protein: 4, carbs: 20, fat: 3.2, calories: 125 },
    tags: ["Vegano"],
  },
  {
    id: 4,
    title: "Yogur con Nueces",
    type: "Snack",
    image: "/yogurt-nuts.jpg",
    macros: { protein: 5.3, carbs: 6.7, fat: 16.7, calories: 198 },
    tags: ["Alto en grasas", "Sin gluten"],
  },
  {
    id: 5,
    title: "Avena con Frutas",
    type: "Desayuno",
    image: "/oatmeal-fruits.jpg",
    macros: { protein: 2.5, carbs: 20, fat: 2.5, calories: 113 },
    tags: ["Balanceado"],
  },
  {
    id: 6,
    title: "Smoothie de Espinaca",
    type: "Desayuno",
    image: "/spinach-smoothie.jpg",
    macros: { protein: 8.7, carbs: 6.7, fat: 4, calories: 102.3 },
    tags: ["Alto en proteínas", "Sin gluten"],
  },
  {
    id: 7,
    title: "Pechuga de Pollo a la Plancha",
    type: "Almuerzo",
    image: "/grilled-chicken-breast.png",
    macros: { protein: 15, carbs: 5, fat: 4, calories: 116 },
    tags: ["Alto en proteínas"],
  },
  {
    id: 8,
    title: "Salmón al Horno con Espárragos",
    type: "Cena",
    image: "/salmon-asparagus.jpg",
    macros: { protein: 10, carbs: 6, fat: 6, calories: 118 },
    tags: ["Alto en proteínas", "Sin gluten"],
  },
  {
    id: 9,
    title: "Bowl de Arroz y Salmón",
    type: "Comida",
    image: "/salmon-rice-bowl.png",
    macros: { protein: 10, carbs: 18, fat: 7, calories: 185 },
    tags: ["Balanceado"],
  },
  {
    id: 10,
    title: "Tacos de Pavo",
    type: "Comida",
    image: "/turkey-tacos.jpg",
    macros: { protein: 9, carbs: 12, fat: 6, calories: 142 },
    tags: ["Alto en proteínas"],
  },
  {
    id: 11,
    title: "Wrap Integral de Pollo",
    type: "Almuerzo",
    image: "/chicken-wrap.png",
    macros: { protein: 12, carbs: 18, fat: 5, calories: 170 },
    tags: ["Alto en proteínas"],
  },
  {
    id: 12,
    title: "Crepes de Avena y Plátano",
    type: "Desayuno",
    image: "/oatmeal-crepes-banana.jpg",
    macros: { protein: 5, carbs: 30, fat: 2, calories: 160 },
    tags: ["Balanceado"],
  },
]

const MEAL_TYPES = ["Todos", "Desayuno", "Comida", "Almuerzo", "Cena", "Snack"]
const MACRO_FILTERS = ["Todos", "Alto en proteínas", "Alto en carbohidratos", "Alto en grasas", "Balanceado"]

export default function RecetasPage() {
  const [selectedMeal, setSelectedMeal] = useState("Todos")
  const [selectedMacro, setSelectedMacro] = useState("Todos")

  const filteredRecipes = useMemo(() => {
    return RECIPES_DATA.filter((recipe) => {
      const mealMatch = selectedMeal === "Todos" || recipe.type === selectedMeal
      const macroMatch = selectedMacro === "Todos" || recipe.tags.includes(selectedMacro)
      return mealMatch && macroMatch
    })
  }, [selectedMeal, selectedMacro])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      {/* Header */}
      <section className="py-8 sm:py-10 md:py-12 pt-24 sm:pt-28 md:pt-32 bg-black border-b border-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance text-white">Sabor & Músculo</h1>
          <p className="text-lg text-gray-400">Recetas reales · Ingredientes sencillos</p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur border-b border-gray-200 py-4 sm:py-5 md:py-6">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {/* Meal Type Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-black">Tipo de Comida</h3>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMeal(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedMeal === type
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Macro Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-black">Macronutriente</h3>
              <div className="flex flex-wrap gap-2">
                {MACRO_FILTERS.map((macro) => (
                  <button
                    key={macro}
                    onClick={() => setSelectedMacro(macro)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedMacro === macro
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {macro}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedMeal !== "Todos" || selectedMacro !== "Todos") && (
              <button
                onClick={() => {
                  setSelectedMeal("Todos")
                  setSelectedMacro("Todos")
                }}
                className="text-sm text-black hover:text-gray-600 transition-colors underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <p className="text-gray-500 text-lg">No hay recetas que coincidan con tus filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {filteredRecipes.map((recipe) => (
                <Link key={recipe.id} to={`/recetas/${recipe.id}`} className="group cursor-pointer">
                  <div className="bg-white overflow-hidden border border-gray-200 hover:border-black transition-all duration-300">
                    {/* Image */}
                    <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden bg-gray-100">
                      <img
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="text-lg font-semibold mb-2 text-black group-hover:text-gray-600 transition-colors">
                        {recipe.title}
                      </h3>

                      {/* Type Badge */}
                      <p className="text-xs text-black mb-3 font-medium uppercase tracking-wider">{recipe.type}</p>

                      {/* Macros */}
                      <div className="grid grid-cols-4 gap-2 text-xs mb-4">
                        <div className="bg-gray-100 p-2 text-center">
                          <p className="font-semibold text-black">{recipe.macros.protein.toFixed(1)}g</p>
                          <p className="text-gray-500">Proteína</p>
                        </div>
                        <div className="bg-gray-100 p-2 text-center">
                          <p className="font-semibold text-black">{recipe.macros.carbs.toFixed(1)}g</p>
                          <p className="text-gray-500">Carbs</p>
                        </div>
                        <div className="bg-gray-100 p-2 text-center">
                          <p className="font-semibold text-black">{recipe.macros.fat.toFixed(1)}g</p>
                          <p className="text-gray-500">Grasas</p>
                        </div>
                        <div className="bg-gray-100 p-2 text-center">
                          <p className="font-semibold text-black">{recipe.macros.calories.toFixed(0)}</p>
                          <p className="text-gray-500">kcal</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs bg-black text-white px-2 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
