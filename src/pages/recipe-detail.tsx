"use client"

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Navigation } from "../components/navigation"
import { ChevronLeft, Copy, Check } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"

const RECIPE_IMAGES = [
  "/avocado-toast-egg.png",
  "/colorful-quinoa-salad.png",
  "/vegetarian-pasta.png",
]

const RECIPE_MACROS = [
  { protein: 13.3, carbs: 10, fat: 12, calories: 201 },
  { protein: 7.5, carbs: 15, fat: 5, calories: 135 },
  { protein: 4, carbs: 20, fat: 3.2, calories: 125 },
]

export default function RecipeDetailPage() {
  const { id } = useParams()
  const [copiedSupp, setCopiedSupp] = useState<string | null>(null)
  const { t } = useTranslation()

  const recipes = t.recipeDetail.recipes.map((r, i) => ({
    id: i + 1,
    ...r,
    image: RECIPE_IMAGES[i],
    macros: RECIPE_MACROS[i],
  }))

  const recipe = recipes.find((r) => r.id === Number.parseInt(id || "0"))

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t.recipeDetail.notFound}</h1>
          <Link to="/recetas" className="text-primary hover:underline">
            {t.recipeDetail.backLink}
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
          {t.recipeDetail.backToRecipes}
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
                  <p className="text-xs text-muted-foreground mb-1">{t.recipeDetail.time}</p>
                  <p className="font-semibold">{recipe.prepTime}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.recipeDetail.difficulty}</p>
                  <p className="font-semibold">{recipe.difficulty}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.recipeDetail.servings}</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-3 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{recipe.macros.protein.toFixed(1)}g</p>
                  <p className="text-xs text-muted-foreground">{t.recipeDetail.protein}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{recipe.macros.carbs.toFixed(1)}g</p>
                  <p className="text-xs text-muted-foreground">{t.recipeDetail.carbs}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{recipe.macros.fat.toFixed(1)}g</p>
                  <p className="text-xs text-muted-foreground">{t.recipeDetail.fats}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{recipe.macros.calories.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">{t.recipeDetail.calories}</p>
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
                <h2 className="text-2xl font-bold mb-4">{t.recipeDetail.ingredients}</h2>
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
                <h2 className="text-2xl font-bold mb-4">{t.recipeDetail.instructions}</h2>
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
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">💊 {t.recipeDetail.supplements}</h3>
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
                <h3 className="text-lg font-bold mb-4">💡 {t.recipeDetail.recommendations}</h3>
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
                <h3 className="font-semibold mb-3">{t.recipeDetail.characteristics}</h3>
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
          <h2 className="text-2xl font-bold mb-8">{t.recipeDetail.relatedRecipes}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recipes.filter((r) => r.id !== recipe.id)
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
