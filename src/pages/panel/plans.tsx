import { useEffect, useState } from "react"
import { Check, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useClients } from "@/contexts/clients-context"
import { api, type Plan, type PlanInput } from "@/config/api"
import { toast } from "@/hooks/use-toast"
import { PageHeader } from "./panel-ui"

const EMPTY_FORM: PlanInput = {
  name: "",
  nameEn: "",
  price: 0,
  duration: "",
  durationEn: "",
  description: "",
  descriptionEn: "",
  features: [],
  featuresEn: [],
  popular: false,
}

function toFormState(plan: Plan): PlanInput {
  return {
    name: plan.name,
    nameEn: plan.nameEn ?? "",
    price: plan.price,
    duration: plan.duration,
    durationEn: plan.durationEn ?? "",
    description: plan.description,
    descriptionEn: plan.descriptionEn ?? "",
    features: plan.features,
    featuresEn: plan.featuresEn ?? [],
    popular: plan.popular,
  }
}

function PlanFormDialog({
  open,
  plan,
  onClose,
  onSaved,
}: {
  open: boolean
  plan: Plan | null
  onClose: () => void
  onSaved: (plan: Plan, isNew: boolean) => void
}) {
  const [form, setForm] = useState<PlanInput>(EMPTY_FORM)
  const [featuresText, setFeaturesText] = useState("")
  const [featuresEnText, setFeaturesEnText] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const initial = plan ? toFormState(plan) : EMPTY_FORM
    setForm(initial)
    setFeaturesText(initial.features.join("\n"))
    setFeaturesEnText((initial.featuresEn ?? []).join("\n"))
  }, [open, plan])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload: PlanInput = {
      ...form,
      price: Number(form.price),
      features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
      featuresEn: featuresEnText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      nameEn: form.nameEn?.trim() || null,
      durationEn: form.durationEn?.trim() || null,
      descriptionEn: form.descriptionEn?.trim() || null,
    }

    setSaving(true)
    try {
      const res = plan ? await api.plans.update(plan.id, payload) : await api.plans.create(payload)
      if (!res.success || !res.data) throw new Error(res.error || "No se pudo guardar el plan")
      toast({ title: plan ? "Plan actualizado" : "Plan creado" })
      onSaved(res.data, !plan)
    } catch (err) {
      toast({
        title: "No se pudo guardar el plan",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan ? "Editar plan" : "Nuevo plan"}</DialogTitle>
          <DialogDescription>Esto se refleja también en la página pública de planes.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Nombre (ES)</Label>
              <Input
                id="plan-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-name-en">Nombre (EN, opcional)</Label>
              <Input
                id="plan-name-en"
                value={form.nameEn ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-price">Precio (EUR)</Label>
              <Input
                id="plan-price"
                type="number"
                min={0}
                step="1"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="flex items-end justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="plan-popular" className="text-sm">
                Destacar como "Más popular"
              </Label>
              <Switch
                id="plan-popular"
                checked={!!form.popular}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, popular: checked }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-duration">Duración (ES)</Label>
              <Input
                id="plan-duration"
                placeholder="Ej. 3 Meses"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-duration-en">Duración (EN, opcional)</Label>
              <Input
                id="plan-duration-en"
                placeholder="E.g. 3 Months"
                value={form.durationEn ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, durationEn: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-description">Descripción corta (ES)</Label>
              <Input
                id="plan-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-description-en">Descripción corta (EN, opcional)</Label>
              <Input
                id="plan-description-en"
                value={form.descriptionEn ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-features">Beneficios (ES) — uno por línea</Label>
              <Textarea
                id="plan-features"
                rows={6}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-features-en">Beneficios (EN, opcional) — uno por línea</Label>
              <Textarea id="plan-features-en" rows={6} value={featuresEnText} onChange={(e) => setFeaturesEnText(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminPlans() {
  const { clients } = useClients()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadPlans() {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await api.plans.getAll()
      if (!res.success || !res.data) throw new Error(res.error || "No se pudieron cargar los planes")
      setPlans(res.data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "No se pudieron cargar los planes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  function openCreate() {
    setEditingPlan(null)
    setDialogOpen(true)
  }

  function openEdit(plan: Plan) {
    setEditingPlan(plan)
    setDialogOpen(true)
  }

  function handleSaved(plan: Plan, isNew: boolean) {
    setPlans((prev) => (isNew ? [...prev, plan] : prev.map((p) => (p.id === plan.id ? plan : p))))
    setDialogOpen(false)
  }

  async function handleDelete(plan: Plan) {
    if (!window.confirm(`¿Eliminar "${plan.name}"? Esto lo quita también de la página pública.`)) return

    setDeletingId(plan.id)
    try {
      const res = await api.plans.delete(plan.id)
      if (!res.success) throw new Error(res.error || "No se pudo eliminar")
      setPlans((prev) => prev.filter((p) => p.id !== plan.id))
      toast({ title: "Plan eliminado" })
    } catch (err) {
      toast({
        title: "No se pudo eliminar el plan",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Planes"
        description="Los mismos planes que se muestran en la web — editarlos acá los cambia ahí también."
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo plan
          </Button>
        }
      />

      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando planes…
        </div>
      )}

      {!loading && loadError && <p className="py-6 text-center text-sm text-destructive">{loadError}</p>}

      {!loading && !loadError && (
        <div className="grid items-stretch gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.id} className={p.popular ? "border-2 border-black" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{p.name}</CardTitle>
                  {p.popular && <Badge>Más popular</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <p className="pt-2 text-4xl font-bold">
                  {p.price}€<span className="ml-2 text-sm font-normal text-muted-foreground">EUR</span>
                </p>
                <p className="text-sm text-muted-foreground">{p.duration}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Badge variant="secondary">{clients.filter((c) => c.plan === p.name).length} clientes</Badge>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    disabled={deletingId === p.id}
                    onClick={() => handleDelete(p)}
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlanFormDialog
        open={dialogOpen}
        plan={editingPlan}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />
    </>
  )
}
