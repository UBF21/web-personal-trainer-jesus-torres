// Edge Function: request-subscription
//
// Alguien elige un plan en la web (sin iniciar sesión) y queda como
// "solicitud pendiente". Esta función:
// 1) guarda la solicitud en pending_subscriptions,
// 2) le confirma por correo al comprador (con los datos de la
//    transferencia, por si pierde la pantalla),
// 3) avisa al negocio que hay una nueva solicitud para revisar y aprobar
//    — igual que en FitBlood.
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
const LOGO_URL = `${PANEL_URL}/jt-logo-white.png`
const BUSINESS_EMAILS = ["personaltrainerjesustorres@gmail.com", "soportefitblood@gmail.com"]
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

// --- Piezas de diseño del correo (mismo criterio que los emails de FitBlood,
// en blanco y negro para la marca de JT Training). ---

function emailShell(bodyHtml: string): string {
  return `
<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;background:#f1f1f1;padding:40px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
    <div style="background:#000000;padding:28px 36px;text-align:center;">
      <img src="${LOGO_URL}" alt="JT Training" width="140" style="display:inline-block;height:auto;max-width:160px;" />
    </div>
    <div style="padding:36px;color:#111;font-size:15px;line-height:1.6;">
      ${bodyHtml}
    </div>
    <div style="background:#fafafa;padding:20px 36px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">JT Training — Entrenamiento personal</p>
      <p style="margin:6px 0 0;font-size:12px;">
        <a href="mailto:personaltrainerjesustorres@gmail.com" style="color:#000;text-decoration:none;font-weight:600;">personaltrainerjesustorres@gmail.com</a>
      </p>
    </div>
  </div>
</div>`
}

function ctaButton(href: string, label: string): string {
  return `
    <div style="text-align:center;margin:28px 0 8px;">
      <a href="${href}" style="background:#000;color:#fff;text-decoration:none;padding:14px 30px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;display:inline-block;border-radius:6px;">
        ${label}
      </a>
    </div>`
}

function highlightBox(html: string): string {
  return `<div style="background:#f4f4f4;border-radius:8px;padding:16px 18px;margin:16px 0;font-size:14px;">${html}</div>`
}

function totalCard(value: string, label: string): string {
  return `
    <div style="background:#0a0a0a;border-radius:10px;padding:20px 24px;margin:16px 0;text-align:center;">
      <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${label}</p>
      <p style="margin:6px 0 0;font-size:28px;color:#fff;font-weight:800;">${value}</p>
    </div>`
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  })
  const bodyText = res.ok ? null : await res.text().catch(() => null)
  if (!res.ok) console.error("Resend error", res.status, bodyText)
  return { ok: res.ok, status: res.status, bodyText }
}

function buyerEmailHtml(name: string, plan: string, amount: number): string {
  return emailShell(`
    <h2 style="margin:0 0 4px;font-size:22px;">¡Gracias por tu solicitud, ${name}!</h2>
    <p style="color:#555;margin:0 0 20px;">Registramos tu solicitud del plan <strong>${plan}</strong> (${amount}€).</p>
    <p style="margin:0 0 8px;">Para completarla, realiza la transferencia a:</p>
    ${highlightBox(`<p style="margin:0;font-family:monospace;font-size:15px;letter-spacing:0.5px;">${IBAN}</p>`)}
    <p style="margin:16px 0 0;">Indica como concepto el nombre del plan y envía el comprobante a
      <a href="mailto:${BUSINESS_EMAILS[0]}" style="color:#000;font-weight:600;">${BUSINESS_EMAILS[0]}</a>.</p>
    <p style="color:#999;font-size:13px;margin:20px 0 0;">Te avisaremos por correo ni bien confirmemos el pago y tu plan quede activo.</p>
  `)
}

function businessEmailHtml(name: string, email: string, plan: string, amount: number): string {
  return emailShell(`
    <h2 style="margin:0 0 4px;font-size:22px;">Nueva solicitud de plan</h2>
    <p style="color:#555;margin:0 0 20px;"><strong>${name}</strong> (${email}) solicitó el plan <strong>${plan}</strong>.</p>
    ${totalCard(`${amount}€`, "Monto a verificar")}
    ${ctaButton(`${PANEL_URL}/panel/clientes`, "Ver solicitudes pendientes")}
  `)
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
    sendEmail(BUSINESS_EMAILS, `Nueva solicitud: ${name} — ${plan}`, businessEmailHtml(name, email, plan, Number(amount))),
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
    warning:
      !buyerResult.ok || !businessResult.ok
        ? `La solicitud quedó registrada, pero algún correo no se pudo enviar. buyer=${buyerResult.status}:${buyerResult.bodyText} business=${businessResult.status}:${businessResult.bodyText}`
        : undefined,
  })
})
