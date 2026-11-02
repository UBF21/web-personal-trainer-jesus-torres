import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GOALS, LEVELS, PHASE_NAMES, type Exercise, type NutritionGuide, type RoutineDay, type TrainingProgram } from "@/lib/mock-data"

export const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean)

/** Editor del programa de entrenamiento: datos generales, rutina por día y notas. */
export function ProgramEditor({
  program,
  onSave,
  onCancel,
}: {
  program: TrainingProgram
  onSave: (program: TrainingProgram) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<TrainingProgram>(() => clone(program))
  const [dayIndex, setDayIndex] = useState(0)
  const day = draft.routine[dayIndex]

  const setField = <K extends keyof TrainingProgram>(key: K, value: TrainingProgram[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))
  const updateDay = (patch: Partial<RoutineDay>) =>
    setDraft((d) => ({ ...d, routine: d.routine.map((r, i) => (i === dayIndex ? { ...r, ...patch } : r)) }))
  const updateExercise = (index: number, patch: Partial<Exercise>) =>
    updateDay({ exercises: day.exercises.map((e, i) => (i === index ? { ...e, ...patch } : e)) })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...draft,
      phaseNumber: PHASE_NAMES.indexOf(draft.phase) + 1,
      notes: draft.notes.trim(),
      updated: "Ahora mismo",
      // Los ejercicios sin nombre se descartan; sin esquema queda "—"
      routine: draft.routine.map((r) => ({
        ...r,
        focus: r.focus.trim() || "Sin enfoque",
        exercises: r.exercises
          .filter((x) => x.name.trim())
          .map((x) => ({ name: x.name.trim(), scheme: x.scheme.trim() || "—" })),
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="edit-goal">Objetivo</Label>
          <select id="edit-goal" value={draft.goal} onChange={(e) => setField("goal", e.target.value)} className={SELECT_CLASS}>
            {GOALS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-level">Nivel</Label>
          <select id="edit-level" value={draft.level} onChange={(e) => setField("level", e.target.value)} className={SELECT_CLASS}>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-days">Sesiones por semana</Label>
          <select
            id="edit-days"
            value={draft.perWeek}
            onChange={(e) => setField("perWeek", Number(e.target.value))}
            className={SELECT_CLASS}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-phase">Fase actual</Label>
          <select id="edit-phase" value={draft.phase} onChange={(e) => setField("phase", e.target.value)} className={SELECT_CLASS}>
            {PHASE_NAMES.map((p, i) => (
              <option key={p} value={p}>
                Fase {i + 1} · {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Rutina semanal</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {draft.routine.map((d, i) => (
            <button
              key={d.day}
              type="button"
              onClick={() => setDayIndex(i)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                i === dayIndex ? "bg-black text-white shadow" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.day}
            </button>
          ))}
        </div>

        <div className="space-y-4 rounded-xl border border-border p-4">
          <div className="space-y-2">
            <Label htmlFor="edit-focus">Enfoque del día</Label>
            <Input id="edit-focus" value={day.focus} onChange={(e) => updateDay({ focus: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Ejercicios</Label>
            {day.exercises.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin ejercicios: este día queda como descanso.</p>
            )}
            {day.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                  {i + 1}
                </span>
                <Input
                  aria-label={`Ejercicio ${i + 1}`}
                  placeholder="Ejercicio"
                  value={ex.name}
                  onChange={(e) => updateExercise(i, { name: e.target.value })}
                  className="flex-1"
                />
                <Input
                  aria-label={`Series o duración del ejercicio ${i + 1}`}
                  placeholder="4×8"
                  value={ex.scheme === "—" ? "" : ex.scheme}
                  onChange={(e) => updateExercise(i, { scheme: e.target.value })}
                  className="w-28"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Quitar ejercicio ${i + 1}`}
                  onClick={() => updateDay({ exercises: day.exercises.filter((_, k) => k !== i) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => updateDay({ exercises: [...day.exercises, { name: "", scheme: "" }] })}
            >
              <Plus className="h-4 w-4" />
              Añadir ejercicio
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-notes">Notas del entrenador</Label>
        <Textarea id="edit-notes" rows={3} value={draft.notes} onChange={(e) => setField("notes", e.target.value)} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  )
}

/** Editor de la guía de nutrición: macros, comidas, hidratación, suplementación y notas. */
export function NutritionEditor({
  guide,
  onSave,
  onCancel,
}: {
  guide: NutritionGuide
  onSave: (guide: NutritionGuide) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<NutritionGuide>(() => clone(guide))

  const setNumber = (key: "calories" | "protein" | "carbs" | "fats", value: string) =>
    setDraft((d) => ({ ...d, [key]: Math.max(0, Math.round(Number(value) || 0)) }))
  const updateMeal = (index: number, patch: Partial<NutritionGuide["meals"][number]>) =>
    setDraft((d) => ({ ...d, meals: d.meals.map((m, i) => (i === index ? { ...m, ...patch } : m)) }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...draft,
      water: draft.water.trim(),
      notes: draft.notes.trim(),
      supplements: draft.supplements.map((s) => s.trim()).filter(Boolean),
      meals: draft.meals
        .filter((m) => m.name.trim())
        .map((m) => ({ ...m, name: m.name.trim(), foods: m.foods.map((f) => f.trim()).filter(Boolean) })),
      updated: "Ahora mismo",
    })
  }

  const macros = [
    { key: "calories", label: "Calorías (kcal)" },
    { key: "protein", label: "Proteína (g)" },
    { key: "carbs", label: "Carbohidratos (g)" },
    { key: "fats", label: "Grasas (g)" },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {macros.map((m) => (
          <div key={m.key} className="space-y-2">
            <Label htmlFor={`nut-${m.key}`}>{m.label}</Label>
            <Input
              id={`nut-${m.key}`}
              type="number"
              min={0}
              value={draft[m.key]}
              onChange={(e) => setNumber(m.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Comidas del día</p>
        {draft.meals.map((meal, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`meal-name-${i}`}>Comida</Label>
                <Input id={`meal-name-${i}`} value={meal.name} onChange={(e) => updateMeal(i, { name: e.target.value })} />
              </div>
              <div className="w-32 space-y-2">
                <Label htmlFor={`meal-time-${i}`}>Hora</Label>
                <Input id={`meal-time-${i}`} type="time" value={meal.time} onChange={(e) => updateMeal(i, { time: e.target.value })} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Quitar ${meal.name || "comida"}`}
                onClick={() => setDraft((d) => ({ ...d, meals: d.meals.filter((_, k) => k !== i) }))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`meal-foods-${i}`}>Alimentos (uno por línea)</Label>
              <Textarea
                id={`meal-foods-${i}`}
                rows={3}
                value={meal.foods.join("\n")}
                onChange={(e) => updateMeal(i, { foods: e.target.value.split("\n") })}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setDraft((d) => ({ ...d, meals: [...d.meals, { name: "", time: "12:00", foods: [] }] }))}
        >
          <Plus className="h-4 w-4" />
          Añadir comida
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nut-water">Hidratación</Label>
          <Textarea id="nut-water" rows={3} value={draft.water} onChange={(e) => setDraft((d) => ({ ...d, water: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nut-supp">Suplementación recomendada (una por línea)</Label>
          <Textarea
            id="nut-supp"
            rows={3}
            value={draft.supplements.join("\n")}
            onChange={(e) => setDraft((d) => ({ ...d, supplements: e.target.value.split("\n") }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nut-notes">Notas del entrenador</Label>
        <Textarea id="nut-notes" rows={3} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  )
}
