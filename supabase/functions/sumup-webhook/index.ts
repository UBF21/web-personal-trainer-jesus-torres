// Edge Function: sumup-webhook
//
// SumUp llama acá (return_url del checkout, ver create-sumup-checkout)
// cuando cambia el estado de un pago. Hace lo mismo que approve-subscription
// pero automático, sin que nadie lo apruebe a mano: en cuanto SumUp
// confirma el cobro,
// 1) pasa la solicitud pendiente a la tabla "clients" (Activo),
// 2) crea su cuenta de acceso con rol "cliente" (o le resetea la
//    contraseña si el correo ya era cliente de antes),
// 3) le manda esa contraseña por correo,
// 4) genera la factura proforma y la manda al staff en PDF.
// Si el pago falló o expiró, borra la solicitud pendiente.
//
// Pública (SumUp la llama sin login) — por eso NO se valida un rol de
// usuario acá. En cambio, nunca se confía en el cuerpo que manda SumUp:
// siempre se vuelve a consultar el checkout por su id antes de actuar.
//
// Deploy: pegar este archivo completo en Supabase Dashboard > Edge
// Functions > Deploy a new function > nombre: "sumup-webhook". IMPORTANTE:
// en la configuración de la función, desactivar "Enforce JWT Verification"
// — si no, Supabase rechaza la llamada de SumUp antes de que este código
// la vea, porque SumUp no manda ningún JWT.
// Secrets necesarios (Edge Functions > Secrets, compartidos con el resto):
//   SUMUP_SECRET_KEY, RESEND_API_KEY, APPROVAL_EMAIL_FROM, PANEL_URL

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const SUMUP_SECRET_KEY = Deno.env.get("SUMUP_SECRET_KEY")!
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const EMAIL_FROM = Deno.env.get("APPROVAL_EMAIL_FROM") ?? "JT Training <no-reply@juliojesustorres.com>"
const PANEL_URL = Deno.env.get("PANEL_URL") ?? "https://juliojesustorres.com"
const LOGO_URL = `${PANEL_URL}/jt-logo-white.png`

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const ISSUER = { address: "Marbella, España", email: "personaltrainerjesustorres@gmail.com" }
const IVA_RATE = 0.21
const STAFF_EMAILS = ["personaltrainerjesustorres@gmail.com", "josephmori28@gmail.com"]
const PAYMENT_LABEL = "Tarjeta (SumUp)"

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

function emailShell(bodyHtml: string): string {
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
      <p style="margin:0 0 16px;font-size:12px;color:#999;">Fecha: ${date} · Forma de pago: ${PAYMENT_LABEL}</p>

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px;">
        <tr>
          <td style="padding:2px 0;color:#777;vertical-align:top;width:90px;">Emisor</td>
          <td style="padding:2px 0;text-align:right;">Pedido Nº ${inv.number}<br/>${ISSUER.address}<br/>${ISSUER.email}</td>
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

async function generateInvoicePdf(inv: InvoiceRow, name: string, email: string, plan: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89])
  const { width: pageWidth, height: pageHeight } = page.getSize()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const black = rgb(0, 0, 0)
  const white = rgb(1, 1, 1)
  const gray = rgb(0.45, 0.45, 0.45)
  const lightGray = rgb(0.96, 0.96, 0.96)
  const line = rgb(0.85, 0.85, 0.85)

  const HEADER_H = 100
  page.drawRectangle({ x: 0, y: pageHeight - HEADER_H, width: pageWidth, height: HEADER_H, color: black })
  page.drawText("JT TRAINING", { x: 50, y: pageHeight - HEADER_H / 2 - 6, size: 20, font: bold, color: white })
  try {
    const logoBytes = await fetch(LOGO_URL).then((r) => r.arrayBuffer())
    const logo = await doc.embedPng(logoBytes)
    const logoH = 60
    const logoW = (logo.width / logo.height) * logoH
    page.drawImage(logo, { x: 545 - logoW, y: pageHeight - HEADER_H + (HEADER_H - logoH) / 2, width: logoW, height: logoH })
  } catch (e) {
    console.error("No se pudo incrustar el logo en el PDF", e)
  }

  let y = pageHeight - HEADER_H - 40
  function text(str: string, x: number, size: number, f: typeof font = font, color = black) {
    page.drawText(str, { x, y, size, font: f, color })
  }

  text(`FACTURA PROFORMA Nº ${inv.number}`, 50, 19, bold)
  y -= 22
  const date = new Date(inv.issued_at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  text(`Fecha: ${date}   ·   Forma de pago: ${PAYMENT_LABEL}`, 50, 10, font, gray)
  y -= 16
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: line })
  y -= 32

  text("EMISOR", 50, 9, bold, gray)
  text("FACTURADO A", 320, 9, bold, gray)
  y -= 16
  text(`Pedido Nº ${inv.number}`, 50, 11, bold)
  text(name, 320, 11, bold)
  y -= 14
  text(ISSUER.address, 50, 11)
  text(email, 320, 11)
  y -= 14
  text(ISSUER.email, 50, 11)
  y -= 40

  text("Descripción", 50, 11, bold)
  text("Importe", 480, 11, bold)
  y -= 10
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: black })
  y -= 22
  text(`${plan} — JT Training`, 50, 11)
  text(eur(inv.subtotal), 480, 11)
  y -= 14
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: line })
  y -= 30

  const boxTop = y + 12
  const boxBottom = y - 54
  page.drawRectangle({ x: 330, y: boxBottom, width: 215, height: boxTop - boxBottom, color: lightGray })

  text("Subtotal", 345, 10, font, gray)
  text(eur(inv.subtotal), 480, 10, font, gray)
  y -= 16
  text("21% IVA", 345, 10, font, gray)
  text(eur(inv.iva), 480, 10, font, gray)
  y -= 10
  page.drawLine({ start: { x: 345, y }, end: { x: 530, y }, thickness: 1, color: black })
  y -= 18
  text("Total", 345, 13, bold)
  text(eur(inv.total), 480, 13, bold)

  const FOOTER_H = 50
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: FOOTER_H, color: black })
  page.drawText("JT Training — Entrenamiento personal", { x: pageWidth / 2 - 100, y: 30, size: 10, font: bold, color: white })
  page.drawText("personaltrainerjesustorres@gmail.com", { x: pageWidth / 2 - 92, y: 14, size: 9, font, color: rgb(0.75, 0.75, 0.75) })

  return doc.save()
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ""
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

async function sendApprovalEmail(to: string, name: string, plan: string, password: string) {
  const body = `
    <h2 style="margin:0 0 4px;font-size:22px;">¡Bienvenido/a, ${name}!</h2>
    <p style="color:#555;margin:0 0 20px;">Tu pago del plan <strong>${plan}</strong> fue confirmado y tu plan ya está activo.</p>
    <p style="margin:0 0 4px;">Ya puedes entrar a tu panel de cliente con estos datos:</p>
    ${highlightBox(`
      <p style="margin:0 0 6px;"><strong>Correo:</strong> ${to}</p>
      <p style="margin:0;"><strong>Contraseña:</strong> ${password}</p>
    `)}
    ${ctaButton(`${PANEL_URL}/login`, "Entrar a mi panel")}
    <p style="color:#999;font-size:13px;margin:20px 0 0;">Por seguridad, cambia esta contraseña ni bien ingreses, desde "Mi perfil".</p>
  `

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject: "Tu pago fue confirmado — JT Training", html: emailShell(body) }),
  })

  return { ok: res.ok, status: res.status, body: res.ok ? null : await res.text().catch(() => null) }
}

async function sendStaffInvoiceEmail(
  invoice: InvoiceRow,
  clientName: string,
  clientEmail: string,
  plan: string,
  pdfAttachment: { filename: string; content: string },
) {
  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;">Pago con tarjeta confirmado (SumUp)</h2>
    <p style="color:#555;margin:0 0 20px;">Se confirmó el pago de <strong>${clientName}</strong> (${clientEmail}) — adjunta va su factura proforma en PDF.</p>
    ${invoiceHtml(invoice, clientName, clientEmail, plan)}
  `

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: STAFF_EMAILS,
      subject: `Pago con tarjeta confirmado — ${clientName}`,
      html: emailShell(body),
      attachments: [pdfAttachment],
    }),
  })

  return { ok: res.ok, status: res.status, body: res.ok ? null : await res.text().catch(() => null) }
}

/** Convierte una solicitud pendiente ya pagada en cliente real — mismo
 * procedimiento que approve-subscription, solo que disparado por el
 * webhook en vez de un admin tocando "Aprobar". */
async function activatePending(pending: { id: string; name: string; email: string; plan: string; amount: number }) {
  const { data: client, error: clientError } = await admin
    .from("clients")
    .upsert({ name: pending.name, email: pending.email, plan: pending.plan, status: "Activo", progress: 0 }, { onConflict: "email" })
    .select("*")
    .single()

  if (clientError || !client) {
    console.error("sumup-webhook: no se pudo crear el cliente", clientError?.message)
    return
  }

  await admin.from("pending_subscriptions").delete().eq("id", pending.id)

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
    if (accountAlreadyExisted) {
      const existingUser = await findUserByEmail(pending.email)
      const existingRole = existingUser?.app_metadata?.role
      if (existingUser && existingRole !== "administrador" && existingRole !== "webmaster") {
        await admin.auth.admin.updateUserById(existingUser.id, { password })
      }
    } else {
      console.error("sumup-webhook: no se pudo crear el acceso", createError.message)
    }
  }

  await sendApprovalEmail(pending.email, pending.name, pending.plan, password)

  const invoice = await createInvoice(client.id, pending.name, pending.email, pending.plan, Number(pending.amount))
  if (invoice) {
    try {
      const pdfBytes = await generateInvoicePdf(invoice, pending.name, pending.email, pending.plan)
      const pdfAttachment = { filename: `factura-proforma-${invoice.number}.pdf`, content: uint8ToBase64(pdfBytes) }
      await sendStaffInvoiceEmail(invoice, pending.name, pending.email, pending.plan, pdfAttachment)
    } catch (e) {
      console.error("sumup-webhook: no se pudo generar/mandar el PDF de la factura", e)
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS })
  if (req.method !== "POST") return json({ ok: true })

  let body: { event_type?: string; id?: string } = {}
  try {
    body = await req.json()
  } catch {
    // sin body — nada que hacer
  }
  if (!body.id) return json({ ok: true })

  // SumUp solo manda {event_type, id}; hay que ir a buscar el checkout
  // real para saber el estado, nunca confiar en el cuerpo del webhook.
  let checkout: { status?: string; checkout_reference?: string }
  try {
    const res = await fetch(`https://api.sumup.com/v0.1/checkouts/${body.id}`, {
      headers: { Authorization: `Bearer ${SUMUP_SECRET_KEY}` },
    })
    if (!res.ok) return json({ ok: true })
    checkout = await res.json()
  } catch (e) {
    console.error("sumup-webhook: no se pudo consultar el checkout", e)
    return json({ ok: true })
  }

  if (checkout.status !== "PAID" && checkout.status !== "FAILED" && checkout.status !== "EXPIRED") {
    return json({ ok: true })
  }

  const { data: pending } = await admin
    .from("pending_subscriptions")
    .select("*")
    .eq("sumup_checkout_id", body.id)
    .maybeSingle()

  // Ya no existe la solicitud — o ya se procesó este mismo webhook antes
  // (SumUp puede reintentar), o nunca existió. Cualquiera de las dos, no
  // hay nada más que hacer: esto es lo que evita duplicar la activación.
  if (!pending) return json({ ok: true })

  if (checkout.status === "PAID") {
    await activatePending({
      id: pending.id,
      name: pending.name,
      email: pending.email,
      plan: pending.plan,
      amount: Number(pending.amount),
    })
  } else {
    await admin.from("pending_subscriptions").delete().eq("id", pending.id)
  }

  return json({ ok: true })
})
