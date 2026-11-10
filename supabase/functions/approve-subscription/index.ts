// Edge Function: approve-subscription
//
// Hace lo que la animación de 3 pasos del panel prometía pero nunca hacía:
// 1) pasa la solicitud pendiente a la tabla "clients" (Activo),
// 2) crea su cuenta de acceso con rol "cliente" — o, si el correo ya
//    tenía una cuenta de cliente de antes, le pone una contraseña nueva
//    (nunca sabemos si la anterior la recuerda, así que siempre se
//    manda una conocida). Si el correo pertenece a una cuenta de
//    administrador/webmaster, no se le toca la contraseña.
// 3) le manda esa contraseña por correo.
// 4) genera la factura proforma del plan (número correlativo, en la
//    tabla "invoices") y la manda en PDF — pero al staff
//    (administrador/webmaster), no al cliente; si alguien del equipo
//    quiere, se la reenvía él mismo.
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
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const EMAIL_FROM = Deno.env.get("APPROVAL_EMAIL_FROM") ?? "JT Training <no-reply@juliojesustorres.com>"
const PANEL_URL = Deno.env.get("PANEL_URL") ?? "https://juliojesustorres.com"
const LOGO_URL = `${PANEL_URL}/jt-logo-white.png`

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Datos del emisor de la factura proforma — confirmados a mano, no
// inventar ni completar con nada que no haya dado el propio Jesús. Ya no
// se muestran nombre ni teléfono, solo dirección + correo de contacto.
const ISSUER = {
  address: "Marbella, España",
  email: "personaltrainerjesustorres@gmail.com",
}
const IVA_RATE = 0.21
// La factura proforma ya no se manda al cliente — se genera para el
// staff, y si alguno quiere, se la reenvía a mano al cliente.
const STAFF_EMAILS = ["personaltrainerjesustorres@gmail.com", "josephmori28@gmail.com"]

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

/** Mismos datos que invoiceHtml, pero dibujados a mano en un PDF (pdf-lib
 * no entiende HTML/CSS — no hay motor de render, cada línea va con su
 * propia coordenada). */
async function generateInvoicePdf(inv: InvoiceRow, name: string, email: string, plan: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89]) // A4
  const { width: pageWidth, height: pageHeight } = page.getSize()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const black = rgb(0, 0, 0)
  const white = rgb(1, 1, 1)
  const gray = rgb(0.45, 0.45, 0.45)
  const lightGray = rgb(0.96, 0.96, 0.96)
  const line = rgb(0.85, 0.85, 0.85)

  // Header negro con el logo blanco a la izquierda — mismo criterio que
  // el correo. Si no se puede traer el logo, sigue igual solo con texto.
  const HEADER_H = 100
  page.drawRectangle({ x: 0, y: pageHeight - HEADER_H, width: pageWidth, height: HEADER_H, color: black })
  try {
    const logoBytes = await fetch(LOGO_URL).then((r) => r.arrayBuffer())
    const logo = await doc.embedPng(logoBytes)
    const logoH = 60
    const logoW = (logo.width / logo.height) * logoH
    page.drawImage(logo, {
      x: 50,
      y: pageHeight - HEADER_H + (HEADER_H - logoH) / 2,
      width: logoW,
      height: logoH,
    })
  } catch (e) {
    console.error("No se pudo incrustar el logo en el PDF", e)
    page.drawText("JT TRAINING", { x: 50, y: pageHeight - HEADER_H / 2 - 6, size: 20, font: bold, color: white })
  }

  let y = pageHeight - HEADER_H - 40

  function text(str: string, x: number, size: number, f: typeof font = font, color = black) {
    page.drawText(str, { x, y, size, font: f, color })
  }

  text(`FACTURA PROFORMA Nº ${inv.number}`, 50, 19, bold)
  y -= 22
  const date = new Date(inv.issued_at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  text(`Fecha: ${date}   ·   Forma de pago: Transferencia bancaria`, 50, 10, font, gray)
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

  // Totales sobre una caja gris clara, para que resalten como en el correo.
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

  // Pie negro, igual que el header — mismo texto que el footer del correo.
  const FOOTER_H = 50
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: FOOTER_H, color: black })
  page.drawText("JT Training — Entrenamiento personal", {
    x: pageWidth / 2 - 100,
    y: 30,
    size: 10,
    font: bold,
    color: white,
  })
  page.drawText("personaltrainerjesustorres@gmail.com", {
    x: pageWidth / 2 - 92,
    y: 14,
    size: 9,
    font,
    color: rgb(0.75, 0.75, 0.75),
  })

  return doc.save()
}

/** btoa() no acepta un Uint8Array grande directo sin desbordar la pila —
 * se arma el string binario por partes. */
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
    <p style="color:#555;margin:0 0 20px;">Tu plan <strong>${plan}</strong> fue aprobado y ya está activo.</p>
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

/** La factura va al staff, no al cliente — si Jesús (o quien aprobó)
 * quiere mandársela al cliente, la reenvía él mismo desde su correo. */
async function sendStaffInvoiceEmail(
  invoice: InvoiceRow,
  clientName: string,
  clientEmail: string,
  plan: string,
  pdfAttachment: { filename: string; content: string },
) {
  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;">Factura proforma generada</h2>
    <p style="color:#555;margin:0 0 20px;">Se aprobó la suscripción de <strong>${clientName}</strong> (${clientEmail}) — adjunta va su factura proforma en PDF. Si quieres, reenvíasela tú mismo.</p>
    ${invoiceHtml(invoice, clientName, clientEmail, plan)}
  `

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: STAFF_EMAILS,
      subject: `Factura proforma Nº ${invoice.number} — ${clientName}`,
      html: emailShell(body),
      attachments: [pdfAttachment],
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

  const emailResult = await sendApprovalEmail(pending.email, pending.name, pending.plan, password)

  const invoice = await createInvoice(client.id, pending.name, pending.email, pending.plan, Number(pending.amount))
  let invoiceWarning: string | undefined
  if (invoice) {
    try {
      const pdfBytes = await generateInvoicePdf(invoice, pending.name, pending.email, pending.plan)
      const pdfAttachment = { filename: `factura-proforma-${invoice.number}.pdf`, content: uint8ToBase64(pdfBytes) }
      const staffEmailResult = await sendStaffInvoiceEmail(invoice, pending.name, pending.email, pending.plan, pdfAttachment)
      if (!staffEmailResult.ok) invoiceWarning = "No se pudo mandar la factura proforma al staff."
    } catch (e) {
      console.error("No se pudo generar/mandar el PDF de la factura", e)
      invoiceWarning = "No se pudo generar la factura proforma."
    }
  }

  return json({
    success: true,
    data: client,
    warning: !emailResult.ok
      ? "Cliente aprobado y con acceso, pero el correo no se pudo enviar."
      : invoiceWarning,
  })
})
