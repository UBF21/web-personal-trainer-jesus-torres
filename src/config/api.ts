export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"

export const api = {
  images: {
    getAll: () => fetch(`${API_URL}/images`).then((res) => res.json()),
    getByCategory: (category: string) =>
      fetch(`${API_URL}/images?category=${category}`).then((res) => res.json()),
    getById: (id: string) =>
      fetch(`${API_URL}/images/${encodeURIComponent(id)}`).then((res) => res.json()),
  },
}
