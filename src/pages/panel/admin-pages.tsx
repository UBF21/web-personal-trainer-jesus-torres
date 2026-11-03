import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Banknote, Check, ChevronRight, FileImage, FileText, KeyRound, Loader2, Send, ShieldCheck, X, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClients } from "@/contexts/clients-context"
import { toast } from "@/hooks/use-toast"
import { APPOINTMENTS, type PendingSubscription } from "@/lib/mock-data"
import { MockNotice, PageHeader } from "./panel-ui"

const STATUS_VARIANT = { Activo: "default", Nuevo: "secondary", Pausado: "outline" } as const

type ClientsTab = "clientes" | "pendientes"

const isPdf = (file?: string) => !!file && file.toLowerCase().endsWith(".pdf")

function VoucherDialog({
  item,
  onClose,
  onApprove,
  onReject,
}: {
  item: PendingSubscription | null
  onClose: () => void
  onApprove: (item: PendingSubscription) => void
  onReject: (item: PendingSubscription) => void
}) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>Revisar comprobante</DialogTitle>
              <DialogDescription>
                {item.name} · {item.plan}
              </DialogDescription>
            </DialogHeader>

            {/* Vista previa del comprobante adjunto (en la maqueta es una imagen simulada) */}
            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 text-muted-foreground">
              {item.voucher ? (
                <>
                  {isPdf(item.voucher) ? <FileText className="h-10 w-10" /> : <FileImage className="h-10 w-10" />}
                  <span className="text-sm font-medium text-foreground">{item.voucher}</span>
                  <span className="text-xs">Comprobante de transferencia adjunto</span>
                </>
              ) : (
                <>
                  <FileImage className="h-10 w-10" />
                  <span className="text-xs">Todavía no envió el comprobante — revisá por correo.</span>
                </>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Correo</dt>
                <dd className="font-medium">{item.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Monto a verificar</dt>
                <dd className="font-medium">{item.amount} €</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Banco de origen</dt>
                <dd className="font-medium">{item.bank || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">N.º de operación</dt>
                <dd className="font-medium">{item.operation || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Enviado</dt>
                <dd className="font-medium">{item.requestedAt}</dd>
              </div>
            </dl>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => onReject(item)} className="gap-2">
                <X className="h-4 w-4" />
                Rechazar
              </Button>
              <Button onClick={() => onApprove(item)} className="gap-2">
                <Check className="h-4 w-4" />
                Aprobar suscripción
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// MAQUETA: los 3 pasos son una animación. Con Supabase se ejecutarán de verdad y en este orden:
// 1) marcar la suscripción como aprobada, 2) crear el usuario de Auth con rol cliente, 3) enviar el correo con sus credenciales.
const APPROVAL_STEPS: { icon: LucideIcon; title: string; doneTitle: string; detail: string }[] = [
  {
    icon: ShieldCheck,
    title: "Aprobando suscripción",
    doneTitle: "Suscripción aprobada",
    detail: "Se confirma el pago y se activa el plan.",
  },
  {
    icon: KeyRound,
    title: "Creando credenciales de su espacio de cliente",
    doneTitle: "Credenciales creadas",
    detail: "Se genera su usuario y una contraseña temporal.",
  },
  {
    icon: Send,
    title: "Enviando credenciales",
    doneTitle: "Credenciales enviadas",
    detail: "Le llegan por correo para que entre a su panel.",
  },
]

const STEP_MS = 1900

function ApprovalDialog({
  item,
  onFinished,
  onClose,
}: {
  item: PendingSubscription | null
  onFinished: (item: PendingSubscription) => void
  onClose: () => void
}) {
  // current = paso en curso (0..2); al valer 3 todos están completos
  const [current, setCurrent] = useState(0)
  const done = current >= APPROVAL_STEPS.length

  useEffect(() => {
    // sin solicitud (modal cerrado) el avance vuelve a cero, para que la siguiente arranque limpia
    setCurrent(0)
    if (!item) return
    const timers = APPROVAL_STEPS.map((_, i) => setTimeout(() => setCurrent(i + 1), STEP_MS * (i + 1)))
    return () => timers.forEach(clearTimeout)
  }, [item])

  // La persona pasa a la lista de clientes cuando termina el último paso
  useEffect(() => {
    if (item && done) onFinished(item)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && done && onClose()}>
      <DialogContent
        className={`sm:max-w-md ${done ? "" : "[&>button]:hidden"}`}
        onInteractOutside={(e) => !done && e.preventDefault()}
        onEscapeKeyDown={(e) => !done && e.preventDefault()}
      >
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>{done ? "¡Suscripción aprobada!" : "Aprobando suscripción"}</DialogTitle>
              <DialogDescription>
                {item.name} · {item.plan}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {APPROVAL_STEPS.map((step, i) => {
                const state = i < current ? "done" : i === current ? "active" : "pending"
                const Icon = step.icon
                const isLast = i === APPROVAL_STEPS.length - 1

                return (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                          state === "done"
                            ? "border-black bg-black text-white"
                            : state === "active"
                              ? "border-black bg-white text-black"
                              : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {state === "done" ? (
                          <Check key="done" className="h-5 w-5 animate-in zoom-in-50 duration-300" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                        {state === "active" && (
                          <Loader2 className="absolute -inset-1 h-[52px] w-[52px] animate-spin text-black/40" strokeWidth={1.2} />
                        )}
                      </div>
                      {!isLast && (
                        <div className="my-1 h-10 w-0.5 overflow-hidden rounded-full bg-border">
                          <div
                            className="w-full bg-black transition-all ease-linear"
                            style={{
                              height: state === "done" ? "100%" : "0%",
                              transitionDuration: state === "done" ? "500ms" : "0ms",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className={`pb-6 pt-2 transition-opacity duration-500 ${state === "pending" ? "opacity-40" : "opacity-100"}`}>
                      <p className="font-semibold leading-tight">{state === "done" ? step.doneTitle : step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {state === "active" ? (
                          <span className="inline-flex items-center gap-1">
                            En proceso
                            <span className="inline-flex gap-0.5">
                              <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                              <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                              <span className="h-1 w-1 animate-bounce rounded-full bg-current" />
                            </span>
                          </span>
                        ) : (
                          step.detail
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-black transition-all duration-700 ease-out"
                style={{ width: `${(Math.min(current, APPROVAL_STEPS.length) / APPROVAL_STEPS.length) * 100}%` }}
              />
            </div>

            <DialogFooter className="min-h-9 items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {done ? `Credenciales enviadas a ${item.email}` : "Esto tarda unos segundos…"}
              </p>
              {done && (
                <Button onClick={onClose} className="animate-in fade-in duration-500">
                  Listo
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function AdminClients() {
  const { clients, pending, approve, reject } = useClients()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ClientsTab>("clientes")
  const [reviewing, setReviewing] = useState<PendingSubscription | null>(null)
  const [approving, setApproving] = useState<PendingSubscription | null>(null)

  // Aprobar abre el modal de 3 pasos; la persona pasa a Clientes cuando la animación termina
  const handleApprove = (item: PendingSubscription) => {
    setReviewing(null)
    setApproving(item)
  }

  const handleApprovalFinished = async (item: PendingSubscription) => {
    const ok = await approve(item.id)
    if (ok) {
      toast({ title: "Suscripción aprobada", description: `${item.name} ya es cliente del ${item.plan}.` })
    } else {
      toast({ title: "No se pudo aprobar la suscripción", variant: "destructive" })
    }
  }

  const handleReject = async (item: PendingSubscription) => {
    setReviewing(null)
    const ok = await reject(item.id)
    if (ok) {
      toast({ title: "Suscripción rechazada", description: `Se descartó la solicitud de ${item.name}.` })
    } else {
      toast({ title: "No se pudo rechazar la solicitud", variant: "destructive" })
    }
  }

  const tabs: { id: ClientsTab; label: string; count: number }[] = [
    { id: "clientes", label: "Clientes", count: clients.length },
    { id: "pendientes", label: "Pendientes de aprobación", count: pending.length },
  ]

  return (
    <>
      <PageHeader
        title="Clientes"
        description={`${clients.length} clientes registrados · ${pending.length} suscripciones por aprobar.`}
      />

      <div className="mb-6 inline-flex rounded-full bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-black text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                tab === t.id ? "bg-white/20 text-white" : t.id === "pendientes" && t.count > 0 ? "bg-black text-white" : "bg-background"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "clientes" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Correo</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Desde</TableHead>
                  <TableHead className="hidden w-40 lg:table-cell">Progreso</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow
                    key={c.id}
                    tabIndex={0}
                    role="link"
                    aria-label={`Ver detalle de ${c.name}`}
                    onClick={() => navigate(`/panel/clientes/${c.id}`)}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/panel/clientes/${c.id}`)}
                    className="cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none"
                  >
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{c.email}</TableCell>
                    <TableCell>{c.plan}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{c.since}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Progress value={c.progress} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <ChevronRight className="h-4 w-4" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "pendientes" && (
        <>
          <p className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
            <Banknote className="mt-0.5 h-4 w-4 shrink-0" />
            Por ahora el pago es solo por transferencia bancaria. Quien compra un plan y adjunta su comprobante aparece aquí
            hasta que verifiques el pago y apruebes la suscripción.
          </p>
          <Card>
            <CardContent className="p-0">
              {pending.length === 0 ? (
                <p className="p-10 text-center text-muted-foreground">No hay suscripciones pendientes de aprobación.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="hidden md:table-cell">Monto</TableHead>
                      <TableHead className="hidden lg:table-cell">Enviado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </TableCell>
                        <TableCell>{p.plan}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.amount} €</TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">{p.requestedAt}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Pendiente aprobación</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => setReviewing(p)}>
                            Revisar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <ApprovalDialog item={approving} onFinished={handleApprovalFinished} onClose={() => setApproving(null)} />
      <VoucherDialog item={reviewing} onClose={() => setReviewing(null)} onApprove={handleApprove} onReject={handleReject} />
      <MockNotice />
    </>
  )
}

export function AdminAgenda() {
  const days = Array.from(new Set(APPOINTMENTS.map((a) => a.day)))

  return (
    <>
      <PageHeader title="Calendario" description="Sesiones programadas con tus clientes." />
      <div className="space-y-6">
        {days.map((day) => (
          <div key={day}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{day}</h2>
            <div className="space-y-3">
              {APPOINTMENTS.filter((a) => a.day === day).map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-4">
                      <span className="w-14 text-lg font-bold tabular-nums">{a.time}</span>
                      <div>
                        <p className="font-semibold">{a.client}</p>
                        <p className="text-sm text-muted-foreground">
                          {a.type} · {a.place}
                        </p>
                      </div>
                    </div>
                    <Badge variant={a.status === "Confirmada" ? "default" : "secondary"}>{a.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <MockNotice />
    </>
  )
}
