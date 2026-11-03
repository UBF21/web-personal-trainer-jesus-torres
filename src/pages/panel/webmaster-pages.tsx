import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ROLE_LABEL, type Role } from "@/contexts/auth-context"
import { api } from "@/config/api"
import { toast } from "@/hooks/use-toast"
import { CLIENTS, SITE_SECTIONS } from "@/lib/mock-data"
import { MockNotice, PageHeader } from "./panel-ui"

interface ManagedUser {
  name: string
  email: string
  role: Role
}

const USERS: ManagedUser[] = [
  { name: "Webmaster JT", email: "webmaster@jttraining.com", role: "webmaster" },
  { name: "Jesús Torres", email: "admin@jttraining.com", role: "administrador" },
  ...CLIENTS.map((c): ManagedUser => ({ name: c.name, email: c.email, role: "cliente" })),
]

const ROLE_VARIANT = { webmaster: "default", administrador: "secondary", cliente: "outline" } as const

const PERMISSIONS: { label: string; roles: Role[] }[] = [
  { label: "Ver su resumen, plan y citas", roles: ["cliente", "administrador", "webmaster"] },
  { label: "Gestionar clientes, planes y agenda", roles: ["administrador", "webmaster"] },
  { label: "Gestionar usuarios y roles", roles: ["webmaster"] },
  { label: "Configurar el sitio web", roles: ["webmaster"] },
]

export function WebmasterUsers() {
  return (
    <>
      <PageHeader title="Usuarios y roles" description="Quién tiene acceso al panel y con qué rol." />

      <Card className="mb-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Correo</TableHead>
                <TableHead>Rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.map((u) => (
                <TableRow key={u.email}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_VARIANT[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos por rol</CardTitle>
          <CardDescription>Qué puede hacer cada tipo de usuario.</CardDescription>
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
              {PERMISSIONS.map((p) => (
                <TableRow key={p.label}>
                  <TableCell>{p.label}</TableCell>
                  {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                    <TableCell key={r} className="text-center">
                      {p.roles.includes(r) ? "✓" : "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <MockNotice />
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
