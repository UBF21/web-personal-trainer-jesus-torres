"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { api, type PendingSubscriptionInput, type WeightLog } from "@/config/api"
import { type MockClient, type NutritionGuide, type PendingSubscription, type TrainingProgram } from "@/lib/mock-data"

// Clientes, solicitudes pendientes, peso, programa de entrenamiento y guía
// de nutrición salen todos de Supabase (ver src/config/api.ts) — nada de
// esto es maqueta en memoria.

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
  /** detail: por qué falló (ok=false) o qué detalle quedó pendiente aunque funcionó (ok=true). */
  approve: (id: string) => Promise<{ ok: boolean; detail?: string }>
  reject: (id: string) => Promise<boolean>
  /** Programa de entrenamiento a medida de cada cliente; sin entrada = todavía no se cargó o no tiene uno. */
  programs: Record<string, TrainingProgram | undefined>
  loadProgram: (clientId: string) => Promise<void>
  createProgram: (clientId: string, program: TrainingProgram) => Promise<boolean>
  updateProgram: (clientId: string, program: TrainingProgram) => Promise<boolean>
  /** Guía de nutrición editada por el entrenador; sin entrada = todavía no se cargó o se usa la calculada por defecto. */
  nutrition: Record<string, NutritionGuide | undefined>
  loadNutrition: (clientId: string) => Promise<void>
  saveNutrition: (clientId: string, guide: NutritionGuide) => Promise<boolean>
  /** Historial de peso de cada cliente; sin entrada = todavía no se cargó. */
  weightLogs: Record<string, WeightLog[]>
  loadWeightLogs: (clientId: string) => Promise<void>
  addWeightLog: (clientId: string, weight: number) => Promise<boolean>
  setWeightTargets: (clientId: string, startWeight: number, goalWeight: number) => Promise<boolean>
  updateClientInfo: (clientId: string, input: { status?: MockClient["status"]; progress?: number }) => Promise<boolean>
}

const ClientsContext = createContext<ClientsContextValue | null>(null)

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<MockClient[]>([])
  const [pending, setPending] = useState<PendingSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [programs, setPrograms] = useState<Record<string, TrainingProgram | undefined>>({})
  const [nutrition, setNutrition] = useState<Record<string, NutritionGuide | undefined>>({})
  const [weightLogs, setWeightLogs] = useState<Record<string, WeightLog[]>>({})

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
            lastReadByStaffAt: c.lastReadByStaffAt,
            startWeight: c.startWeight,
            goalWeight: c.goalWeight,
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
      return { ok: res.success, detail: res.success ? res.message : res.error }
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

  const loadProgram = useCallback(async (clientId: string) => {
    const res = await api.programs.get(clientId)
    if (res.success) setPrograms((prev) => ({ ...prev, [clientId]: res.data ?? undefined }))
  }, [])

  const saveProgram = useCallback(async (clientId: string, program: TrainingProgram) => {
    const res = await api.programs.save(clientId, program)
    if (res.success) setPrograms((prev) => ({ ...prev, [clientId]: program }))
    return res.success
  }, [])

  const loadNutrition = useCallback(async (clientId: string) => {
    const res = await api.nutrition.get(clientId)
    if (res.success) setNutrition((prev) => ({ ...prev, [clientId]: res.data ?? undefined }))
  }, [])

  const saveNutrition = useCallback(async (clientId: string, guide: NutritionGuide) => {
    const res = await api.nutrition.save(clientId, guide)
    if (res.success) setNutrition((prev) => ({ ...prev, [clientId]: guide }))
    return res.success
  }, [])

  const loadWeightLogs = useCallback(async (clientId: string) => {
    const res = await api.clients.getWeightLogs(clientId)
    if (res.success) setWeightLogs((prev) => ({ ...prev, [clientId]: res.data ?? [] }))
  }, [])

  const addWeightLog = useCallback(
    async (clientId: string, weight: number) => {
      const res = await api.clients.addWeightLog(clientId, weight)
      if (res.success) await loadWeightLogs(clientId)
      return res.success
    },
    [loadWeightLogs],
  )

  const setWeightTargets = useCallback(async (clientId: string, startWeight: number, goalWeight: number) => {
    const res = await api.clients.setWeightTargets(clientId, startWeight, goalWeight)
    if (res.success) {
      setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, startWeight, goalWeight } : c)))
    }
    return res.success
  }, [])

  const updateClientInfo = useCallback(
    async (clientId: string, input: { status?: MockClient["status"]; progress?: number }) => {
      const res = await api.clients.update(clientId, input)
      if (res.success) {
        setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...input } : c)))
      }
      return res.success
    },
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
      loadProgram,
      createProgram: saveProgram,
      updateProgram: saveProgram,
      nutrition,
      loadNutrition,
      saveNutrition,
      weightLogs,
      loadWeightLogs,
      addWeightLog,
      setWeightTargets,
      updateClientInfo,
    }),
    [
      clients,
      pending,
      loading,
      refresh,
      requestPlan,
      approve,
      reject,
      programs,
      loadProgram,
      saveProgram,
      nutrition,
      loadNutrition,
      saveNutrition,
      weightLogs,
      loadWeightLogs,
      addWeightLog,
      setWeightTargets,
      updateClientInfo,
    ],
  )

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
}

export function useClients() {
  const ctx = useContext(ClientsContext)
  if (!ctx) throw new Error("useClients debe usarse dentro de <ClientsProvider>")
  return ctx
}
