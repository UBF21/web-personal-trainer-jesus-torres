export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"

export interface CheckoutPayload {
  amount: number
  description: string
  currency?: "EUR" | "USD"
  externalReference?: string
  metadata?: Record<string, string>
}

export interface GalleryImage {
  id: string
  name: string
  url: string
  category: string
  alt?: string
  order?: number
  active?: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Plan {
  id: string
  name: string
  nameEn?: string | null
  price: number
  duration: string
  durationEn?: string | null
  description: string
  descriptionEn?: string | null
  features: string[]
  featuresEn?: string[] | null
  popular: boolean
  order?: number | null
  createdAt: string
  updatedAt: string
}

export type PlanInput = Omit<Plan, "id" | "order" | "createdAt" | "updatedAt">

export interface ApiClient {
  id: string
  name: string
  email: string
  plan: string
  status: "Activo" | "Pausado" | "Nuevo"
  progress: number
  createdAt: string
}

export interface PendingSubscription {
  id: string
  name: string
  email: string
  plan: string
  amount: number
  bank?: string | null
  operation?: string | null
  voucher?: string | null
  createdAt: string
}

export interface PendingSubscriptionInput {
  name: string
  email: string
  plan: string
  amount: number
  bank?: string | null
  operation?: string | null
  voucher?: string | null
}

export const api = {
  images: {
    getAll: (): Promise<ApiResponse<GalleryImage[]>> => fetch(`${API_URL}/images`).then((res) => res.json()),
    getByCategory: (category: string, activeOnly = false): Promise<ApiResponse<GalleryImage[]>> =>
      fetch(`${API_URL}/images?category=${category}${activeOnly ? "&activeOnly=true" : ""}`).then((res) =>
        res.json()
      ),
    getById: (id: string): Promise<ApiResponse<GalleryImage>> =>
      fetch(`${API_URL}/images/${encodeURIComponent(id)}`).then((res) => res.json()),
    upload: (file: File, category: string, alt?: string): Promise<ApiResponse<GalleryImage>> => {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("category", category)
      if (alt) formData.append("alt", alt)
      return fetch(`${API_URL}/images`, { method: "POST", body: formData }).then((res) => res.json())
    },
    delete: (id: string): Promise<ApiResponse<null>> =>
      fetch(`${API_URL}/images/${encodeURIComponent(id)}`, { method: "DELETE" }).then((res) => res.json()),
    setActive: (id: string, active: boolean): Promise<ApiResponse<GalleryImage>> =>
      fetch(`${API_URL}/images/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      }).then((res) => res.json()),
  },
  plans: {
    getAll: (): Promise<ApiResponse<Plan[]>> => fetch(`${API_URL}/plans`).then((res) => res.json()),
    create: (input: PlanInput): Promise<ApiResponse<Plan>> =>
      fetch(`${API_URL}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => res.json()),
    update: (id: string, input: Partial<PlanInput>): Promise<ApiResponse<Plan>> =>
      fetch(`${API_URL}/plans/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => res.json()),
    delete: (id: string): Promise<ApiResponse<null>> =>
      fetch(`${API_URL}/plans/${encodeURIComponent(id)}`, { method: "DELETE" }).then((res) => res.json()),
  },
  clients: {
    getAll: (): Promise<ApiResponse<ApiClient[]>> => fetch(`${API_URL}/clients`).then((res) => res.json()),
    getPending: (): Promise<ApiResponse<PendingSubscription[]>> =>
      fetch(`${API_URL}/clients/pending`).then((res) => res.json()),
    createPending: (input: PendingSubscriptionInput): Promise<ApiResponse<PendingSubscription>> =>
      fetch(`${API_URL}/clients/pending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => res.json()),
    approvePending: (id: string): Promise<ApiResponse<ApiClient>> =>
      fetch(`${API_URL}/clients/pending/${encodeURIComponent(id)}/approve`, { method: "POST" }).then((res) =>
        res.json()
      ),
    rejectPending: (id: string): Promise<ApiResponse<null>> =>
      fetch(`${API_URL}/clients/pending/${encodeURIComponent(id)}`, { method: "DELETE" }).then((res) =>
        res.json()
      ),
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
