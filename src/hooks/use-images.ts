import { useState, useEffect } from "react"
import { api } from "@/config/api"

interface ImageData {
  id: string
  name: string
  url: string
  category: string
  alt?: string
}

export function useImages(category?: string) {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    const fetchImages = async () => {
      try {
        setLoading(true)
        const response = category
          ? await api.images.getByCategory(category)
          : await api.images.getAll()

        clearTimeout(timeoutId)

        if (response.success && response.data && response.data.length > 0) {
          setImages(response.data)
        } else {
          // Si no hay imágenes o hay error, usar fallback (array vacío)
          setImages([])
          setError(response.error || "No images found")
        }
      } catch (err) {
        clearTimeout(timeoutId)
        // En caso de error (timeout, network error, etc), usar fallback
        setImages([])
        setError("Error al cargar imágenes - usando imagen local")
        console.warn("Failed to load images from backend, using fallback:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [category])

  return { images, loading, error }
}
