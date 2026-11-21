import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

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
            {message && <p className="text-center text-sm text-muted-foreground">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
