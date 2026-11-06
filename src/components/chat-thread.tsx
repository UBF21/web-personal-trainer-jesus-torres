import { useEffect, useRef, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { api, type ChatMessage, type ChatSenderRole } from "@/config/api"
import { supabase } from "@/lib/supabase"

interface ChatThreadProps {
  clientId: string
  /** Desde qué lado se ve este hilo — decide qué burbujas caen a la derecha. */
  senderRole: ChatSenderRole
  senderName: string
  emptyHint?: string
}

export function ChatThread({ clientId, senderRole, senderName, emptyHint }: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.messages.getByClient(clientId).then((res) => {
      if (!active) return
      if (res.success && res.data) setMessages(res.data)
      setLoading(false)
    })

    // Realtime: los mensajes nuevos (de cualquiera de los dos lados)
    // aparecen al instante, sin recargar la página.
    const channel = supabase
      .channel(`messages-${clientId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `client_id=eq.${clientId}` },
        (payload) => {
          const row = payload.new as {
            id: string
            client_id: string
            sender_role: ChatSenderRole
            sender_name: string
            body: string
            created_at: string
          }
          setMessages((prev) =>
            prev.some((m) => m.id === row.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: row.id,
                    clientId: row.client_id,
                    senderRole: row.sender_role,
                    senderName: row.sender_name,
                    body: row.body,
                    createdAt: row.created_at,
                  },
                ],
          )
        },
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [clientId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const body = draft.trim()
    if (!body) return

    setSending(true)
    const res = await api.messages.send(clientId, senderRole, senderName, body)
    setSending(false)

    if (res.success && res.data) {
      setDraft("")
      setMessages((prev) => (prev.some((m) => m.id === res.data!.id) ? prev : [...prev, res.data!]))
    }
  }

  return (
    <div className="flex h-[480px] flex-col rounded-xl border border-border">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && <p className="py-10 text-center text-sm text-muted-foreground">Cargando mensajes…</p>}

        {!loading && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {emptyHint ?? "Todavía no hay mensajes. Escribe el primero."}
          </p>
        )}

        {messages.map((m) => {
          const isMine = m.senderRole === senderRole
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMine ? "bg-black text-white" : "bg-muted"}`}>
                {!isMine && <p className="mb-0.5 text-xs font-semibold opacity-70">{m.senderName}</p>}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[10px] ${isMine ? "text-white/60" : "text-muted-foreground"}`}>
                  {new Date(m.createdAt).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribe un mensaje…"
          rows={1}
          className="min-h-10 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend(e)
            }
          }}
        />
        <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
