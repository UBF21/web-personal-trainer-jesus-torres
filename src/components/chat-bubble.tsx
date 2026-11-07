import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowLeft, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/config/api"
import type { MockClient } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import { ChatThread } from "./chat-thread"

/** Círculo rojo con un número — "tienes esto pendiente de leer". */
function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white ring-2 ring-background">
      {count > 99 ? "99+" : count}
    </span>
  )
}

/** Botón redondo fijo abajo a la derecha, visible en todo el panel. */
function FloatingToggle({ open, onToggle, badgeCount }: { open: boolean; onToggle: () => void; badgeCount?: number }) {
  return (
    <div className="relative inline-block">
      <Button
        type="button"
        size="icon"
        onClick={onToggle}
        className="h-14 w-14 rounded-full shadow-lg"
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
      {!open && badgeCount !== undefined && <CountBadge count={badgeCount} />}
    </div>
  )
}

function Panel({
  title,
  onBack,
  onClose,
  children,
}: {
  title: string
  onBack?: () => void
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="mb-3 w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
      <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          {onBack && (
            <button type="button" onClick={onBack} className="text-white/70 transition-colors hover:text-white" aria-label="Volver">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <button type="button" onClick={onClose} className="text-white/70 transition-colors hover:text-white" aria-label="Cerrar chat">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  )
}

/** Vista del cliente: una sola conversación, directa con el entrenador. */
export function ClientChatBubble({ clientId, senderName }: { clientId: string; senderName: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <Panel title="Jesús Torres" onClose={() => setOpen(false)}>
          <ChatThread
            clientId={clientId}
            senderRole="cliente"
            senderName={senderName}
            emptyHint="Escríbele a Jesús, te responderá en cuanto pueda."
            className="h-[440px]"
          />
        </Panel>
      )}
      <FloatingToggle open={open} onToggle={() => setOpen((v) => !v)} />
    </div>
  )
}

/** Vista de administrador/webmaster: lista de clientes, se entra a cada conversación. */
export function StaffChatBubble({ clients, staffName }: { clients: MockClient[]; staffName: string }) {
  const [open, setOpen] = useState(false)
  const [activeClient, setActiveClient] = useState<MockClient | null>(null)
  // client_id -> fechas de sus mensajes (para contar cuántas son más nuevas que su "leído").
  const [timestamps, setTimestamps] = useState<Record<string, string[]>>({})
  // Para que el mensaje de la conversación que ya está abierta no se marque
  // como no leída — leídos dentro del handler de realtime sin resuscribirlo.
  const openRef = useRef(open)
  const activeClientIdRef = useRef<string | null>(null)
  openRef.current = open
  activeClientIdRef.current = activeClient?.id ?? null

  useEffect(() => {
    let active = true
    api.messages.getClientMessageTimestamps().then((res) => {
      if (active && res.success && res.data) setTimestamps(res.data)
    })

    // Cualquier mensaje nuevo de cualquier cliente actualiza los contadores
    // en vivo, sin tener que abrir esa conversación.
    const channel = supabase
      .channel("staff-unread-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: "sender_role=eq.cliente" },
        (payload) => {
          const row = payload.new as { client_id: string; created_at: string }
          if (openRef.current && activeClientIdRef.current === row.client_id) {
            // Ya está viendo esa conversación — no la marques como sin leer.
            api.clients.markReadByStaff(row.client_id)
            return
          }
          setTimestamps((prev) => ({ ...prev, [row.client_id]: [...(prev[row.client_id] ?? []), row.created_at] }))
        },
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  function unreadCount(client: MockClient): number {
    const dates = timestamps[client.id]
    if (!dates || dates.length === 0) return 0
    const lastRead = client.lastReadByStaffAt
    if (!lastRead) return dates.length
    return dates.filter((d) => d > lastRead).length
  }

  const unreadClientsCount = clients.filter((c) => unreadCount(c) > 0).length

  function openClient(client: MockClient) {
    setActiveClient(client)
    if (unreadCount(client) > 0) {
      const now = new Date().toISOString()
      setTimestamps((prev) => ({ ...prev, [client.id]: (prev[client.id] ?? []).filter((d) => d > now) }))
      api.clients.markReadByStaff(client.id)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open &&
        (activeClient ? (
          <Panel
            title={activeClient.name}
            onBack={() => setActiveClient(null)}
            onClose={() => {
              setOpen(false)
              setActiveClient(null)
            }}
          >
            <ChatThread clientId={activeClient.id} senderRole="entrenador" senderName={staffName} className="h-[440px]" />
          </Panel>
        ) : (
          <Panel title="Mensajes" onClose={() => setOpen(false)}>
            <div className="h-[440px] overflow-y-auto">
              {clients.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">Todavía no hay clientes con quien chatear.</p>
              ) : (
                clients.map((c) => {
                  const unread = unreadCount(c)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openClient(c)}
                      className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                          {c.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <CountBadge count={unread} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.plan}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </Panel>
        ))}
      <FloatingToggle
        open={open}
        badgeCount={unreadClientsCount}
        onToggle={() => {
          setOpen((v) => !v)
          if (open) setActiveClient(null)
        }}
      />
    </div>
  )
}
