import { useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Jitsi Meet (meet.jit.si, instancia pública y gratuita) vía su Iframe/
// External API — sin servidor propio, sin registro para quien se une.
declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => {
      dispose: () => void
    }
  }
}

let jitsiScriptPromise: Promise<void> | null = null

function loadJitsiScript(): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve()
  if (!jitsiScriptPromise) {
    jitsiScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://meet.jit.si/external_api.js"
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("No se pudo cargar Jitsi Meet"))
      document.body.appendChild(script)
    })
  }
  return jitsiScriptPromise
}

interface VideoCallDialogProps {
  open: boolean
  onClose: () => void
  /** Única por conversación — ej. "JTTraining-<clientId>". */
  roomName: string
  displayName: string
}

export function VideoCallDialog({ open, onClose, roomName, displayName }: VideoCallDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    let api: { dispose: () => void } | null = null

    loadJitsiScript().then(() => {
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return
      api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: { displayName },
        configOverwrite: { prejoinPageEnabled: false },
      })
    })

    return () => {
      cancelled = true
      api?.dispose()
    }
  }, [open, roomName, displayName])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="h-[85vh] max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogTitle className="sr-only">Videollamada</DialogTitle>
        <div ref={containerRef} className="h-full w-full bg-black" />
      </DialogContent>
    </Dialog>
  )
}
