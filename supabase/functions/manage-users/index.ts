// Edge Function: manage-users
//
// "Usuarios y roles" en el panel era pura maqueta (datos de mock-data.ts,
// nada se guardaba). Esto le da la misma lógica que tiene FitBlood para su
// panel de usuarios: listar cuentas reales y cambiarles el rol/estado,
// pero acá tiene que pasar por una Edge Function (no por un update directo
// a una tabla) porque el rol vive en app_metadata del usuario de Supabase
// Auth, y escribir ahí requiere la service_role key — que nunca debe
// llegar al navegador.
//
// Deploy: pegar este archivo completo en Supabase Dashboard > Edge
// Functions > Deploy a new function > nombre: "manage-users".
// No necesita secrets propios, solo las que Supabase ya inyecta solas
// (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

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

type Role = "cliente" | "administrador" | "webmaster"

function mapUser(u: {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  banned_until?: string | null
}) {
  return {
    id: u.id,
    email: u.email ?? "",
    name: (u.user_metadata?.name as string | undefined) ?? "",
    role: ((u.app_metadata?.role as Role | undefined) ?? "cliente") as Role,
    banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
  }
}

// "Usuarios y roles" es para gestionar al staff (administrador/webmaster),
// no a los clientes de la tienda/planes — esos se gestionan en /panel/clientes.
async function listStaffUsers() {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw new Error(error.message)
  return data.users.map(mapUser).filter((u) => u.role !== "cliente")
}

/** Evita que, desde el panel, alguien se toque a sí mismo o a la cuenta
 * webmaster (esa solo se edita a mano desde Supabase). Misma regla que
 * usa FitBlood en su API de usuarios. Devuelve el rol del target para que
 * el caller pueda aplicar reglas extra (ej. administrador solo resetea
 * contraseñas de clientes). */
async function guardTarget(
  callerId: string,
  targetId: string,
): Promise<{ error: string } | { error: null; targetRole: Role }> {
  if (targetId === callerId) return { error: "No puedes actuar sobre tu propia cuenta" }

  const { data, error } = await admin.auth.admin.getUserById(targetId)
  if (error || !data?.user) return { error: "Usuario no encontrado" }
  const targetRole = ((data.user.app_metadata?.role as Role | undefined) ?? "cliente") as Role
  if (targetRole === "webmaster") return { error: "No se puede modificar al webmaster" }
  return { error: null, targetRole }
}

// La tabla "clients" no guarda el id del usuario de Auth, solo el correo
// (ver supabase/functions/approve-subscription) — para resetear la
// contraseña de un cliente desde /panel/clientes/:id hay que resolverlo
// por email.
async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) return null
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id ?? null
}

/** El webmaster siempre puede; un administrador necesita que le hayan
 * delegado el permiso 'operations' (mismo que gestionar clientes/planes). */
async function administradorHasOperations(): Promise<boolean> {
  const { data } = await admin
    .from("role_permissions")
    .select("administrador")
    .eq("permission_key", "operations")
    .maybeSingle()
  return !!data?.administrador
}

// Para siempre, sin salirse del rango que acepta GoTrue para ban_duration.
const BAN_DURATION = "876000h"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS })
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405)

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return json({ success: false, error: "No autorizado" }, 401)

  const token = authHeader.replace("Bearer ", "")
  const { data: callerData, error: callerError } = await admin.auth.getUser(token)
  const callerRole = callerData?.user?.app_metadata?.role as Role | undefined

  if (callerError || !callerData?.user || (callerRole !== "webmaster" && callerRole !== "administrador")) {
    return json({ success: false, error: "No autorizado" }, 403)
  }

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    // sin body — solo "list" lo permite
  }
  const action = body.action as string | undefined

  // "Usuarios y roles" (list, set-role, ban, delete) es exclusivo del
  // webmaster. La única excepción es "reset-password", que un
  // administrador con el permiso 'operations' también puede usar, pero
  // solo sobre un cliente (ver el chequeo de targetRole más abajo) — así
  // puede resetearle la contraseña a un cliente desde /panel/clientes/:id
  // sin que eso habilite el resto de la gestión de staff.
  if (callerRole !== "webmaster") {
    if (action !== "reset-password" || !(await administradorHasOperations())) {
      return json({ success: false, error: "No autorizado" }, 403)
    }
  }

  try {
    if (action === "list") {
      const users = await listStaffUsers()
      return json({ success: true, data: users })
    }

    let targetId = body.user_id as string | undefined
    if (!targetId && action === "reset-password" && typeof body.email === "string") {
      targetId = (await findUserIdByEmail(body.email)) ?? undefined
      if (!targetId) return json({ success: false, error: "No existe una cuenta de acceso con ese correo" }, 404)
    }
    if (!targetId) return json({ success: false, error: "user_id requerido" }, 400)

    const guard = await guardTarget(callerData.user.id, targetId)
    if (guard.error) return json({ success: false, error: guard.error }, 400)

    if (callerRole === "administrador" && guard.targetRole !== "cliente") {
      return json({ success: false, error: "Solo puedes restablecer contraseñas de clientes" }, 403)
    }

    if (action === "set-role") {
      const role = body.role as Role | undefined
      if (role !== "cliente" && role !== "administrador") {
        return json({ success: false, error: "Rol inválido" }, 400)
      }
      const { error } = await admin.auth.admin.updateUserById(targetId, { app_metadata: { role } })
      if (error) return json({ success: false, error: error.message }, 400)
      return json({ success: true })
    }

    if (action === "ban" || action === "unban") {
      const { error } = await admin.auth.admin.updateUserById(targetId, {
        ban_duration: action === "ban" ? BAN_DURATION : "none",
      })
      if (error) return json({ success: false, error: error.message }, 400)
      return json({ success: true })
    }

    if (action === "reset-password") {
      const password = body.password as string | undefined
      if (!password || password.length < 6) {
        return json({ success: false, error: "La contraseña debe tener al menos 6 caracteres" }, 400)
      }
      const { error } = await admin.auth.admin.updateUserById(targetId, { password })
      if (error) return json({ success: false, error: error.message }, 400)
      return json({ success: true })
    }

    if (action === "delete") {
      const { error } = await admin.auth.admin.deleteUser(targetId)
      if (error) return json({ success: false, error: error.message }, 400)
      return json({ success: true })
    }

    return json({ success: false, error: "Acción inválida" }, 400)
  } catch (e) {
    return json({ success: false, error: e instanceof Error ? e.message : "Error inesperado" }, 500)
  }
})
