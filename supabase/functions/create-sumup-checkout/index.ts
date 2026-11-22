// Edge Function: create-sumup-checkout
//
// Crea el checkout de SumUp para pagar un plan con tarjeta — alternativa a
// la transferencia bancaria (request-subscription). Guarda la solicitud en
// pending_subscriptions igual que esa, pero marcada payment_method='sumup'
// y con el id del checkout: cuando SumUp confirme el pago (ver
// sumup-webhook), esa solicitud pasa a ser cliente real sola, sin que
// nadie la apruebe a mano.
//
// Pública (no requiere login) — cualquiera puede iniciar un pago. Corre
// acá y no en el navegador porque la clave secreta de SumUp no puede
// vivir en el frontend.
//
// Deploy: pegar este archivo completo en Supabase Dashboard > Edge
// Functions > Deploy a new function > nombre: "create-sumup-checkout".
// Secrets necesarios (Edge Functions > Secrets, compartidos por todas las
// funciones del proyecto):
//   SUMUP_SECRET_KEY     — clave secreta de SumUp (sup_sk_...)
//   SUMUP_MERCHANT_CODE  — código de comercio de SumUp

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const SUMUP_SECRET_KEY = Deno.env.get("SUMUP_SECRET_KEY")!
const SUMUP_MERCHANT_CODE = Deno.env.get("SUMUP_MERCHANT_CODE")!

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS })
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405)

  let body: { name?: string; email?: string; plan?: string; amount?: number }
  try {
    body = await req.json()
  } catch {
    return json({ success: false, error: "Body inválido" }, 400)
  }

  const { name, email, plan, amount } = body
  if (!name || !email || !plan || amount === undefined) {
    return json({ success: false, error: "name, email, plan y amount son requeridos" }, 400)
  }

  const { data: pending, error: insertError } = await admin
    .from("pending_subscriptions")
    .insert({ name, email, plan, amount: Number(amount), payment_method: "sumup" })
    .select("id")
    .single()

  if (insertError || !pending) {
    return json({ success: false, error: insertError?.message || "No se pudo registrar la solicitud" }, 500)
  }

  try {
    const res = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUMUP_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: pending.id,
        amount: Number(amount),
        currency: "EUR",
        merchant_code: SUMUP_MERCHANT_CODE,
        description: `Plan ${plan} — JT Training`,
        return_url: `${SUPABASE_URL}/functions/v1/sumup-webhook`,
      }),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => null)
      await admin.from("pending_subscriptions").delete().eq("id", pending.id)
      console.error("create-sumup-checkout: SumUp respondió", res.status, errBody)
      return json(
        {
          success: false,
          error: `SumUp (${res.status}): ${errBody?.message || errBody?.error_code || "sin detalle"}. ¿SUMUP_SECRET_KEY/SUMUP_MERCHANT_CODE configurados?`,
        },
        502,
      )
    }

    const checkout = await res.json()
    await admin.from("pending_subscriptions").update({ sumup_checkout_id: checkout.id }).eq("id", pending.id)

    return json({ success: true, data: { pendingId: pending.id, checkoutId: checkout.id } })
  } catch (e) {
    await admin.from("pending_subscriptions").delete().eq("id", pending.id)
    return json({ success: false, error: e instanceof Error ? e.message : "Error inesperado" }, 500)
  }
})
