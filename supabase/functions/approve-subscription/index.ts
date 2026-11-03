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
// Secrets necesarios (Edge Functions > Manage secrets):
//   RESEND_API_KEY        — API key de Resend
//   APPROVAL_EMAIL_FROM   — remitente verificado, ej. "JT Training <no-reply@tudominio.com>"
//   PANEL_URL             — ej. "https://juliojesustorres.com" (opcional, hay un valor por defecto)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const EMAIL_FROM = Deno.env.get("APPROVAL_EMAIL_FROM") ?? "JT Training <no-reply@juliojesustorres.com>"
const PANEL_URL = Deno.env.get("PANEL_URL") ?? "https://juliojesustorres.com"

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function randomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  let out = ""
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

async function sendApprovalEmail(to: string, name: string, plan: string, password: string | null) {
  const body = password
    ? `
      <h2 style="margin:0 0 12px">¡Bienvenido/a, ${name}!</h2>
      <p>Tu plan <strong>${plan}</strong> fue aprobado y ya está activo.</p>
      <p>Ya puedes entrar a tu panel de cliente con estos datos:</p>
      <p style="background:#f4f4f4;padding:12px 16px;border-radius:8px">
        Correo: <strong>${to}</strong><br/>
        Contraseña temporal: <strong>${password}</strong>
      </p>
      <p><a href="${PANEL_URL}/login" style="color:#000">Entrar a mi panel →</a></p>
      <p style="color:#777;font-size:13px">Por seguridad, cambia esta contraseña ni bien ingreses, desde "Mi perfil".</p>
    `
    : `
      <h2 style="margin:0 0 12px">¡Tu plan fue aprobado, ${name}!</h2>
      <p>Tu plan <strong>${plan}</strong> ya está activo. Entra con tu cuenta de siempre:</p>
      <p><a href="${PANEL_URL}/login" style="color:#000">Entrar a mi panel →</a></p>
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
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">${body}</div>`,
    }),
  })

  return { ok: res.ok, status: res.status, body: res.ok ? null : await res.text().catch(() => null) }
}

Deno.serve(async (req) => {
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
