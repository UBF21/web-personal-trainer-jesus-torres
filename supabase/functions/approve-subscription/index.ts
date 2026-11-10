// Edge Function: approve-subscription
//
// Hace lo que la animación de 3 pasos del panel prometía pero nunca hacía:
// 1) pasa la solicitud pendiente a la tabla "clients" (Activo),
// 2) crea su cuenta de acceso con rol "cliente" — o, si el correo ya
//    tenía una cuenta de cliente de antes, le pone una contraseña nueva
//    (nunca sabemos si la anterior la recuerda, así que siempre se
//    manda una conocida). Si el correo pertenece a una cuenta de
//    administrador/webmaster, no se le toca la contraseña.
// 3) le manda esa contraseña por correo, junto con la factura proforma
//    del plan (número correlativo, guardado en la tabla "invoices").
//
// Corre acá (y no en el navegador) porque crear usuarios con rol requiere
// la service_role key, que nunca debe llegar al frontend.
//
// Deploy: pegar este archivo completo en Supabase Dashboard > Edge
// Functions > Deploy a new function > nombre: "approve-subscription".
// Secrets necesarios (Edge Functions > Secrets, son compartidos por todas
// las funciones del proyecto):
//   RESEND_API_KEY        — API key de Resend
//   APPROVAL_EMAIL_FROM   — remitente verificado, ej. "JT Training <no-reply@tudominio.com>"
//   PANEL_URL             — ej. "https://juliojesustorres.com" (opcional, hay un valor por defecto)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const EMAIL_FROM = Deno.env.get("APPROVAL_EMAIL_FROM") ?? "JT Training <no-reply@juliojesustorres.com>"
const PANEL_URL = Deno.env.get("PANEL_URL") ?? "https://juliojesustorres.com"
const LOGO_URL = `${PANEL_URL}/jt-logo-white.png`

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Datos del emisor de la factura proforma — confirmados a mano, no
// inventar ni completar con nada que no haya dado el propio Jesús.
const ISSUER = {
  name: "Julio Jesús Torres",
  address: "Marbella, España",
  phone: "+34 662 24 55 62",
}
const IVA_RATE = 0.21

// El navegador manda un preflight OPTIONS antes de cada invoke() — sin
// estos headers, Supabase igual ejecuta la función pero el navegador
// bloquea la respuesta antes de que el código de la app la vea.
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

function randomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  let out = ""
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

async function findUserByEmail(email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) return null
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null
}

// --- Piezas de diseño del correo (mismo criterio que los emails de FitBlood,
// en blanco y negro para la marca de JT Training). ---

function emailShell(bodyHtml: string): string {
  // Gmail/Apple Mail en modo oscuro invierten los colores de los correos
  // que no avisan explícitamente que son de tema claro — sin esto, el
  // header negro con logo blanco se vuelve blanco sobre blanco (invisible)
  // y el fondo blanco del cuerpo se vuelve negro.
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <style>:root { color-scheme: light; supported-color-schemes: light; }</style>
</head>
<body style="margin:0;background:#f1f1f1;">
<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;background:#f1f1f1;padding:40px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
    <div style="background:#000000;padding:28px 36px;text-align:center;">
      <img src="${LOGO_URL}" alt="JT Training" width="140" style="display:inline-block;height:auto;max-width:160px;" />
    </div>
    <div style="padding:36px;color:#111111;font-size:15px;line-height:1.6;background:#ffffff;">
      ${bodyHtml}
    </div>
    <div style="background:#fafafa;padding:20px 36px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">JT Training — Entrenamiento personal</p>
      <p style="margin:6px 0 0;font-size:12px;">
        <a href="mailto:personaltrainerjesustorres@gmail.com" style="color:#000;text-decoration:none;font-weight:600;">personaltrainerjesustorres@gmail.com</a>
      </p>
    </div>
  </div>
</div>
</body>
</html>`
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

function eur(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} €`
}

type InvoiceRow = { number: number; subtotal: number; iva: number; total: number; issued_at: string }

/** El precio ya incluye el 21% de IVA — se separa para mostrarlo desglosado. */
async function createInvoice(clientId: string, name: string, email: string, plan: string, total: number): Promise<InvoiceRow | null> {
  const subtotal = Math.round((total / (1 + IVA_RATE)) * 100) / 100
  const iva = Math.round((total - subtotal) * 100) / 100

  const { data, error } = await admin
    .from("invoices")
    .insert({ client_id: clientId, client_name: name, client_email: email, plan, subtotal, iva, total })
    .select("number, subtotal, iva, total, issued_at")
    .single()

  if (error || !data) {
    console.error("No se pudo registrar la factura", error?.message)
    return null
  }
  return data as InvoiceRow
}

function invoiceHtml(inv: InvoiceRow, name: string, email: string, plan: string): string {
  const date = new Date(inv.issued_at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  return `
    <div style="margin-top:28px;border-top:1px solid #eee;padding-top:24px;">
      <p style="margin:0 0 2px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#999;">
        Factura proforma Nº ${inv.number}
      </p>
      <p style="margin:0 0 16px;font-size:12px;color:#999;">Fecha: ${date} · Forma de pago: Transferencia bancaria</p>

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px;">
        <tr>
          <td style="padding:2px 0;color:#777;vertical-align:top;width:90px;">Emisor</td>
          <td style="padding:2px 0;text-align:right;">${ISSUER.name}<br/>${ISSUER.address}<br/>${ISSUER.phone}</td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
        <tr>
          <td style="padding:2px 0;color:#777;vertical-align:top;width:90px;">Facturado a</td>
          <td style="padding:2px 0;text-align:right;">${name}<br/>${email}</td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px 0;font-weight:700;">Descripción</td>
          <td style="padding:8px 0;font-weight:700;text-align:right;">Importe</td>
        </tr>
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px 0;">${plan} — JT Training</td>
          <td style="padding:8px 0;text-align:right;">${eur(inv.subtotal)}</td>
        </tr>
        <tr>
          <td></td>
          <td style="padding:4px 0;text-align:right;color:#777;">Subtotal: ${eur(inv.subtotal)}</td>
        </tr>
        <tr>
          <td></td>
          <td style="padding:4px 0;text-align:right;color:#777;">21% IVA: ${eur(inv.iva)}</td>
        </tr>
        <tr>
          <td></td>
          <td style="padding:10px 0 0;text-align:right;font-weight:700;border-top:2px solid #000;">Total: ${eur(inv.total)}</td>
        </tr>
      </table>
    </div>
  `
}

async function sendApprovalEmail(to: string, name: string, plan: string, password: string, invoiceBlock: string) {
  const body = `
    <h2 style="margin:0 0 4px;font-size:22px;">¡Bienvenido/a, ${name}!</h2>
    <p style="color:#555;margin:0 0 20px;">Tu plan <strong>${plan}</strong> fue aprobado y ya está activo.</p>
    <p style="margin:0 0 4px;">Ya puedes entrar a tu panel de cliente con estos datos:</p>
    ${highlightBox(`
      <p style="margin:0 0 6px;"><strong>Correo:</strong> ${to}</p>
      <p style="margin:0;"><strong>Contraseña:</strong> ${password}</p>
    `)}
    ${ctaButton(`${PANEL_URL}/login`, "Entrar a mi panel")}
    <p style="color:#999;font-size:13px;margin:20px 0 0;">Por seguridad, cambia esta contraseña ni bien ingreses, desde "Mi perfil".</p>
    ${invoiceBlock}
  `

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to,
      subject: "Tu plan fue aprobado — JT Training",
      html: emailShell(body),
    }),
  })

  return { ok: res.ok, status: res.status, body: res.ok ? null : await res.text().catch(() => null) }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS })
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405)

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return json({ success: false, error: "No autorizado" }, 401)

  const token = authHeader.replace("Bearer ", "")
  const { data: callerData, error: callerError } = await admin.auth.getUser(token)
  const callerRole = callerData?.user?.app_metadata?.role

  if (callerError || !callerData?.user || (callerRole !== "administrador" && callerRole !== "webmaster")) {
    return json({ success: false, error: "No autorizado" }, 403)
  }

  let pendingId: string | undefined
  try {
    const body = await req.json()
    pendingId = body?.pending_id
  } catch {
    // body ausente o inválido
  }
  if (!pendingId) return json({ success: false, error: "pending_id requerido" }, 400)

  const { data: pending, error: pendingError } = await admin
    .from("pending_subscriptions")
    .select("*")
    .eq("id", pendingId)
    .maybeSingle()

  if (pendingError || !pending) {
    return json({ success: false, error: pendingError?.message || "Solicitud no encontrada" }, 404)
  }

  const { data: client, error: clientError } = await admin
    .from("clients")
    .upsert(
      { name: pending.name, email: pending.email, plan: pending.plan, status: "Activo", progress: 0 },
      { onConflict: "email" },
    )
    .select("*")
    .single()

  if (clientError || !client) {
    return json({ success: false, error: clientError?.message || "No se pudo crear el cliente" }, 500)
  }

  await admin.from("pending_subscriptions").delete().eq("id", pendingId)

  const password = randomPassword()
  const { error: createError } = await admin.auth.admin.createUser({
    email: pending.email,
    password,
    email_confirm: true,
    user_metadata: { name: pending.name },
    app_metadata: { role: "cliente" },
  })

  if (createError) {
    const accountAlreadyExisted = /already|registered|existe/i.test(createError.message)
    if (!accountAlreadyExisted) {
      // La aprobación en "clients" ya quedó hecha — no la revertimos solo
      // porque falló crear el acceso. Se avisa para resolverlo a mano.
      return json({
        success: true,
        data: client,
        warning: `Cliente aprobado, pero no se pudo crear su acceso: ${createError.message}`,
      })
    }

    const existingUser = await findUserByEmail(pending.email)
    if (!existingUser) {
      return json({
        success: true,
        data: client,
        warning: "Cliente aprobado, pero no se pudo restablecer su acceso (no se encontró la cuenta).",
      })
    }

    const existingRole = existingUser.app_metadata?.role
    if (existingRole === "administrador" || existingRole === "webmaster") {
      // Cuenta de staff, no de cliente — nunca se le pisa la contraseña
      // desde una solicitud pública. Se avisa para resolverlo a mano.
      return json({
        success: true,
        data: client,
        warning: `Cliente aprobado. Ese correo ya es una cuenta de ${existingRole} — no se tocó su contraseña; avísale manualmente si necesita entrar como cliente.`,
      })
    }

    // La cuenta de cliente ya existía (de una aprobación anterior, por
    // ejemplo) — no sabemos si recuerda esa contraseña, así que se le
    // pone una nueva conocida y se la mandamos igual que si fuera nueva.
    const { error: updateError } = await admin.auth.admin.updateUserById(existingUser.id, { password })
    if (updateError) {
      return json({
        success: true,
        data: client,
        warning: `Cliente aprobado, pero no se pudo restablecer su contraseña: ${updateError.message}`,
      })
    }
  }

  const invoice = await createInvoice(client.id, pending.name, pending.email, pending.plan, Number(pending.amount))
  const invoiceBlock = invoice ? invoiceHtml(invoice, pending.name, pending.email, pending.plan) : ""

  const emailResult = await sendApprovalEmail(pending.email, pending.name, pending.plan, password, invoiceBlock)

  return json({
    success: true,
    data: client,
    warning: !emailResult.ok ? "Cliente aprobado y con acceso, pero el correo no se pudo enviar." : undefined,
  })
})
