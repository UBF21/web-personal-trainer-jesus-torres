import { Link } from "react-router-dom"
import { CalendarDays, Dumbbell, Flame, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useClients } from "@/contexts/clients-context"
import { APPOINTMENTS, getClientDetail } from "@/lib/mock-data"
import Dashboard from "./dashboard"
import { MockNotice, PageHeader, StatCard } from "./panel-ui"

function ClientOverview({ name, email }: { name: string; email: string }) {
  const { clients } = useClients()
  const client = clients.find((c) => c.email === email)

  // Persona registrada que todavía no tiene un plan aprobado
  if (!client) {
    return (
      <>
        <PageHeader title={`Hola, ${name.split(" ")[0]}`} description="Aún no tienes un plan activo." />
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-muted-foreground">
              Elige un plan en la web y envía tu comprobante de transferencia. Cuando lo aprobemos, aquí verás tu
              entrenamiento y tu progreso.
            </p>
            <Button asChild>
              <Link to="/">Ver planes</Link>
            </Button>
          </CardContent>
        </Card>
      </>
    )
  }

  const d = getClientDetail(client)
  const mine = APPOINTMENTS.filter((a) => a.client === client.name)
  const next = mine[0]

  return (
    <>
      <PageHeader title={`Hola, ${name.split(" ")[0]}`} description="Este es el resumen de tu entrenamiento." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Dumbbell} label="Sesiones completadas" value={String(d.sessionsDone)} hint={`de ${d.sessionsTotal} del plan`} />
        <StatCard icon={Flame} label="Racha actual" value={`${d.streakWeeks} ${d.streakWeeks === 1 ? "semana" : "semanas"}`} hint="¡Sigue así!" />
        <StatCard icon={Target} label="Peso actual" value={`${d.currentWeight} kg`} hint={`Objetivo: ${d.goalWeight} kg`} />
        <StatCard icon={CalendarDays} label="Próxima sesión" value={next ? `${next.day} ${next.time}` : "—"} hint={next?.type ?? "Sin sesiones programadas"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{client.plan}</CardTitle>
            <CardDescription>
              Semana {d.weeksDone} de {d.totalWeeks} · {d.plan?.duration} · vence {d.endsOn}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={client.progress} />
            <p className="text-sm text-muted-foreground">Llevas el {client.progress} % de tu plan.</p>
            <Button asChild variant="outline">
              <Link to="/panel/plan">Ver mi plan</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis próximas citas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mine.length === 0 && <p className="text-sm text-muted-foreground">No tienes citas programadas.</p>}
            {mine.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-semibold">{a.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.day} · {a.time} · {a.place}
                  </p>
                </div>
                <Badge variant={a.status === "Confirmada" ? "default" : "secondary"}>{a.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

/** El cliente ve su resumen; el administrador y el webmaster ven el dashboard de la plataforma. */
export default function Overview() {
  const { user } = useAuth()
  if (!user) return null

  if (user.role !== "cliente") return <Dashboard />

  return (
    <>
      <ClientOverview name={user.name} email={user.email} />
      <MockNotice />
    </>
  )
}
