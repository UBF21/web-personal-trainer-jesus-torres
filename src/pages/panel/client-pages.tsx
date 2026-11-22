import { useEffect } from "react"
import { Link } from "react-router-dom"
import { Check, Salad, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useClients } from "@/contexts/clients-context"
import { APPOINTMENTS, buildNutritionGuide, buildWeightSeries, getClientDetail } from "@/lib/mock-data"
import { NutritionGuideContent, WeightChart } from "./client-detail"
import { MockNotice, PageHeader } from "./panel-ui"

/** El cliente con sesión, buscado por correo; null si aún no tiene un plan aprobado. */
export function useMyClient() {
  const { user } = useAuth()
  const { clients } = useClients()
  return clients.find((c) => c.email === user?.email) ?? null
}

function NoPlanYet() {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <p className="text-muted-foreground">Aún no tienes un plan activo. Elige uno en la web y envía tu comprobante.</p>
        <Button asChild>
          <Link to="/">Ver planes</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function ClientPlan() {
  const client = useMyClient()
  const { programs, loadProgram, nutrition: nutritionSaved, loadNutrition, weightLogs, loadWeightLogs } = useClients()

  useEffect(() => {
    if (!client) return
    loadProgram(client.id)
    loadNutrition(client.id)
    loadWeightLogs(client.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id])

  if (!client) {
    return (
      <>
        <PageHeader title="Mi plan" />
        <NoPlanYet />
      </>
    )
  }

  const d = getClientDetail(client)
  const logs = weightLogs[client.id] ?? []
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : (client.startWeight ?? 70)
  const weightSeries = buildWeightSeries(logs)
  const toGoal =
    currentWeight != null && client.goalWeight != null ? Math.round((currentWeight - client.goalWeight) * 10) / 10 : null
  const nutrition =
    nutritionSaved[client.id] ?? buildNutritionGuide(currentWeight, programs[client.id]?.goal ?? d.program.goal)

  return (
    <>
      <PageHeader title="Mi plan" description={`${client.plan} · Semana ${d.weeksDone} de ${d.totalWeeks}`} />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="self-start lg:col-span-2">
          <CardContent className="space-y-2 p-5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progreso del plan</span>
              <span className="text-muted-foreground">{client.progress} %</span>
            </div>
            <Progress value={client.progress} />
            <p className="text-xs text-muted-foreground">
              {d.plan?.duration} · inicio {client.since} · vence {d.endsOn}
            </p>
          </CardContent>
        </Card>

        {d.plan && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lo que incluye</CardTitle>
              <CardDescription>{d.plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {d.plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <h2 className="mb-3 text-lg font-bold">Rutina semanal</h2>
      {!programs[client.id] && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground">
            Tu entrenador está preparando tu programa de entrenamiento a medida. Te avisaremos cuando esté listo.
          </CardContent>
        </Card>
      )}
      <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${programs[client.id] ? "" : "hidden"}`}>
        {(programs[client.id]?.routine ?? []).map((day) => (
          <Card key={day.day}>
            <CardHeader>
              <CardTitle className="text-lg">{day.day}</CardTitle>
              <CardDescription>{day.focus}</CardDescription>
            </CardHeader>
            <CardContent>
              {day.exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">Descanso</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {day.exercises.map((e, i) => (
                    <li key={`${e.name}-${i}`} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                      {e.name}
                      {e.scheme !== "—" && <span className="ml-auto font-semibold tabular-nums">{e.scheme}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {client.startWeight != null && client.goalWeight != null && (
        <>
          <h2 className="mb-3 mt-8 flex items-center gap-2 text-lg font-bold">
            <Target className="h-5 w-5" />
            Evolución de peso
          </h2>
          <Card>
            <CardContent className="space-y-6 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Peso inicial", value: `${client.startWeight} kg` },
                  { label: "Peso actual", value: currentWeight != null ? `${currentWeight} kg` : "Sin registros" },
                  {
                    label: "Objetivo",
                    value: `${client.goalWeight} kg`,
                    hint: toGoal == null ? undefined : toGoal > 0 ? `Te faltan ${toGoal} kg` : "¡Objetivo logrado!",
                  },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold">{m.value}</p>
                    {m.hint && <p className="text-xs text-muted-foreground">{m.hint}</p>}
                  </div>
                ))}
              </div>
              {weightSeries.length >= 2 ? (
                <WeightChart series={weightSeries} goal={client.goalWeight} />
              ) : (
                <p className="text-sm text-muted-foreground">Todavía no hay suficientes registros para graficar la evolución.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <h2 className="mb-3 mt-8 flex items-center gap-2 text-lg font-bold">
        <Salad className="h-5 w-5" />
        Guía de nutrición
      </h2>
      <Card>
        <CardContent className="p-5">
          <NutritionGuideContent guide={nutrition} canEdit={false} onSave={() => {}} />
        </CardContent>
      </Card>

      <MockNotice />
    </>
  )
}

export function ClientAppointments() {
  const client = useMyClient()
  const mine = APPOINTMENTS.filter((a) => a.client === client?.name)

  return (
    <>
      <PageHeader title="Mis citas" description="Tus próximas sesiones de entrenamiento." />
      {mine.length === 0 && <p className="text-muted-foreground">No tienes citas programadas.</p>}
      <div className="space-y-3">
        {mine.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold">{a.type}</p>
                <p className="text-sm text-muted-foreground">
                  {a.day} · {a.time} · {a.place}
                </p>
              </div>
              <Badge variant={a.status === "Confirmada" ? "default" : "secondary"}>{a.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <MockNotice />
    </>
  )
}
