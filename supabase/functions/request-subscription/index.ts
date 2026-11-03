// Edge Function: request-subscription
//
// Alguien elige un plan en la web (sin iniciar sesión) y queda como
// "solicitud pendiente". Esta función:
// 1) guarda la solicitud en pending_subscriptions,
// 2) le confirma por correo al comprador (con los datos de la
//    transferencia, por si pierde la pantalla),
// 3) avisa a personaltrainerjesustorres@gmail.com que hay una nueva
//    solicitud para revisar y aprobar — igual que en FitBlood.
//
// Pública (no requiere login) — por eso no valida rol, cualquiera puede
// pedir un plan. Corre acá (no directo desde el navegador) únicamente
// porque enviar el correo necesita la API key de Resend, que no puede
// vivir en el frontend.
//
// Deploy: pegar este archivo completo en Supabase Dashboard > Edge
// Functions > Deploy a new function > nombre: "request-subscription".
// Usa los mismos secrets de proyecto que approve-subscription
// (RESEND_API_KEY, APPROVAL_EMAIL_FROM, PANEL_URL) — no hace falta
// configurarlos de nuevo.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const EMAIL_FROM = Deno.env.get("APPROVAL_EMAIL_FROM") ?? "JT Training <no-reply@juliojesustorres.com>"
const PANEL_URL = Deno.env.get("PANEL_URL") ?? "https://juliojesustorres.com"
const BUSINESS_EMAIL = "personaltrainerjesustorres@gmail.com"
const IBAN = "LT02 3130 0101 3018 4834"

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

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  })
  return { ok: res.ok, status: res.status }
}

function buyerEmailHtml(name: string, plan: string, amount: number) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="margin:0 0 12px">¡Gracias por tu solicitud, ${name}!</h2>
      <p>Registramos tu solicitud del plan <strong>${plan}</strong> (${amount}€).</p>
      <p>Para completarla, realiza la transferencia a:</p>
      <p style="background:#f4f4f4;padding:12px 16px;border-radius:8px;font-family:monospace">${IBAN}</p>
      <p>Indica como concepto el nombre del plan y envía el comprobante a
        <a href="mailto:${BUSINESS_EMAIL}" style="color:#000">${BUSINESS_EMAIL}</a>.</p>
      <p style="color:#777;font-size:13px">Te avisaremos por correo ni bien confirmemos el pago y tu plan quede activo.</p>
    </div>
  `
}

function businessEmailHtml(name: string, email: string, plan: string, amount: number) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="margin:0 0 12px">Nueva solicitud de plan</h2>
      <p><strong>${name}</strong> (${email}) solicitó el plan <strong>${plan}</strong> por ${amount}€.</p>
      <p>Revísala y apruébala desde tu panel cuando confirmes la transferencia:</p>
      <p><a href="${PANEL_URL}/panel/clientes" style="color:#000">Ver solicitudes pendientes →</a></p>
    </div>
  `
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS })
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405)

  let body: { name?: string; email?: string; plan?: string; amount?: number; bank?: string; operation?: string; voucher?: string }
  try {
    body = await req.json()
  } catch {
    return json({ success: false, error: "Body inválido" }, 400)
  }

  const { name, email, plan, amount } = body
  if (!name || !email || !plan || amount === undefined) {
    return json({ success: false, error: "name, email, plan y amount son requeridos" }, 400)
  }

  const { data, error } = await admin
    .from("pending_subscriptions")
    .insert({
      name,
      email,
      plan,
      amount: Number(amount),
      bank: body.bank ?? null,
      operation: body.operation ?? null,
      voucher: body.voucher ?? null,
    })
    .select("*")
    .single()

  if (error || !data) {
    return json({ success: false, error: error?.message || "No se pudo registrar la solicitud" }, 500)
  }

  const [buyerResult, businessResult] = await Promise.all([
    sendEmail(email, "Recibimos tu solicitud — JT Training", buyerEmailHtml(name, plan, Number(amount))),
    sendEmail(BUSINESS_EMAIL, `Nueva solicitud: ${name} — ${plan}`, businessEmailHtml(name, email, plan, Number(amount))),
  ])

  return json({
    success: true,
    data: {
      id: data.id,
      name: data.name,
      email: data.email,
      plan: data.plan,
      amount: Number(data.amount),
      bank: data.bank,
      operation: data.operation,
      voucher: data.voucher,
      createdAt: data.created_at,
    },
    warning: !buyerResult.ok || !businessResult.ok ? "La solicitud quedó registrada, pero algún correo no se pudo enviar." : undefined,
  })
})
