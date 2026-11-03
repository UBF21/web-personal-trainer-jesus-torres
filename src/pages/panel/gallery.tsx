import { useEffect, useRef, useState } from "react"
import {
  CheckCircle2,
  EyeOff,
  ImageOff,
  Loader2,
  MoreVertical,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrainerGallery } from "@/components/trainer-gallery"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api, type GalleryImage } from "@/config/api"
import { toast } from "@/hooks/use-toast"
import { PageHeader } from "./panel-ui"

const CATEGORY = "gallery"

export default function PanelGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeImages = images.filter((i) => i.active !== false)

  async function loadImages() {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await api.images.getByCategory(CATEGORY)
      if (!res.success || !res.data) throw new Error(res.error || "No se pudieron cargar las fotos")
      setImages(res.data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "No se pudieron cargar las fotos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [])

  async function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (imageFiles.length === 0) {
      toast({ title: "Solo se permiten imágenes", variant: "destructive" })
      return
    }

    setUploading(true)
    for (const file of imageFiles) {
      try {
        const res = await api.images.upload(file, CATEGORY)
        if (!res.success) throw new Error(res.error || "Error al subir")
      } catch (err) {
        toast({
          title: `No se pudo subir "${file.name}"`,
          description: err instanceof Error ? err.message : undefined,
          variant: "destructive",
        })
      }
    }
    setUploading(false)
    loadImages()
  }

  async function handleToggleActive(image: GalleryImage) {
    const nextActive = !(image.active !== false)
    setBusyId(image.id)
    try {
      const res = await api.images.setActive(image.id, nextActive)
      if (!res.success) throw new Error(res.error || "No se pudo actualizar la foto")
      setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, active: nextActive } : i)))
      toast({ title: nextActive ? "Foto activada" : "Foto desactivada" })
    } catch (err) {
      toast({
        title: "No se pudo actualizar la foto",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(image: GalleryImage) {
    setBusyId(image.id)
    try {
      const res = await api.images.delete(image.id)
      if (!res.success) throw new Error(res.error || "No se pudo borrar")
      setImages((prev) => prev.filter((i) => i.id !== image.id))
      toast({ title: "Foto eliminada" })
    } catch (err) {
      toast({
        title: "No se pudo borrar la foto",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Galería del carrusel"
        description="Las fotos que se muestran en la sección de galería de la página principal."
      />

      {!loading && activeImages.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border border-border">
          <p className="bg-black py-3 text-center text-xs font-bold uppercase tracking-widest text-white/50">
            Vista previa — así se ve en la página principal
          </p>
          <TrainerGallery images={activeImages.map((img) => img.url)} hideHeading />
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="p-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files)
              e.target.value = ""
            }}
          />
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center transition-colors ${
              dragOver ? "border-foreground bg-muted" : "border-border hover:border-foreground/50"
            }`}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">
              {uploading ? "Subiendo…" : "Arrastra fotos acá o hacé clic para elegirlas"}
            </p>
            <p className="text-xs text-muted-foreground">Podés subir varias a la vez · JPG, PNG o WebP</p>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Cargando fotos…
        </div>
      )}

      {!loading && loadError && (
        <p className="py-6 text-center text-sm text-destructive">{loadError}</p>
      )}

      {!loading && !loadError && images.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm">Todavía no hay fotos en la galería.</p>
        </div>
      )}

      {!loading && images.length > 0 && (
        <>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Fotos de la galería ({images.length}) · {activeImages.length} en el carrusel
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image) => {
              const isActive = image.active !== false
              const isBusy = busyId === image.id
              return (
                <div
                  key={image.id}
                  className={`group relative aspect-[3/4] overflow-hidden rounded-lg border border-border ${
                    isActive ? "" : "opacity-50"
                  }`}
                >
                  <img src={image.url} alt={image.alt || image.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/50" />

                  {isActive ? (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      En el carrusel
                    </span>
                  ) : (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-muted-foreground/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      <EyeOff className="h-3 w-3" />
                      Oculta
                    </span>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        disabled={isBusy}
                        className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Opciones de la foto"
                      >
                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleActive(image)}>
                        {isActive ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Desactivar (quitar del carrusel)
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Activar (mostrar en el carrusel)
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(image)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
