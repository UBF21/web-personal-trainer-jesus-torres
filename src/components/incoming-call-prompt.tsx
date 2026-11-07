import { useEffect, useState } from "react"
import { PhoneIncoming } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { VideoCallDialog } from "./video-call-dialog"

/**
 * Pantalla de "llamada entrante" para el cliente: aparece sobre cualquier
 * página del panel apenas el entrenador inicia una videollamada, sin
 * importar si el chat está abierto o no. Escucha el mismo mensaje
 * especial (attachment_type = "video-call") que manda ChatThread.
 */
export function IncomingCallPrompt({ clientId, myName }: { clientId: string; myName: string }) {
  const [callerName, setCallerName] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel(`incoming-call-${clientId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `client_id=eq.${clientId}` },
        (payload) => {
          const row = payload.new as {
            sender_role: string
            sender_name: string
            attachment_type: string | null
            attachment_url: string | null
          }
          if (row.sender_role === "entrenador" && row.attachment_type === "video-call") {
            setJoined(false)
            setCallerName(row.sender_name)
            setRoomName(row.attachment_url)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId])

  function dismiss() {
    setCallerName(null)
    setRoomName(null)
    setJoined(false)
  }

  return (
    <>
      <Dialog open={!!callerName && !joined} onOpenChange={(o) => !o && dismiss()}>
        <DialogContent className="text-center sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
              <PhoneIncoming className="h-6 w-6 animate-pulse" />
            </div>
            <DialogTitle>{callerName} quiere hacer una videollamada</DialogTitle>
            <DialogDescription>Puedes unirte ahora o más tarde desde el chat.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={dismiss}>
              Ahora no
            </Button>
            <Button type="button" className="flex-1" onClick={() => setJoined(true)}>
              Unirme
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {callerName && roomName && <VideoCallDialog open={joined} onClose={dismiss} roomName={roomName} displayName={myName} />}
    </>
  )
}
