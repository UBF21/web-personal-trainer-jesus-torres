"use client"

import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Navigation } from "../components/navigation"
import { useTranslation } from "@/contexts/language-context"

const RECIPE_IMAGES = [
  "/avocado-toast-egg.png",
  "/colorful-quinoa-salad.png",
  "/vegetarian-pasta.png",
  "/yogurt-nuts.jpg",
  "/oatmeal-fruits.jpg",
  "/spinach-smoothie.jpg",
  "/grilled-chicken-breast.png",
  "/salmon-asparagus.jpg",
  "/salmon-rice-bowl.png",
  "/turkey-tacos.jpg",
  "/chicken-wrap.png",
  "/oatmeal-crepes-banana.jpg",
]

const RECIPE_MACROS = [
  { protein: 13.3, carbs: 10, fat: 12, calories: 201 },
  { protein: 7.5, carbs: 15, fat: 5, calories: 135 },
  { protein: 4, carbs: 20, fat: 3.2, calories: 125 },
  { protein: 5.3, carbs: 6.7, fat: 16.7, calories: 198 },
  { protein: 2.5, carbs: 20, fat: 2.5, calories: 113 },
  { protein: 8.7, carbs: 6.7, fat: 4, calories: 102.3 },
  { protein: 15, carbs: 5, fat: 4, calories: 116 },
  { protein: 10, carbs: 6, fat: 6, calories: 118 },
  { protein: 10, carbs: 18, fat: 7, calories: 185 },
  { protein: 9, carbs: 12, fat: 6, calories: 142 },
  { protein: 12, carbs: 18, fat: 5, calories: 170 },
  { protein: 5, carbs: 30, fat: 2, calories: 160 },
]

export default function RecetasPage() {
  const [selectedMealIdx, setSelectedMealIdx] = useState(0)
  const [selectedMacroIdx, setSelectedMacroIdx] = useState(0)
  const { t } = useTranslation()

  const recipes = t.recetas.recipes.map((r, i) => ({
    id: i + 1,
    ...r,
    image: RECIPE_IMAGES[i],
    macros: RECIPE_MACROS[i],
  }))

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const mealMatch = selectedMealIdx === 0 || recipe.type === t.recetas.mealTypes[selectedMealIdx]
      const macroMatch = selectedMacroIdx === 0 || recipe.tags.includes(t.recetas.macroFilters[selectedMacroIdx])
      return mealMatch && macroMatch
    })
  }, [selectedMealIdx, selectedMacroIdx, t])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      {/* Header */}
      <section className="py-8 sm:py-10 md:py-12 pt-24 sm:pt-28 md:pt-32 bg-black border-b border-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-balance text-white">{t.recetas.pageTitle}</h1>
          <p className="text-lg text-gray-400">{t.recetas.pageSubtitle}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur border-b border-gray-200 py-4 sm:py-5 md:py-6">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {/* Meal Type Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-black">{t.recetas.mealTypeLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {t.recetas.mealTypes.map((type, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMealIdx(idx)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedMealIdx === idx
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
              <h3 className="text-sm font-semibold mb-3 text-black">{t.recetas.macroLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {t.recetas.macroFilters.map((macro, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMacroIdx(idx)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedMacroIdx === idx
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
            {(selectedMealIdx !== 0 || selectedMacroIdx !== 0) && (
              <button
                onClick={() => {
                  setSelectedMealIdx(0)
                  setSelectedMacroIdx(0)
                }}
                className="text-sm text-black hover:text-gray-600 transition-colors underline"
              >
                {t.recetas.clearFilters}
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
              <p className="text-gray-500 text-lg">{t.recetas.noResults}</p>
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
                          <p className="text-gray-500">{t.recetas.protein}</p>
                        </div>
                        <div className="bg-gray-100 p-2 text-center">
                          <p className="font-semibold text-black">{recipe.macros.carbs.toFixed(1)}g</p>
                          <p className="text-gray-500">{t.recetas.carbs}</p>
                        </div>
                        <div className="bg-gray-100 p-2 text-center">
                          <p className="font-semibold text-black">{recipe.macros.fat.toFixed(1)}g</p>
                          <p className="text-gray-500">{t.recetas.fats}</p>
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

          {/* Comprar Recetario Button */}
          <div className="flex justify-center mt-12 sm:mt-16">
            <a
              href="https://www.amazon.es/dp/B0GMD97XMT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold border border-black hover:bg-white hover:text-black transition-colors"
            >
              {t.recetas.buyComplete}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
