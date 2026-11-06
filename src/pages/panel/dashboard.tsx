import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Database, Euro, Eye, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ACCENT,
  BLACK,
  BarChart,
  Delta,
  HBarList,
  LineChart,
  formatDay,
  formatEuro,
  formatNumber,
} from "@/components/dashboard-charts"
import { api, type DashboardStats } from "@/config/api"
import { useClients } from "@/contexts/clients-context"
import { PageHeader } from "./panel-ui"

const PERIODS = [7, 30, 90] as const
const MIN_VISITORS_FOR_CONVERSION = 20

const PAGE_LABELS: Record<string, string> = {
  "/": "Inicio",
  "/recetas": "Recetas",
  "/login": "Login",
  "/pago/exito": "Pago exitoso",
  "/pago/cancelado": "Pago cancelado",
}

function pageLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path]
  if (path.startsWith("/recetas/")) return `Receta: ${path.replace("/recetas/", "").replace(/-/g, " ")}`
  return path
}

export default function Dashboard() {
  const { pending } = useClients()
  const [days, setDays] = useState<number>(30)
  const [data, setData] = useState<DashboardStats | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)

    api.analytics.getDashboard(days).then((res) => {
      if (cancelled) return
      if (!res.success || !res.data) {
        if (res.error && /admin_dashboard_stats/.test(res.error)) {
          setNeedsSetup(true)
        } else {
          setError(res.error ?? "Error desconocido")
        }
        return
      }
      setNeedsSetup(false)
      setData(res.data)
    })

    return () => {
      cancelled = true
    }
  }, [days])

  function changePeriod(p: number) {
    if (p === days) return
    setData(null)
    setError(null)
    setDays(p)
  }

  const visitLabels = data?.visitsSeries.map((d) => formatDay(d.day)) ?? []
  const clientLabels = data?.clientsSeries.map((d) => formatDay(d.day)) ?? []
  const conversion =
    data && data.visitors >= MIN_VISITORS_FOR_CONVERSION && data.newClients <= data.visitors
      ? ((data.newClients / data.visitors) * 100).toFixed(1).replace(".", ",")
      : null

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          data
            ? `${formatDay(data.from)} – ${formatDay(data.to)} · comparado con los ${days} días anteriores`
            : needsSetup
              ? "Estadísticas todavía sin activar"
              : "Cargando datos…"
        }
        action={
          <div className="inline-flex rounded-full bg-muted p-1" role="group" aria-label="Periodo">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => changePeriod(p)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  days === p ? "bg-black text-white shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p} días
              </button>
            ))}
          </div>
        }
      />

      {needsSetup && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <Database className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Falta un paso para ver las estadísticas</p>
            <p className="mt-1 text-amber-800">
              Hay que crear en Supabase la tabla de visitas y la función del dashboard. Abre <b>SQL Editor → New query</b>,
              pega el contenido de <code className="bg-white/70 px-1">supabase/migrations/0010_analytics.sql</code> y ejecútalo.
              Después recarga esta página.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudieron cargar las estadísticas: {error}
        </div>
      )}

      {pending.length > 0 && (
        <Card className="mb-6 border-orange-300 bg-orange-50">
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

      {!needsSetup && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Eye}
              label="Visitas a la web"
              value={data ? formatNumber(data.visits) : "—"}
              footer={data && <Delta current={data.visits} previous={data.visitsPrev} />}
            />
            <KpiCard
              icon={Users}
              label="Visitantes únicos"
              value={data ? formatNumber(data.visitors) : "—"}
              footer={data && <Delta current={data.visitors} previous={data.visitorsPrev} />}
            />
            <KpiCard
              icon={UserPlus}
              label="Clientes nuevos"
              value={data ? formatNumber(data.newClients) : "—"}
              footer={
                data && (
                  <div className="space-y-0.5">
                    <Delta current={data.newClients} previous={data.newClientsPrev} />
                    {conversion && <p className="text-[11px] text-muted-foreground">{conversion} % de los visitantes se vuelve cliente</p>}
                  </div>
                )
              }
            />
            <KpiCard
              icon={Euro}
              label="Ingresos estimados"
              value={data ? formatEuro(data.revenue) : "—"}
              footer={<p className="text-[11px] text-muted-foreground">Según el precio del plan de cada cliente nuevo</p>}
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Visitas por día</CardTitle>
              <CardDescription>Cuánta gente entra a la web cada día.</CardDescription>
            </CardHeader>
            <CardContent>
              {data ? (
                data.visits === 0 ? (
                  <EmptyHint>
                    Todavía no hay visitas registradas en este período. Se empiezan a contar cuando alguien (que no sea del
                    equipo) entra al sitio.
                  </EmptyHint>
                ) : (
                  <LineChart
                    labels={visitLabels}
                    series={[
                      { name: "Visitas", color: ACCENT, values: data.visitsSeries.map((d) => d.visits) },
                      { name: "Visitantes únicos", color: BLACK, values: data.visitsSeries.map((d) => d.visitors) },
                    ]}
                  />
                )
              ) : (
                <Skeleton height={220} />
              )}
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Clientes nuevos por día</CardTitle>
                <CardDescription>Suscripciones aprobadas en el período.</CardDescription>
              </CardHeader>
              <CardContent>
                {data ? (
                  <BarChart
                    labels={clientLabels}
                    values={data.clientsSeries.map((d) => d.clients)}
                    color={BLACK}
                    formatValue={(n) => `${n} ${n === 1 ? "cliente" : "clientes"}`}
                  />
                ) : (
                  <Skeleton height={200} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan más elegido</CardTitle>
                <CardDescription>Clientes nuevos por plan, en el período.</CardDescription>
              </CardHeader>
              <CardContent>
                {data ? (
                  <HBarList
                    color={ACCENT}
                    items={data.topPlans.map((p) => ({ label: p.plan, value: p.n }))}
                    formatValue={(n) => `${n} ${n === 1 ? "cliente" : "clientes"}`}
                    emptyText="Aún no hay clientes nuevos en este período"
                  />
                ) : (
                  <Skeleton height={200} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Páginas más vistas</CardTitle>
                <CardDescription>Dónde entra la gente.</CardDescription>
              </CardHeader>
              <CardContent>
                {data ? (
                  <HBarList
                    color={ACCENT}
                    items={data.topPages.map((p) => ({ label: pageLabel(p.path), value: p.views }))}
                    formatValue={(n) => formatNumber(n)}
                    emptyText="Aún no hay visitas"
                  />
                ) : (
                  <Skeleton height={200} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>De dónde llegan</CardTitle>
                <CardDescription>Visitantes según su origen.</CardDescription>
              </CardHeader>
              <CardContent>
                {data ? (
                  <HBarList
                    color={BLACK}
                    items={data.sources.map((s) => ({ label: s.source, value: s.visitors }))}
                    formatValue={(n) => formatNumber(n)}
                    emptyText="Aún no hay visitas"
                  />
                ) : (
                  <Skeleton height={200} />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
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
          <div className="mt-0.5 min-h-[16px] text-xs text-muted-foreground">{footer}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function Skeleton({ height }: { height: number }) {
  return <div className="animate-pulse rounded-lg bg-muted" style={{ height }} />
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg bg-muted/60 px-4 py-8 text-center text-sm text-muted-foreground">{children}</p>
}
