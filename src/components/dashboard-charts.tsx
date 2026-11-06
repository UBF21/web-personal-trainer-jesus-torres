import { useState } from "react"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"

// Gráficos simples en SVG/CSS para el dashboard — mismo criterio que se
// armó para el dashboard de FitBlood, en blanco/negro/naranja (la marca
// de JT Training) en vez de negro/rojo.

export const ACCENT = "#f97316"
export const BLACK = "#000000"
const GRID = "#00000014"

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("es-ES").format(n)
}

export function formatEuro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n)
}

/** "2026-11-05" → "5 nov" (sin pasar por Date UTC para no correr el día). */
export function formatDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number)
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" })
    .format(new Date(y, m - 1, d))
    .replace(".", "")
}

export function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  const up = pct > 0
  const flat = pct === 0
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${flat ? "text-muted-foreground" : up ? "text-emerald-600" : "text-red-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : ""}
      {pct}%
    </span>
  )
}

type LineSeries = { name: string; color: string; values: number[] }

export function LineChart({
  labels,
  series,
  height = 220,
  formatValue = formatNumber,
}: {
  labels: string[]
  series: LineSeries[]
  height?: number
  formatValue?: (n: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)

  const W = 640
  const H = height
  const padL = 34
  const padR = 10
  const padT = 12
  const padB = 24
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const niceMax = niceCeil(max)
  const n = labels.length
  const x = (i: number) => padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => padT + innerH - (v / niceMax) * innerH

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f))
  const labelEvery = Math.max(1, Math.ceil(n / 6))

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Gráfico de líneas"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const px = ((e.clientX - rect.left) / rect.width) * W
            const i = Math.round(((px - padL) / innerW) * (n - 1))
            setHover(Math.min(n - 1, Math.max(0, i)))
          }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#00000080">
                {formatValue(t)}
              </text>
            </g>
          ))}

          {labels.map((l, i) =>
            i % labelEvery === 0 || i === n - 1 ? (
              <text key={l + i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#00000080">
                {l}
              </text>
            ) : null,
          )}

          {series.map((s, si) => {
            const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")
            return (
              <g key={s.name}>
                {si === 0 && n > 1 && (
                  <polygon points={`${x(0)},${y(0)} ${pts} ${x(n - 1)},${y(0)}`} fill={s.color} opacity="0.08" />
                )}
                <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              </g>
            )
          })}

          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke="#00000030" />
              {series.map((s) => (
                <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r="3.5" fill="#fff" stroke={s.color} strokeWidth="2" />
              ))}
            </g>
          )}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-border bg-background px-3 py-2 text-xs shadow-md"
            style={{ left: `${(x(hover) / W) * 100}%` }}
          >
            <p className="mb-1 font-semibold">{labels[hover]}</p>
            {series.map((s) => (
              <p key={s.name} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.name}: <b className="text-foreground">{formatValue(s.values[hover])}</b>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function BarChart({
  labels,
  values,
  color = BLACK,
  height = 180,
  formatValue = formatNumber,
}: {
  labels: string[]
  values: number[]
  color?: string
  height?: number
  formatValue?: (n: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...values)
  const n = values.length
  const labelEvery = Math.max(1, Math.ceil(n / 6))

  return (
    <div className="relative">
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {values.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <div
              className="w-full rounded-t transition-opacity"
              style={{
                height: v === 0 ? 2 : `${Math.max(3, (v / max) * 100)}%`,
                background: v === 0 ? "#0000001a" : color,
                opacity: hover === null || hover === i ? 1 : 0.45,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-1.5 flex gap-[3px] text-[10px] text-muted-foreground">
        {labels.map((l, i) => (
          <div key={i} className="relative flex-1">
            {i % labelEvery === 0 || i === n - 1 ? <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">{l}</span> : null}
          </div>
        ))}
      </div>
      <div className="h-4" />

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-border bg-background px-3 py-1.5 text-xs shadow-md"
          style={{ left: `${((hover + 0.5) / n) * 100}%` }}
        >
          <p className="font-semibold">{labels[hover]}</p>
          <p className="text-muted-foreground">{formatValue(values[hover])}</p>
        </div>
      )}
    </div>
  )
}

export type RankItem = { label: string; value: number; hint?: string }

export function HBarList({
  items,
  color = BLACK,
  formatValue = formatNumber,
  emptyText = "Sin datos todavía",
}: {
  items: RankItem[]
  color?: string
  formatValue?: (n: number) => string
  emptyText?: string
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
  }
  const max = Math.max(1, ...items.map((i) => i.value))

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 font-semibold">
              {formatValue(item.value)}
              {item.hint && <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{item.hint}</span>}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Redondea hacia arriba a un número "bonito" para el eje (1, 2, 5, 10, 20, 50…). */
function niceCeil(v: number): number {
  if (v <= 4) return 4
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / pow
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return nice * pow
}
