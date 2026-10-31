import { useState } from "react"
import { api, CheckoutPayload } from "@/config/api"

export function useCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(payload: CheckoutPayload) {
    setLoading(true)
    setError(null)

    try {
      const response = await api.payments.createCheckout(payload)

      if (!response.success || !response.data?.checkoutUrl) {
        throw new Error(response.error || "No se pudo iniciar el pago")
      }

      window.location.href = response.data.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago")
      setLoading(false)
    }
  }

  return { startCheckout, loading, error }
}
