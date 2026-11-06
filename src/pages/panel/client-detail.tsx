import { useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft, CalendarClock, ClipboardList, Clock, Droplets, Layers, Pencil, Pill, Plus, Repeat, Salad, Signal, Target, type LucideIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatBubble } from "@/components/chat-bubble"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useClients } from "@/contexts/clients-context"
import { toast } from "@/hooks/use-toast"
import { GOALS, LEVELS, baseRoutine, buildNutritionGuide, getClientDetail, type NutritionGuide, type TrainingProgram } from "@/lib/mock-data"
import { NutritionEditor, ProgramEditor, SELECT_CLASS } from "./client-editors"
import { MockNotice } from "./panel-ui"

const STATUS_VARIANT = { Activo: "default", Nuevo: "secondary", Pausado: "outline" } as const

/** Evolución del peso en las últimas semanas (SVG simple, sin librerías). */
function WeightChart({ series, goal }: { series: { label: string; kg: number }[]; goal: number }) {
  const width = 560
  const height = 200
  const pad = { top: 16, right: 16, bottom: 28, left: 40 }
  const values = [...series.map((s) => s.kg), goal]
  const min = Math.floor(Math.min(...values) - 1)
  const max = Math.ceil(Math.max(...values) + 1)
  const x = (i: number) => pad.left + (i * (width - pad.left - pad.right)) / (series.length - 1)
  const y = (kg: number) => pad.top + ((max - kg) * (height - pad.top - pad.bottom)) / (max - min)
  const line = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(s.kg)}`).join(" ")
  const ticks = [min, Math.round((min + max) / 2), max]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Evolución del peso">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="3 4" />
          <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
            {t}
          </text>
        </g>
      ))}
      <line x1={pad.left} x2={width - pad.right} y1={y(goal)} y2={y(goal)} stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" />
      <text x={width - pad.right} y={y(goal) - 6} textAnchor="end" className="fill-orange-500 text-[11px] font-semibold">
        Objetivo {goal} kg
      </text>
      <path d={line} fill="none" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {series.map((s, i) => (
        <g key={s.label}>
          <circle cx={x(i)} cy={y(s.kg)} r="4" fill="#000" />
          <text x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** Módulo plegable: cabecera clicable (se retrae/expande) con icono, título, descripción y una etiqueta opcional. */
function ModuleItem({
  value,
  icon: Icon,
  title,
  description,
  badge,
  children,
}: {
  value: string
  icon: LucideIcon
  title: string
  description: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <AccordionItem value={value} className="overflow-hidden rounded-xl border bg-card shadow-sm last:border-b">
      <AccordionTrigger className="items-center px-6 py-5 hover:no-underline">
        <div className="flex flex-1 flex-wrap items-center justify-between gap-3 pr-2">
          <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-base font-semibold leading-tight">{title}</p>
              <p className="mt-1 text-sm font-normal text-muted-foreground">{description}</p>
            </div>
          </div>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">{children}</AccordionContent>
    </AccordionItem>
  )
}

/** Botón "Editar" alineado a la derecha, solo para quien puede editar (administrador y webmaster). */
function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="mb-4 flex justify-end">
      <Button type="button" variant="outline" size="sm" onClick={onClick} className="gap-2">
        <Pencil className="h-4 w-4" />
        {label}
      </Button>
    </div>
  )
}

/** Contenido del programa: resumen, rutina por día y notas. Con permiso se puede editar. */
function TrainingProgramContent({
  program,
  canEdit,
  onSave,
}: {
  program: TrainingProgram
  canEdit: boolean
  onSave: (program: TrainingProgram) => void
}) {
  const [editing, setEditing] = useState(false)
  const [dayIndex, setDayIndex] = useState(0)
  const day = program.routine[dayIndex]
  const isRest = day.exercises.length === 0

  if (editing) {
    return (
      <ProgramEditor
        program={program}
        onCancel={() => setEditing(false)}
        onSave={(p) => {
          onSave(p)
          setEditing(false)
        }}
      />
    )
  }

  const summary = [
    { icon: Target, label: "Objetivo", value: program.goal },
    { icon: Signal, label: "Nivel", value: program.level },
    { icon: Repeat, label: "Frecuencia", value: `${program.perWeek} sesiones por semana` },
    { icon: Layers, label: "Fase actual", value: `Fase ${program.phaseNumber} · ${program.phase}` },
  ]

  return (
    <div>
      {canEdit && <EditButton label="Editar programa" onClick={() => setEditing(true)} />}
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {program.routine.map((d, i) => (
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

          <div className="rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-semibold">{day.focus}</p>
              <span className="text-xs text-muted-foreground">{isRest ? "Recuperación" : `${day.exercises.length} ejercicios`}</span>
            </div>
            {isRest ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">Descanso. La recuperación también es parte del programa.</p>
            ) : (
              <ul className="divide-y divide-border">
                {day.exercises.map((e, i) => (
                  <li key={`${e.name}-${i}`} className="flex items-center gap-4 px-4 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{e.name}</span>
                    {e.scheme !== "—" && (
                      <span className="rounded-md bg-muted px-2.5 py-1 text-sm font-semibold tabular-nums">{e.scheme}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-muted/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notas del entrenador</p>
          <p className="mt-1 text-sm">{program.notes}</p>
        </div>
      </div>
    </div>
  )
}

/** Contenido de la guía de nutrición: macros diarios, comidas, hidratación y suplementación. Con permiso se puede editar. */
function NutritionGuideContent({
  guide,
  canEdit,
  onSave,
}: {
  guide: NutritionGuide
  canEdit: boolean
  onSave: (guide: NutritionGuide) => void
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <NutritionEditor
        guide={guide}
        onCancel={() => setEditing(false)}
        onSave={(g) => {
          onSave(g)
          setEditing(false)
        }}
      />
    )
  }

  const macros = [
    { label: "Calorías", value: guide.calories, unit: "kcal" },
    { label: "Proteína", value: guide.protein, unit: "g" },
    { label: "Carbohidratos", value: guide.carbs, unit: "g" },
    { label: "Grasas", value: guide.fats, unit: "g" },
  ]

  return (
    <div>
      {canEdit && <EditButton label="Editar guía" onClick={() => setEditing(true)} />}
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {macros.map((m) => (
            <div key={m.label} className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">{m.label} diarias</p>
              <p className="text-xl font-bold tabular-nums">
                {m.value}
                <span className="ml-1 text-sm font-normal text-muted-foreground">{m.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {guide.meals.map((meal, i) => (
            <div key={`${meal.name}-${i}`} className="rounded-xl border border-border">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <p className="font-semibold">{meal.name}</p>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {meal.time}
                </span>
              </div>
              <ul className="space-y-1.5 px-4 py-3 text-sm">
                {meal.foods.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Droplets className="h-4 w-4" />
              Hidratación
            </p>
            <p className="text-sm text-muted-foreground">{guide.water}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Pill className="h-4 w-4" />
              Suplementación recomendada
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {guide.supplements.map((sup) => (
                <li key={sup}>{sup}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg bg-muted/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notas del entrenador</p>
          <p className="mt-1 text-sm">{guide.notes}</p>
        </div>
      </div>
    </div>
  )
}

/** Estado vacío del programa: el entrenador lo crea desde aquí. */
function EmptyProgramContent({ clientName, onCreate }: { clientName: string; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <ClipboardList className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="max-w-md text-sm text-muted-foreground">
        {clientName} todavía no tiene un programa. Crea uno según su objetivo, su nivel y los días que puede entrenar.
      </p>
      <Button onClick={onCreate} className="gap-2">
        <Plus className="h-4 w-4" />
        Crear programa a medida
      </Button>
    </div>
  )
}

function CreateProgramDialog({
  open,
  clientName,
  onClose,
  onCreate,
}: {
  open: boolean
  clientName: string
  onClose: () => void
  onCreate: (program: TrainingProgram) => void
}) {
  const [goal, setGoal] = useState(GOALS[0])
  const [level, setLevel] = useState(LEVELS[0])
  const [perWeek, setPerWeek] = useState(3)
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      goal,
      level,
      perWeek,
      phase: "Adaptación y técnica",
      phaseNumber: 1,
      updated: "Ahora mismo",
      notes: notes.trim() || "Priorizamos la técnica y la movilidad antes de subir cargas.",
      routine: baseRoutine(),
    })
    setGoal(GOALS[0])
    setLevel(LEVELS[0])
    setPerWeek(3)
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear programa a medida</DialogTitle>
          <DialogDescription>Para {clientName}. Empieza con una rutina semanal base que luego puedes ajustar.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program-goal">Objetivo</Label>
            <select id="program-goal" value={goal} onChange={(e) => setGoal(e.target.value)} className={SELECT_CLASS}>
              {GOALS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program-level">Nivel</Label>
              <select id="program-level" value={level} onChange={(e) => setLevel(e.target.value)} className={SELECT_CLASS}>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="program-days">Sesiones por semana</Label>
              <select
                id="program-days"
                value={perWeek}
                onChange={(e) => setPerWeek(Number(e.target.value))}
                className={SELECT_CLASS}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="program-notes">Notas para el cliente (opcional)</Label>
            <Textarea
              id="program-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Indicaciones de técnica, nutrición, descanso…"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear programa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { clients, programs, createProgram, updateProgram, nutrition: nutritionSaved, saveNutrition } = useClients()
  const [creating, setCreating] = useState(false)
  const client = clients.find((c) => String(c.id) === id)

  if (!client) return <Navigate to="/panel/clientes" replace />

  const d = getClientDetail(client)
  // La guía se adapta al objetivo del programa (si todavía no hay programa, al objetivo previsto)
  const nutrition = nutritionSaved[client.id] ?? buildNutritionGuide(d.currentWeight, programs[client.id]?.goal ?? d.program.goal)
  // Solo el administrador y el webmaster editan el programa y la guía
  const canEdit = user?.role === "administrador" || user?.role === "webmaster"
  const initials = client.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const toGoal = Math.round((d.currentWeight - d.goalWeight) * 10) / 10

  return (
    <>
      <Link
        to="/panel/clientes"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{client.name}</h1>
            <Badge variant={STATUS_VARIANT[client.status]}>{client.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            {client.email} · Cliente desde {client.since}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Plan contratado</CardTitle>
            <CardDescription>Detalles de su suscripción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xl font-bold">{client.plan}</p>
              {d.plan && (
                <p className="text-2xl font-bold">
                  {d.plan.price} €<span className="text-sm font-normal text-muted-foreground"> EUR · {d.plan.duration}</span>
                </p>
              )}
              {d.plan && <p className="mt-1 text-sm text-muted-foreground">{d.plan.description}</p>}
            </div>

            {d.plan && (
              <ul className="space-y-1.5 text-sm">
                {d.plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <dl className="space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Duración</dt>
                <dd className="font-medium">{d.plan?.duration ?? `${d.totalWeeks} semanas`}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Inicio</dt>
                <dd className="font-medium">{client.since}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Vence
                </dt>
                <dd className="font-medium">{d.endsOn}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Método de pago</dt>
                <dd className="font-medium">{d.paymentMethod}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progreso</CardTitle>
            <CardDescription>Avance del plan y evolución de su peso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Avance del plan</span>
                <span className="text-muted-foreground">{client.progress} %</span>
              </div>
              <Progress value={client.progress} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Peso inicial", value: `${d.startWeight} kg` },
                { label: "Peso actual", value: `${d.currentWeight} kg` },
                { label: "Objetivo", value: `${d.goalWeight} kg`, hint: toGoal > 0 ? `Le faltan ${toGoal} kg` : "¡Objetivo logrado!" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-border p-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {m.label === "Objetivo" && <Target className="h-3.5 w-3.5" />}
                    {m.label}
                  </p>
                  <p className="text-lg font-bold">{m.value}</p>
                  {m.hint && <p className="text-xs text-muted-foreground">{m.hint}</p>}
                </div>
              ))}
            </div>

            <WeightChart series={d.weightSeries} goal={d.goalWeight} />
          </CardContent>
        </Card>
      </div>

      <Accordion type="multiple" defaultValue={["programa", "nutricion"]} className="mt-6 space-y-6">
        <ModuleItem
          value="programa"
          icon={ClipboardList}
          title="Programa de entrenamiento hecho a medida"
          description={
            programs[client.id] ? "Diseñado para este cliente según su objetivo y su evolución." : "Aún no tiene un programa creado."
          }
          badge={programs[client.id] ? `Actualizado ${programs[client.id]!.updated.toLowerCase()}` : undefined}
        >
          {programs[client.id] ? (
            <TrainingProgramContent
              program={programs[client.id]!}
              canEdit={canEdit}
              onSave={(p) => {
                updateProgram(client.id, p)
                toast({ title: "Programa actualizado", description: `Se guardaron los cambios del programa de ${client.name}.` })
              }}
            />
          ) : (
            <EmptyProgramContent clientName={client.name} onCreate={() => setCreating(true)} />
          )}
        </ModuleItem>

        <ModuleItem
          value="nutricion"
          icon={Salad}
          title="Guía de nutrición adecuada al cliente"
          description="Calorías, macros y comidas según su peso y su objetivo."
          badge={`Actualizado ${nutrition.updated.toLowerCase()}`}
        >
          <NutritionGuideContent
            guide={nutrition}
            canEdit={canEdit}
            onSave={(g) => {
              saveNutrition(client.id, g)
              toast({ title: "Guía actualizada", description: `Se guardaron los cambios de la guía de nutrición de ${client.name}.` })
            }}
          />
        </ModuleItem>
      </Accordion>
      <CreateProgramDialog
        open={creating}
        clientName={client.name}
        onClose={() => setCreating(false)}
        onCreate={(program) => {
          createProgram(client.id, program)
          setCreating(false)
          toast({ title: "Programa creado", description: `${client.name} ya tiene su programa de entrenamiento a medida.` })
        }}
      />

      <ChatBubble title={`Chat con ${client.name}`} clientId={client.id} senderRole="entrenador" senderName="Jesús Torres" />


      <MockNotice />
    </>
  )
}
