import { useEffect, useState } from "react"
import { Check, KeyRound, Loader2, Minus, ShieldCheck, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ROLE_LABEL, useAuth, type Role } from "@/contexts/auth-context"
import { api, type ManagedUser } from "@/config/api"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { SITE_SECTIONS } from "@/lib/mock-data"
import { PageHeader } from "./panel-ui"

const ROLE_VARIANT = { webmaster: "default", administrador: "secondary", cliente: "outline" } as const

type PermissionKey = "operations" | "site"

// Qué puede delegarse al administrador (toggle real, vía role_permissions)
// y qué queda fijo. "Gestionar usuarios y roles" nunca es delegable — ver
// supabase/migrations/0014_role_permissions.sql.
const TOGGLABLE_PERMISSIONS: { key: PermissionKey; label: string }[] = [
  { key: "operations", label: "Gestionar clientes, planes y agenda" },
  { key: "site", label: "Configurar el sitio web" },
]

function UserEditDialog({
  user,
  onClose,
  onUpdated,
  onDeleted,
}: {
  user: ManagedUser | null
  onClose: () => void
  onUpdated: (u: ManagedUser) => void
  onDeleted: (id: string) => void
}) {
  const [newPassword, setNewPassword] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null
  const isWebmasterRow = user.role === "webmaster"

  async function handleToggleRole() {
    if (!user) return
    setBusy("role")
    setError(null)
    const nextRole = user.role === "administrador" ? "cliente" : "administrador"
    const res = await api.users.setRole(user.id, nextRole)
    setBusy(null)
    if (!res.success) {
      setError(res.error ?? "Error inesperado")
      return
    }
    onUpdated({ ...user, role: nextRole })
  }

  async function handleToggleBan() {
    if (!user) return
    setBusy("ban")
    setError(null)
    const res = await api.users.setBanned(user.id, !user.banned)
    setBusy(null)
    if (!res.success) {
      setError(res.error ?? "Error inesperado")
      return
    }
    onUpdated({ ...user, banned: !user.banned })
  }

  async function handleResetPassword() {
    if (!user) return
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    setBusy("password")
    setError(null)
    const res = await api.users.resetPassword(user.id, newPassword)
    setBusy(null)
    if (!res.success) {
      setError(res.error ?? "Error inesperado")
      return
    }
    setNewPassword("")
    toast({ title: "Contraseña restablecida" })
  }

  async function handleDelete() {
    if (!user) return
    if (!confirm(`¿Eliminar la cuenta de ${user.email}? Esta acción no se puede deshacer.`)) return
    setBusy("delete")
    setError(null)
    const res = await api.users.remove(user.id)
    setBusy(null)
    if (!res.success) {
      setError(res.error ?? "Error inesperado")
      return
    }
    onDeleted(user.id)
  }

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user.name || user.email}</DialogTitle>
          <DialogDescription>
            {user.email} · <Badge variant={ROLE_VARIANT[user.role]}>{ROLE_LABEL[user.role]}</Badge>
            {user.banned && <Badge variant="destructive" className="ml-1">Inactiva</Badge>}
          </DialogDescription>
        </DialogHeader>

        {isWebmasterRow ? (
          <p className="text-sm text-muted-foreground">
            La cuenta webmaster no se puede editar, desactivar ni eliminar desde acá.
          </p>
        ) : (
          <div className="space-y-5">
            <section>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Rol
              </p>
              <Button variant="outline" size="sm" disabled={busy === "role"} onClick={handleToggleRole} className="gap-2">
                {busy === "role" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {user.role === "administrador" ? "Quitar administrador" : "Hacer administrador"}
              </Button>
            </section>

            <section className="border-t border-border pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <KeyRound className="h-3.5 w-3.5" />
                Restablecer contraseña
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button variant="outline" size="sm" disabled={busy === "password"} onClick={handleResetPassword} className="shrink-0 gap-2">
                  {busy === "password" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Aplicar
                </Button>
              </div>
            </section>

            <section className="border-t border-border pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-destructive">
                <TriangleAlert className="h-3.5 w-3.5" />
                Zona de riesgo
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" disabled={busy === "ban"} onClick={handleToggleBan} className="gap-2">
                  {busy === "ban" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {user.banned ? "Reactivar cuenta" : "Inactivar cuenta"}
                </Button>
                <Button variant="destructive" size="sm" disabled={busy === "delete"} onClick={handleDelete} className="gap-2">
                  {busy === "delete" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Eliminar usuario
                </Button>
              </div>
            </section>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}

export function WebmasterUsers() {
  const { user: viewer } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ManagedUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
    loadPermissions()
  }, [])

  async function loadUsers() {
    setLoading(true)
    const res = await api.users.list()
    if (!res.success) {
      setError(res.error ?? "No se pudo cargar la lista de usuarios")
    } else {
      setUsers(res.data ?? [])
    }
    setLoading(false)
  }

  async function loadPermissions() {
    setLoadingPermissions(true)
    const { data } = await supabase.from("role_permissions").select("permission_key, administrador")
    setPermissions(Object.fromEntries((data ?? []).map((p) => [p.permission_key, p.administrador])))
    setLoadingPermissions(false)
  }

  async function togglePermission(key: PermissionKey) {
    const next = !permissions[key]
    setUpdatingKey(key)
    const { error: updateError } = await supabase
      .from("role_permissions")
      .update({ administrador: next })
      .eq("permission_key", key)
    setUpdatingKey(null)

    if (updateError) {
      toast({ title: "No se pudo actualizar el permiso", description: updateError.message, variant: "destructive" })
      return
    }
    setPermissions((prev) => ({ ...prev, [key]: next }))
  }

  return (
    <>
      <PageHeader title="Usuarios y roles" description="Quién tiene acceso al panel y con qué rol." />

      <Card className="mb-6">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-muted-foreground">Cargando usuarios…</p>
          ) : error ? (
            <p className="p-5 text-sm text-destructive">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Correo</TableHead>
                  <TableHead>Rol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow
                    key={u.id}
                    className={u.email === viewer?.email ? "" : "cursor-pointer"}
                    onClick={() => u.email !== viewer?.email && setSelected(u)}
                  >
                    <TableCell className="font-medium">{u.name || "Sin nombre"}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                      {u.banned && <Badge variant="destructive" className="ml-1">Inactiva</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos por rol</CardTitle>
          <CardDescription>
            Qué puede hacer cada tipo de usuario. Toca una celda de Administrador para activar o quitar ese permiso.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permiso</TableHead>
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                  <TableHead key={r} className="text-center">
                    {ROLE_LABEL[r]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Ver su resumen, plan y citas</TableCell>
                <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-600" /></TableCell>
                <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-600" /></TableCell>
                <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-600" /></TableCell>
              </TableRow>

              {TOGGLABLE_PERMISSIONS.map((perm) => {
                const granted = !!permissions[perm.key]
                return (
                  <TableRow key={perm.key}>
                    <TableCell>{perm.label}</TableCell>
                    <TableCell className="text-center">
                      <Check className="mx-auto h-4 w-4 text-green-600" />
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => togglePermission(perm.key)}
                        disabled={loadingPermissions || updatingKey === perm.key}
                        aria-label={`${granted ? "Quitar" : "Dar"} permiso: ${perm.label}`}
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded border transition-colors disabled:opacity-50 ${
                          granted ? "border-green-600 bg-green-50" : "border-border bg-background"
                        } hover:border-primary`}
                      >
                        {updatingKey === perm.key ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        ) : granted ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-center"><Minus className="mx-auto h-4 w-4 text-muted-foreground/40" /></TableCell>
                  </TableRow>
                )
              })}

              <TableRow>
                <TableCell>Gestionar usuarios y roles</TableCell>
                <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-600" /></TableCell>
                <TableCell className="text-center"><Minus className="mx-auto h-4 w-4 text-muted-foreground/40" /></TableCell>
                <TableCell className="text-center"><Minus className="mx-auto h-4 w-4 text-muted-foreground/40" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Gestionar usuarios y roles, inactivar/eliminar cuentas y restablecer contraseñas quedan
        reservados solo para el webmaster, por seguridad.
      </p>

      <UserEditDialog
        user={selected}
        onClose={() => setSelected(null)}
        onUpdated={(updated) => {
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
          setSelected(updated)
        }}
        onDeleted={(id) => {
          setUsers((prev) => prev.filter((u) => u.id !== id))
          setSelected(null)
        }}
      />
    </>
  )
}

export function WebmasterSite() {
  const [maintenance, setMaintenance] = useState(false)
  const [loadingMaintenance, setLoadingMaintenance] = useState(true)
  const [savingMaintenance, setSavingMaintenance] = useState(false)
  const [sections, setSections] = useState(SITE_SECTIONS)

  useEffect(() => {
    api.settings.getMaintenanceMode().then((res) => {
      if (res.success) setMaintenance(!!res.data)
      setLoadingMaintenance(false)
    })
  }, [])

  async function handleMaintenanceToggle(checked: boolean) {
    setMaintenance(checked)
    setSavingMaintenance(true)
    const res = await api.settings.setMaintenanceMode(checked)
    setSavingMaintenance(false)

    if (!res.success) {
      setMaintenance(!checked)
      toast({
        title: "No se pudo actualizar el modo mantenimiento",
        description: res.error,
        variant: "destructive",
      })
      return
    }

    toast({ title: checked ? "Modo mantenimiento activado" : "Modo mantenimiento desactivado" })
  }

  const toggle = (id: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)))

  return (
    <>
      <PageHeader title="Sitio web" description="Controla qué ve el público en la web." />

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="font-semibold">Modo mantenimiento</p>
            <p className="text-sm text-muted-foreground">Muestra una página de mantenimiento a los visitantes.</p>
          </div>
          <Switch
            checked={maintenance}
            onCheckedChange={handleMaintenanceToggle}
            disabled={loadingMaintenance || savingMaintenance}
            aria-label="Modo mantenimiento"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Secciones del landing</CardTitle>
          <CardDescription>Muestra u oculta cada sección de la página principal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm font-medium">{s.name}</span>
              <Switch checked={s.visible} onCheckedChange={() => toggle(s.id)} aria-label={s.name} />
            </div>
          ))}
          <p className="pt-1 text-xs text-muted-foreground">
            Maqueta: estos interruptores todavía no ocultan nada en la web real.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
