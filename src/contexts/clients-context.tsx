"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { api, type PendingSubscriptionInput } from "@/config/api"
import { type MockClient, type NutritionGuide, type PendingSubscription, type TrainingProgram } from "@/lib/mock-data"

// Clientes y solicitudes pendientes ya salen de Supabase (API en Express,
// ver src/config/api.ts) — es lo que pidió conectar "el flujo completo".
// Los programas de entrenamiento y las guías de nutrición siguen siendo
// maqueta en memoria por ahora (se pierden al recargar): persistirlos es
// un trabajo aparte, más grande, que no se incluyó en este alcance.

function formatRequestedAt(iso: string): string {
  const date = new Date(iso)
  const label = date.toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
  return label.replace(".", "")
}

function formatSince(iso: string): string {
  const date = new Date(iso)
  const label = date.toLocaleDateString("es-ES", { month: "short", year: "numeric" }).replace(".", "")
  return label.charAt(0).toUpperCase() + label.slice(1)
}

interface ClientsContextValue {
  clients: MockClient[]
  pending: PendingSubscription[]
  loading: boolean
  refresh: () => Promise<void>
  /** Alguien elige un plan en la web pública: crea una solicitud pendiente real. */
  requestPlan: (input: PendingSubscriptionInput) => Promise<boolean>
  approve: (id: string) => Promise<boolean>
  reject: (id: string) => Promise<boolean>
  /** Programa de entrenamiento a medida de cada cliente; sin entrada = aún no tiene uno. */
  programs: Record<string, TrainingProgram | undefined>
  createProgram: (clientId: string, program: TrainingProgram) => void
  updateProgram: (clientId: string, program: TrainingProgram) => void
  /** Guía de nutrición editada por el entrenador; sin entrada = se usa la calculada por defecto. */
  nutrition: Record<string, NutritionGuide | undefined>
  saveNutrition: (clientId: string, guide: NutritionGuide) => void
}

const ClientsContext = createContext<ClientsContextValue | null>(null)

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<MockClient[]>([])
  const [pending, setPending] = useState<PendingSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [programs, setPrograms] = useState<Record<string, TrainingProgram | undefined>>({})
  const [nutrition, setNutrition] = useState<Record<string, NutritionGuide | undefined>>({})

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [clientsRes, pendingRes] = await Promise.all([api.clients.getAll(), api.clients.getPending()])

      if (clientsRes.success && clientsRes.data) {
        setClients(
          clientsRes.data.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            plan: c.plan,
            status: c.status,
            progress: c.progress,
            since: formatSince(c.createdAt),
          })),
        )
      }

      if (pendingRes.success && pendingRes.data) {
        setPending(
          pendingRes.data.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            plan: p.plan,
            amount: p.amount,
            bank: p.bank ?? undefined,
            operation: p.operation ?? undefined,
            voucher: p.voucher ?? undefined,
            requestedAt: formatRequestedAt(p.createdAt),
          })),
        )
      }
    } catch {
      // sin conexión al backend: se queda con lo último que había cargado
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const requestPlan = useCallback(
    async (input: PendingSubscriptionInput) => {
      const res = await api.clients.createPending(input)
      if (res.success) await refresh()
      return res.success
    },
    [refresh],
  )

  const approve = useCallback(
    async (id: string) => {
      const res = await api.clients.approvePending(id)
      if (res.success) await refresh()
      return res.success
    },
    [refresh],
  )

  const reject = useCallback(
    async (id: string) => {
      const res = await api.clients.rejectPending(id)
      if (res.success) await refresh()
      return res.success
    },
    [refresh],
  )

  const createProgram = useCallback(
    (clientId: string, program: TrainingProgram) => setPrograms((prev) => ({ ...prev, [clientId]: program })),
    [],
  )

  const updateProgram = useCallback(
    (clientId: string, program: TrainingProgram) => setPrograms((prev) => ({ ...prev, [clientId]: program })),
    [],
  )

  const saveNutrition = useCallback(
    (clientId: string, guide: NutritionGuide) => setNutrition((prev) => ({ ...prev, [clientId]: guide })),
    [],
  )

  const value = useMemo(
    () => ({
      clients,
      pending,
      loading,
      refresh,
      requestPlan,
      approve,
      reject,
      programs,
      createProgram,
      updateProgram,
      nutrition,
      saveNutrition,
    }),
    [clients, pending, loading, refresh, requestPlan, approve, reject, programs, createProgram, updateProgram, nutrition, saveNutrition],
  )

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
}

export function useClients() {
  const ctx = useContext(ClientsContext)
  if (!ctx) throw new Error("useClients debe usarse dentro de <ClientsProvider>")
  return ctx
}
