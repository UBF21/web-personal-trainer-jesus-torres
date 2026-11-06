import { useEffect, useRef, useState } from "react"
import { FileText, Loader2, Paperclip, Send, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { api, type ChatMessage, type ChatSenderRole } from "@/config/api"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { VideoCallDialog } from "./video-call-dialog"

interface ChatThreadProps {
  clientId: string
  /** Desde qué lado se ve este hilo — decide qué burbujas caen a la derecha. */
  senderRole: ChatSenderRole
  senderName: string
  emptyHint?: string
  /** Para cuando ya va dentro de otro contenedor con su propio borde (ej. ChatBubble). */
  className?: string
}

export function ChatThread({ clientId, senderRole, senderName, emptyHint, className = "h-[480px] rounded-xl border border-border" }: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [callOpen, setCallOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
            body: string | null
            attachment_url: string | null
            attachment_name: string | null
            attachment_type: string | null
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
                    body: row.body ?? "",
                    attachmentUrl: row.attachment_url,
                    attachmentName: row.attachment_name,
                    attachmentType: row.attachment_type,
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
    } else {
      toast({ title: "No se pudo enviar el mensaje", description: res.error, variant: "destructive" })
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setUploading(true)
    const uploadRes = await api.messages.uploadAttachment(clientId, file)
    if (!uploadRes.success || !uploadRes.data) {
      setUploading(false)
      toast({ title: "No se pudo subir el archivo", description: uploadRes.error, variant: "destructive" })
      return
    }

    const sendRes = await api.messages.send(clientId, senderRole, senderName, "", uploadRes.data)
    setUploading(false)

    if (sendRes.success && sendRes.data) {
      setMessages((prev) => (prev.some((m) => m.id === sendRes.data!.id) ? prev : [...prev, sendRes.data!]))
    } else {
      toast({ title: "No se pudo enviar el adjunto", description: sendRes.error, variant: "destructive" })
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && <p className="py-10 text-center text-sm text-muted-foreground">Cargando mensajes…</p>}

        {!loading && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {emptyHint ?? "Todavía no hay mensajes. Escribe el primero."}
          </p>
        )}

        {messages.map((m) => {
          const isMine = m.senderRole === senderRole
          const isImage = m.attachmentType?.startsWith("image/")
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMine ? "bg-black text-white" : "bg-muted"}`}>
                {!isMine && <p className="mb-0.5 text-xs font-semibold opacity-70">{m.senderName}</p>}

                {m.attachmentUrl &&
                  (isImage ? (
                    <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="mb-1 block overflow-hidden rounded-lg">
                      <img src={m.attachmentUrl} alt={m.attachmentName ?? "Adjunto"} className="max-h-48 w-full object-cover" />
                    </a>
                  ) : (
                    <a
                      href={m.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                        isMine ? "bg-white/10" : "bg-background"
                      }`}
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{m.attachmentName ?? "Archivo adjunto"}</span>
                    </a>
                  ))}

                {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}

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
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} />
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={uploading || sending}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Adjuntar foto o archivo"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => setCallOpen(true)}
          title="Iniciar videollamada"
          aria-label="Iniciar videollamada"
        >
          <Video className="h-4 w-4" />
        </Button>
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

      <VideoCallDialog
        open={callOpen}
        onClose={() => setCallOpen(false)}
        roomName={`JTTraining-${clientId}`}
        displayName={senderName}
      />
    </div>
  )
}
