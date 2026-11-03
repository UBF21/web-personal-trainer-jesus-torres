// MAQUETA: estadísticas ficticias de la plataforma. Se generan de forma determinista (mismos números en cada carga).
// Con Supabase saldrán de eventos de analítica (visitas, clics y formularios) y de la tabla de sesiones de usuarios.

import { type MockClient, PLANS } from "@/lib/mock-data"

/** Hash determinista simple: el id real ahora es un uuid (string), no un número. */
function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export type Period = 7 | 30

export interface DayPoint {
  /** Etiqueta corta para el eje (p. ej. "28 oct"). */
  label: string
  visitors: number
  interactions: number
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
// Hoy en la maqueta: 2 de noviembre de 2026
const TODAY = new Date(2026, 10, 2)

/** Visitantes únicos de un día; daysAgo = 0 es hoy. Los fines de semana bajan y la tendencia sube poco a poco. */
function visitorsOn(daysAgo: number): number {
  const date = new Date(TODAY)
  date.setDate(date.getDate() - daysAgo)
  const weekend = date.getDay() === 0 || date.getDay() === 6
  const trend = 90 - daysAgo * 0.45
  const wave = 24 * Math.sin(daysAgo * 0.8) + 12 * Math.cos(daysAgo * 0.37)
  return Math.max(20, Math.round(trend + wave - (weekend ? 22 : 0)))
}

/** Interacciones de un día: una parte de los visitantes hace clic en un plan, escribe, se registra… */
function interactionsOn(daysAgo: number): number {
  const rate = 0.21 + 0.05 * Math.sin(daysAgo * 1.3)
  return Math.round(visitorsOn(daysAgo) * rate)
}

export function getSeries(period: Period): DayPoint[] {
  return Array.from({ length: period }, (_, i) => {
    const daysAgo = period - 1 - i
    const date = new Date(TODAY)
    date.setDate(date.getDate() - daysAgo)
    return {
      label: `${date.getDate()} ${MONTHS[date.getMonth()]}`,
      visitors: visitorsOn(daysAgo),
      interactions: interactionsOn(daysAgo),
    }
  })
}

export interface Totals {
  visitors: number
  interactions: number
  rate: number
  visitorsDelta: number
  interactionsDelta: number
}

/** Totales del periodo y su variación frente al periodo anterior de igual duración. */
export function getTotals(period: Period): Totals {
  const sum = (from: number, to: number, fn: (d: number) => number) => {
    let total = 0
    for (let d = from; d < to; d++) total += fn(d)
    return total
  }
  const visitors = sum(0, period, visitorsOn)
  const interactions = sum(0, period, interactionsOn)
  const prevVisitors = sum(period, period * 2, visitorsOn)
  const prevInteractions = sum(period, period * 2, interactionsOn)
  const pct = (now: number, before: number) => Math.round(((now - before) / before) * 1000) / 10

  return {
    visitors,
    interactions,
    rate: Math.round((interactions / visitors) * 1000) / 10,
    visitorsDelta: pct(visitors, prevVisitors),
    interactionsDelta: pct(interactions, prevInteractions),
  }
}

/** Cómo interactúan las personas que visitan la web (reparto de las interacciones del periodo). */
const INTERACTION_SHARES = [
  { label: "Clic en «Seleccionar plan»", share: 0.31 },
  { label: "Recetas vistas", share: 0.24 },
  { label: "Clic en WhatsApp", share: 0.2 },
  { label: "Formulario de contacto", share: 0.15 },
  { label: "Registros de cuenta", share: 0.1 },
]

export function getInteractionBreakdown(totalInteractions: number) {
  return INTERACTION_SHARES.map((i) => ({ label: i.label, count: Math.round(totalInteractions * i.share), share: i.share }))
}

/** Popularidad de cada plan: cuántas veces lo eligen en la web (reparto fijo; el Avanzado es el más elegido). */
const PLAN_SELECTION_SHARE: Record<string, number> = {
  "Plan Básico": 0.27,
  "Plan Avanzado": 0.49,
  "Plan VIP": 0.24,
}

export function getPlanPopularity(planSelections: number, clients: MockClient[]) {
  return PLANS.map((p) => ({
    name: p.name,
    price: p.price,
    duration: p.duration,
    selections: Math.round(planSelections * (PLAN_SELECTION_SHARE[p.name] ?? 0)),
    share: PLAN_SELECTION_SHARE[p.name] ?? 0,
    subscribers: clients.filter((c) => c.plan === p.name).length,
  })).sort((a, b) => b.selections - a.selections)
}

export interface FrequentUser {
  id: string
  name: string
  plan: string
  /** Veces que inició sesión en el periodo. */
  logins: number
  /** Sesiones de entrenamiento registradas en el periodo. */
  sessions: number
  lastAccess: string
  lastAccessDays: number
}

const LAST_ACCESS = ["Hoy", "Ayer", "Hace 2 días", "Hace 3 días", "Hace 4 días", "Hace 5 días", "Hace 6 días", "Hace 8 días", "Hace 12 días"]

/** Actividad de cada cliente en la plataforma durante el periodo (determinista por id). */
export function getUserActivity(clients: MockClient[], period: Period): FrequentUser[] {
  const scale = period / 30
  return clients.map((c) => {
    const h = hashId(c.id)
    const lastAccessDays = [0, 1, 2, 3, 4, 5, 6, 8, 12][(h * 5) % 9]
    return {
      id: c.id,
      name: c.name,
      plan: c.plan,
      logins: Math.max(1, Math.round((10 + ((h * 7) % 23)) * scale)),
      sessions: Math.max(0, Math.round((4 + ((h * 3) % 11)) * scale)),
      lastAccess: LAST_ACCESS.find((_, i) => [0, 1, 2, 3, 4, 5, 6, 8, 12][i] === lastAccessDays) ?? "Hoy",
      lastAccessDays,
    }
  })
}
