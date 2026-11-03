import { useState } from "react"
import { AtSign, KeyRound, Loader2, Mail, ShieldCheck, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROLE_LABEL, useAuth, type Role } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { MockNotice, PageHeader } from "./panel-ui"

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
  webmaster: "default",
  administrador: "secondary",
  cliente: "outline",
}

function Field({
  id,
  label,
  value,
  icon: Icon,
}: {
  id: string
  label: string
  value: string
  icon: typeof UserIcon
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>
      <Input id={id} value={value} readOnly className="bg-muted/40" />
    </div>
  )
}

function PasswordCard() {
  const { changePassword } = useAuth()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (next.length < 6) {
      toast({ title: "La nueva contraseña debe tener al menos 6 caracteres", variant: "destructive" })
      return
    }
    if (next !== confirm) {
      toast({ title: "Las contraseñas nuevas no coinciden", variant: "destructive" })
      return
    }

    setSaving(true)
    const result = await changePassword(current, next)
    setSaving(false)

    if (!result.ok) {
      toast({ title: "La contraseña actual no es correcta", variant: "destructive" })
      return
    }

    toast({ title: "Contraseña actualizada" })
    setCurrent("")
    setNext("")
    setConfirm("")
  }

  return (
    <Card>
      <CardContent className="p-6">
        <p className="mb-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <KeyRound className="h-3.5 w-3.5" />
          Cambiar contraseña
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña actual</Label>
            <Input
              id="current-password"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nueva</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Actualizar contraseña
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function Profile() {
  const { user } = useAuth()
  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <>
      <PageHeader title="Mi perfil" description="Datos de tu cuenta." />

      <div className="space-y-6">
        <Card className="overflow-hidden border-none bg-black text-white">
          <CardContent className="flex items-center gap-5 p-6 sm:p-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold text-black sm:h-20 sm:w-20 sm:text-2xl">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-bold sm:text-2xl">{user.name}</p>
              <p className="truncate text-sm text-white/60">{user.email}</p>
              <Badge variant={ROLE_VARIANT[user.role]} className="mt-2 gap-1">
                <ShieldCheck className="h-3 w-3" />
                {ROLE_LABEL[user.role]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-5 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Información de la cuenta
              </p>
              <Field id="profile-name" label="Nombre" value={user.name} icon={UserIcon} />
              <Field id="profile-email" label="Correo" value={user.email} icon={Mail} />
              <Field id="profile-user" label="Usuario" value={user.username} icon={AtSign} />
            </CardContent>
          </Card>

          <PasswordCard />
        </div>
      </div>

      <MockNotice />
    </>
  )
}
