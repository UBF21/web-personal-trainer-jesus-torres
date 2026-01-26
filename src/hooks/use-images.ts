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
    const fetchImages = async () => {
      try {
        setLoading(true)
        const response = category
          ? await api.images.getByCategory(category)
          : await api.images.getAll()

        if (response.success) {
          setImages(response.data)
        } else {
          setError(response.error)
        }
      } catch (err) {
        setError("Error al cargar imágenes")
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [category])

  return { images, loading, error }
}
