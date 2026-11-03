"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// Login real con Supabase Auth. El rol vive en app_metadata (no lo puede
// editar el usuario desde el cliente, a diferencia de user_metadata) — solo
// se asigna desde el backend con la service_role key (ver /auth/register
// y el script que crea cuentas de webmaster/administrador a mano).

export type Role = "webmaster" | "administrador" | "cliente"

export interface AuthUser {
  /** = email; se mantiene el nombre de campo por compatibilidad con el resto del panel. */
  username: string
  name: string
  email: string
  role: Role
}

export const ROLE_LABEL: Record<Role, string> = {
  webmaster: "Webmaster",
  administrador: "Administrador",
  cliente: "Cliente",
}

export type AuthResult = { ok: true } | { ok: false; error: "invalid" | "exists" | "confirm" }

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapSupabaseUser(user: User): AuthUser {
  const role = (user.app_metadata?.role as Role | undefined) ?? "cliente"
  const name = (user.user_metadata?.name as string | undefined) ?? user.email ?? ""
  return { username: user.email ?? "", name, email: user.email ?? "", role }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) return { ok: false, error: "invalid" }
    return { ok: true }
  }, [])

  // Todo registro nuevo queda sin rol en app_metadata — el navegador nunca
  // puede fijarlo (solo el dashboard de Supabase o la Admin API pueden), así
  // que mapSupabaseUser lo trata como "cliente" por defecto. Elevarlo a
  // administrador/webmaster se hace a mano desde Supabase, nunca desde aquí.
  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      })

      if (error) {
        return { ok: false, error: error.message.toLowerCase().includes("already") ? "exists" : "invalid" }
      }

      // Si el proyecto exige confirmar el correo antes de iniciar sesión,
      // signUp no devuelve una sesión activa todavía.
      if (!data.session) {
        return { ok: false, error: "confirm" }
      }

      return { ok: true }
    },
    [],
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
      if (!user) return { ok: false, error: "invalid" }

      // Reautenticamos con la contraseña actual antes de permitir el cambio.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (reauthError) return { ok: false, error: "invalid" }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { ok: false, error: "invalid" }
      return { ok: true }
    },
    [user],
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, changePassword, logout }),
    [user, loading, login, register, changePassword, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}
