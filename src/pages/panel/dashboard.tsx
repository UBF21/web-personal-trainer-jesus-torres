import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Crown, MousePointerClick, TrendingDown, TrendingUp, UserCheck, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import { useClients } from "@/contexts/clients-context"
import {
  getInteractionBreakdown,
  getPlanPopularity,
  getSeries,
  getTotals,
  getUserActivity,
  type DayPoint,
  type Period,
} from "@/lib/analytics-mock"
import { MockNotice, PageHeader } from "./panel-ui"

const nf = new Intl.NumberFormat("es-ES")

/** Variación frente al periodo anterior, con flecha y color. */
function Delta({ value }: { value: number }) {
  const up = value >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : ""}
      {value.toLocaleString("es-ES")} %
    </span>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  footer,
}: {
  icon: typeof Users
  label: string
  value: string
  footer: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <div className="mt-0.5 text-xs text-muted-foreground">{footer}</div>
        </div>
      </CardContent>
    </Card>
  )
}

/** Visitantes e interacciones por día (SVG sin librerías). */
function TrafficChart({ series }: { series: DayPoint[] }) {
  const width = 640
  const height = 240
  const pad = { top: 16, right: 16, bottom: 30, left: 40 }
  const max = Math.ceil(Math.max(...series.map((s) => s.visitors)) / 20) * 20
  const x = (i: number) => pad.left + (i * (width - pad.left - pad.right)) / (series.length - 1)
  const y = (v: number) => pad.top + ((max - v) * (height - pad.top - pad.bottom)) / max
  const path = (key: "visitors" | "interactions") => series.map((s, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(s[key])}`).join(" ")
  const area = `${path("visitors")} L${x(series.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const ticks = [0, max / 2, max]
  // En 30 días solo se rotulan algunos días para que no se amontonen
  const every = series.length > 10 ? Math.ceil(series.length / 6) : 1

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Visitantes e interacciones por día">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="3 4" />
          <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
            {t}
          </text>
        </g>
      ))}
      <path d={area} fill="#000" fillOpacity="0.06" />
      <path d={path("visitors")} fill="none" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d={path("interactions")} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {series.map((s, i) => (
        <g key={s.label}>
          {series.length <= 10 && <circle cx={x(i)} cy={y(s.visitors)} r="3.5" fill="#000" />}
          {(i % every === 0 || i === series.length - 1) && (
            <text x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
              {s.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { clients, pending } = useClients()
  const [period, setPeriod] = useState<Period>(30)

  const series = useMemo(() => getSeries(period), [period])
  const totals = useMemo(() => getTotals(period), [period])
  const breakdown = useMemo(() => getInteractionBreakdown(totals.interactions), [totals.interactions])
  const planSelections = breakdown[0].count
  const plans = useMemo(() => getPlanPopularity(planSelections, clients), [planSelections, clients])
  const topPlan = plans[0]

  const activity = useMemo(() => getUserActivity(clients, period), [clients, period])
  const activeUsers = activity.filter((u) => u.lastAccessDays < period).length
  const frequent = [...activity].sort((a, b) => b.logins - a.logins).slice(0, 6)
  const maxLogins = Math.max(...frequent.map((u) => u.logins))

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Estadísticas de la plataforma: visitas, interacción, planes y usuarios."
        action={
          <div className="inline-flex rounded-full bg-muted p-1" role="group" aria-label="Periodo">
            {([7, 30] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  period === p ? "bg-black text-white shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p} días
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Visitantes de la web"
          value={nf.format(totals.visitors)}
          footer={
            <>
              <Delta value={totals.visitorsDelta} /> vs. periodo anterior
            </>
          }
        />
        <KpiCard
          icon={MousePointerClick}
          label="Interacciones"
          value={nf.format(totals.interactions)}
          footer={
            <>
              <Delta value={totals.interactionsDelta} /> vs. periodo anterior
            </>
          }
        />
        <KpiCard
          icon={TrendingUp}
          label="Tasa de interacción"
          value={`${totals.rate.toLocaleString("es-ES")} %`}
          footer="De cada 100 visitantes, los que interactúan"
        />
        <KpiCard
          icon={UserCheck}
          label="Usuarios activos"
          value={String(activeUsers)}
          footer={`de ${clients.length} clientes · últimos ${period} días`}
        />
      </div>

      {pending.length > 0 && (
        <Card className="mt-6 border-orange-300 bg-orange-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold">
                {pending.length} {pending.length === 1 ? "suscripción pendiente" : "suscripciones pendientes"} de aprobación
              </p>
              <p className="text-sm text-muted-foreground">Verifica los comprobantes de transferencia y aprueba el acceso.</p>
            </div>
            <Button asChild>
              <Link to="/panel/clientes">Revisar ahora</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visitas e interacciones</CardTitle>
            <CardDescription>Por día, en los últimos {period} días.</CardDescription>
            <div className="flex gap-4 pt-1 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-black" />
                Visitantes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                Interacciones
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <TrafficChart series={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cómo interactúan</CardTitle>
            <CardDescription>Qué hacen quienes visitan la web.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <span className="font-medium">{b.label}</span>
                  <span className="tabular-nums text-muted-foreground">{nf.format(b.count)}</span>
                </div>
                <Progress value={b.share * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan más popular</CardTitle>
            <CardDescription>Según las veces que se elige cada plan en la web.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-black p-4 text-white">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Crown className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-tight">{topPlan.name}</p>
                <p className="text-sm text-white/70">
                  {topPlan.price} € · {topPlan.duration} · {Math.round(topPlan.share * 100)} % de las elecciones
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {plans.map((p, i) => (
                <div key={p.name}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      {p.name}
                      {i === 0 && <Badge>Más popular</Badge>}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {nf.format(p.selections)} elecciones · {p.subscribers} {p.subscribers === 1 ? "cliente" : "clientes"}
                    </span>
                  </div>
                  <Progress value={p.share * 100} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios más frecuentes</CardTitle>
            <CardDescription>Quienes más usan la plataforma en los últimos {period} días.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 pl-6">#</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="w-36">Ingresos</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Último acceso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frequent.map((u, i) => (
                  <TableRow key={u.id}>
                    <TableCell className="pl-6 font-bold tabular-nums">{i + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.plan}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={(u.logins / maxLogins) * 100} className="h-1.5" />
                        <span className="w-6 text-right text-sm font-semibold tabular-nums">{u.logins}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-right text-sm text-muted-foreground sm:table-cell">{u.lastAccess}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {user?.role === "webmaster" && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Estado del sitio: en línea · Modo mantenimiento: apagado (se cambia desde «Sitio web»).
        </p>
      )}
      <MockNotice />
    </>
  )
}
