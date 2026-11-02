"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

// MAQUETA: la autenticación es simulada y vive en localStorage. Se reemplaza por Supabase más adelante.

export type Role = "webmaster" | "administrador" | "cliente"

export interface AuthUser {
  username: string
  name: string
  email: string
  role: Role
}

interface StoredUser extends AuthUser {
  password: string
}

export const ROLE_LABEL: Record<Role, string> = {
  webmaster: "Webmaster",
  administrador: "Administrador",
  cliente: "Cliente",
}

// Cuentas de demostración (usuario / contraseña)
export const DEMO_ACCOUNTS: { username: string; password: string; role: Role }[] = [
  { username: "webmaster", password: "webmaster", role: "webmaster" },
  { username: "admin", password: "admin", role: "administrador" },
  { username: "cliente", password: "cliente", role: "cliente" },
]

const SEED_USERS: StoredUser[] = [
  { username: "webmaster", password: "webmaster", name: "Webmaster JT", email: "webmaster@jttraining.com", role: "webmaster" },
  { username: "admin", password: "admin", name: "Jesús Torres", email: "admin@jttraining.com", role: "administrador" },
  { username: "cliente", password: "cliente", name: "Carlos Mendoza", email: "cliente@jttraining.com", role: "cliente" },
]

const USERS_KEY = "jt-mock-users"
const SESSION_KEY = "jt-mock-session"

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sin almacenamiento: la sesión solo dura mientras la página siga abierta
  }
}

function loadUsers(): StoredUser[] {
  const stored = readJson<StoredUser[]>(USERS_KEY, [])
  const extra = stored.filter((u) => !SEED_USERS.some((s) => s.username === u.username))
  return [...SEED_USERS, ...extra]
}

export type AuthResult = { ok: true } | { ok: false; error: "invalid" | "exists" }

interface AuthContextValue {
  user: AuthUser | null
  login: (identifier: string, password: string) => AuthResult
  register: (name: string, email: string, password: string) => AuthResult
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const toPublic = ({ password: _password, ...user }: StoredUser): AuthUser => user

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readJson<AuthUser | null>(SESSION_KEY, null))

  const startSession = useCallback((next: AuthUser) => {
    setUser(next)
    writeJson(SESSION_KEY, next)
  }, [])

  const login = useCallback(
    (identifier: string, password: string): AuthResult => {
      const id = identifier.trim().toLowerCase()
      const found = loadUsers().find(
        (u) => (u.username.toLowerCase() === id || u.email.toLowerCase() === id) && u.password === password,
      )
      if (!found) return { ok: false, error: "invalid" }
      startSession(toPublic(found))
      return { ok: true }
    },
    [startSession],
  )

  // Todo registro nuevo es un cliente
  const register = useCallback(
    (name: string, email: string, password: string): AuthResult => {
      const mail = email.trim().toLowerCase()
      const users = loadUsers()
      if (users.some((u) => u.email.toLowerCase() === mail || u.username.toLowerCase() === mail)) {
        return { ok: false, error: "exists" }
      }
      const created: StoredUser = { username: mail, password, name: name.trim(), email: mail, role: "cliente" }
      writeJson(USERS_KEY, [...users.filter((u) => !SEED_USERS.includes(u)), created])
      startSession(toPublic(created))
      return { ok: true }
    },
    [startSession],
  )

  const logout = useCallback(() => {
    setUser(null)
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      // nada que limpiar
    }
  }, [])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}
