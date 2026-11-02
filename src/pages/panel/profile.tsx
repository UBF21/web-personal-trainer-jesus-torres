import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROLE_LABEL, useAuth } from "@/contexts/auth-context"
import { MockNotice, PageHeader } from "./panel-ui"

export default function Profile() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <>
      <PageHeader title="Mi perfil" description="Datos de tu cuenta." />
      <Card className="max-w-xl">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rol</span>
            <Badge>{ROLE_LABEL[user.role]}</Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input id="profile-name" value={user.name} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Correo</Label>
            <Input id="profile-email" value={user.email} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-user">Usuario</Label>
            <Input id="profile-user" value={user.username} readOnly />
          </div>
        </CardContent>
      </Card>
      <MockNotice />
    </>
  )
}
