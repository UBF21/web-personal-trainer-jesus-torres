import { useState, type ReactNode } from "react"
import { ArrowLeft, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MockClient } from "@/lib/mock-data"
import { ChatThread } from "./chat-thread"

/** Botón redondo fijo abajo a la derecha, visible en todo el panel. */
function FloatingToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <Button
      type="button"
      size="icon"
      onClick={onToggle}
      className="h-14 w-14 rounded-full shadow-lg"
      aria-label={open ? "Cerrar chat" : "Abrir chat"}
    >
      {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
    </Button>
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
                clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveClient(c)}
                    className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                      {c.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.plan}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Panel>
        ))}
      <FloatingToggle
        open={open}
        onToggle={() => {
          setOpen((v) => !v)
          if (open) setActiveClient(null)
        }}
      />
    </div>
  )
}
