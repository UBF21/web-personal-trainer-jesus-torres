"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import {
  CLIENTS,
  PENDING_SUBSCRIPTIONS,
  getClientDetail,
  type MockClient,
  type NutritionGuide,
  type PendingSubscription,
  type TrainingProgram,
} from "@/lib/mock-data"

// MAQUETA: el estado de clientes y suscripciones pendientes vive en memoria (se pierde al recargar).
// Con Supabase serán las tablas de clientes y de comprobantes de pago.

interface ClientsContextValue {
  clients: MockClient[]
  pending: PendingSubscription[]
  approve: (id: number) => void
  reject: (id: number) => void
  /** Programa de entrenamiento a medida de cada cliente; sin entrada = aún no tiene uno. */
  programs: Record<number, TrainingProgram | undefined>
  createProgram: (clientId: number, program: TrainingProgram) => void
  updateProgram: (clientId: number, program: TrainingProgram) => void
  /** Guía de nutrición editada por el entrenador; sin entrada = se usa la calculada por defecto. */
  nutrition: Record<number, NutritionGuide | undefined>
  saveNutrition: (clientId: number, guide: NutritionGuide) => void
}

const ClientsContext = createContext<ClientsContextValue | null>(null)

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<MockClient[]>(CLIENTS)
  const [pending, setPending] = useState<PendingSubscription[]>(PENDING_SUBSCRIPTIONS)
  // Los clientes nuevos (y los recién aprobados) todavía no tienen programa: el entrenador se lo crea
  const [programs, setPrograms] = useState<Record<number, TrainingProgram | undefined>>(() =>
    Object.fromEntries(CLIENTS.filter((c) => c.status !== "Nuevo").map((c) => [c.id, getClientDetail(c).program])),
  )

  const [nutrition, setNutrition] = useState<Record<number, NutritionGuide | undefined>>({})

  // Al aprobar la transferencia, la persona pasa a ser cliente activo con el plan que compró
  const approve = useCallback(
    (id: number) => {
      const found = pending.find((p) => p.id === id)
      if (!found) return
      setPending((prev) => prev.filter((p) => p.id !== id))
      setClients((prev) => [
        ...prev,
        {
          id: Math.max(0, ...prev.map((c) => c.id)) + 1,
          name: found.name,
          email: found.email,
          plan: found.plan,
          status: "Activo",
          since: "Nov 2026",
          progress: 0,
        },
      ])
    },
    [pending],
  )

  const reject = useCallback((id: number) => setPending((prev) => prev.filter((p) => p.id !== id)), [])

  const createProgram = useCallback(
    (clientId: number, program: TrainingProgram) => setPrograms((prev) => ({ ...prev, [clientId]: program })),
    [],
  )

  const updateProgram = useCallback(
    (clientId: number, program: TrainingProgram) => setPrograms((prev) => ({ ...prev, [clientId]: program })),
    [],
  )

  const saveNutrition = useCallback(
    (clientId: number, guide: NutritionGuide) => setNutrition((prev) => ({ ...prev, [clientId]: guide })),
    [],
  )

  const value = useMemo(
    () => ({ clients, pending, approve, reject, programs, createProgram, updateProgram, nutrition, saveNutrition }),
    [clients, pending, approve, reject, programs, createProgram, updateProgram, nutrition, saveNutrition],
  )

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
}

export function useClients() {
  const ctx = useContext(ClientsContext)
  if (!ctx) throw new Error("useClients debe usarse dentro de <ClientsProvider>")
  return ctx
}
