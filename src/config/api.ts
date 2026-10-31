export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"

export interface CheckoutPayload {
  amount: number
  description: string
  currency?: "EUR" | "USD"
  externalReference?: string
  metadata?: Record<string, string>
}

export const api = {
  images: {
    getAll: () => fetch(`${API_URL}/images`).then((res) => res.json()),
    getByCategory: (category: string) =>
      fetch(`${API_URL}/images?category=${category}`).then((res) => res.json()),
    getById: (id: string) =>
      fetch(`${API_URL}/images/${encodeURIComponent(id)}`).then((res) => res.json()),
  },
  payments: {
    createCheckout: (payload: CheckoutPayload) =>
      fetch(`${API_URL}/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => res.json()),
  },
}
