import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChatSenderRole } from "@/config/api"
import { ChatThread } from "./chat-thread"

interface ChatBubbleProps {
  title: string
  clientId: string
  senderRole: ChatSenderRole
  senderName: string
  emptyHint?: string
}

/** Burbuja flotante (estilo widget de chat) en vez de un bloque fijo en la página. */
export function ChatBubble({ title, clientId, senderRole, senderName, emptyHint }: ChatBubbleProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
            <p className="text-sm font-semibold">{title}</p>
            <button type="button" onClick={() => setOpen(false)} className="text-white/70 transition-colors hover:text-white" aria-label="Cerrar chat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ChatThread
            clientId={clientId}
            senderRole={senderRole}
            senderName={senderName}
            emptyHint={emptyHint}
            className="h-[440px]"
          />
        </div>
      )}

      <Button
        type="button"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-full shadow-lg"
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
