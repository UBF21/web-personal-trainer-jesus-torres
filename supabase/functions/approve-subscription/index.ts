// Edge Function: approve-subscription
//
// Hace lo que la animación de 3 pasos del panel prometía pero nunca hacía:
// 1) pasa la solicitud pendiente a la tabla "clients" (Activo),
// 2) crea (o reutiliza) su cuenta de acceso con rol "cliente",
// 3) le manda un correo con sus credenciales (o avisándole que ya puede
//    entrar, si la cuenta ya existía).
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

async function sendApprovalEmail(to: string, name: string, plan: string, password: string | null) {
  const body = password
    ? `
      <h2 style="margin:0 0 4px;font-size:22px;">¡Bienvenido/a, ${name}!</h2>
      <p style="color:#555;margin:0 0 20px;">Tu plan <strong>${plan}</strong> fue aprobado y ya está activo.</p>
      <p style="margin:0 0 4px;">Ya puedes entrar a tu panel de cliente con estos datos:</p>
      ${highlightBox(`
        <p style="margin:0 0 6px;"><strong>Correo:</strong> ${to}</p>
        <p style="margin:0;"><strong>Contraseña temporal:</strong> ${password}</p>
      `)}
      ${ctaButton(`${PANEL_URL}/login`, "Entrar a mi panel")}
      <p style="color:#999;font-size:13px;margin:20px 0 0;">Por seguridad, cambia esta contraseña ni bien ingreses, desde "Mi perfil".</p>
    `
    : `
      <h2 style="margin:0 0 4px;font-size:22px;">¡Tu plan fue aprobado, ${name}!</h2>
      <p style="color:#555;margin:0 0 20px;">Tu plan <strong>${plan}</strong> ya está activo. Entra con tu cuenta de siempre.</p>
      ${ctaButton(`${PANEL_URL}/login`, "Entrar a mi panel")}
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

  const accountAlreadyExisted = !!createError && /already|registered|existe/i.test(createError.message)

  if (createError && !accountAlreadyExisted) {
    // La aprobación en "clients" ya quedó hecha — no la revertimos solo
    // porque falló crear el acceso. Se avisa para resolverlo a mano.
    return json({
      success: true,
      data: client,
      warning: `Cliente aprobado, pero no se pudo crear su acceso: ${createError.message}`,
    })
  }

  const emailResult = await sendApprovalEmail(
    pending.email,
    pending.name,
    pending.plan,
    accountAlreadyExisted ? null : password,
  )

  return json({
    success: true,
    data: client,
    warning: !emailResult.ok
      ? "Cliente aprobado y cuenta creada, pero el correo no se pudo enviar."
      : accountAlreadyExisted
        ? "Ya existía una cuenta con ese correo; se avisó por correo sin contraseña nueva."
        : undefined,
  })
})
