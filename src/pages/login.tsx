import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export default function LoginPage() {
  const { t } = useTranslation()
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Ya con sesión iniciada, /login lleva directo al panel
  if (!loading && user) return <Navigate to="/panel" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const result = await login(identifier, password)
    setSubmitting(false)
    if (!result.ok) {
      setMessage(t.auth.invalidCredentials)
      return
    }
    navigate("/panel")
  }

  // Aún no hay backend de autenticación: el acceso con Google solo avisa que llegará pronto.
  const handleGoogle = () => setMessage(t.auth.unavailable)

  return (
    <div className="min-h-screen bg-background">
      <div className="relative min-h-screen w-full overflow-hidden bg-card md:h-screen">
        <Link
          to="/"
          className="absolute left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black md:left-8 md:top-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.auth.back}
        </Link>

        <div className="absolute inset-y-0 left-0 hidden w-1/2 md:block">
          <img src="/hero-bg.jpg" alt="JT Training" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 space-y-4 p-12 text-white">
            <img src="/jt-logo-white.png" alt="JT Training" className="h-24 w-auto" />
            <p className="text-3xl font-bold">{t.auth.imageTagline}</p>
          </div>
        </div>

        <div className="flex min-h-screen flex-col justify-center p-6 md:absolute md:inset-y-0 md:left-1/2 md:w-1/2 md:p-16">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">{t.auth.title}</h1>
            <p className="text-muted-foreground">{t.auth.subtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-id">{t.auth.identifier}</Label>
              <Input id="login-id" type="email" autoComplete="email" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">{t.auth.password}</Label>
              <Input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">{t.auth.submit}</Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              {t.auth.or}
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button type="button" variant="outline" onClick={handleGoogle} className="w-full gap-3 border-border bg-white text-black hover:bg-gray-50">
              <GoogleIcon />
              {t.auth.googleLogin}
            </Button>
            {message && <p className="text-center text-sm text-muted-foreground">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
