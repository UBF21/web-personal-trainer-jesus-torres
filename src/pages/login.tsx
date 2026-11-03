import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

type Mode = "login" | "register"

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
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>("login")
  const [identifier, setIdentifier] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const isRegister = mode === "register"

  const switchMode = (next: Mode) => {
    setMode(next)
    setMessage("")
  }

  // Ya con sesión iniciada, /login lleva directo al panel
  if (!loading && user) return <Navigate to="/panel" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    if (isRegister) {
      if (password !== confirm) {
        setMessage(t.auth.passwordMismatch)
        setSubmitting(false)
        return
      }
      const result = await register(name, email, password)
      setSubmitting(false)
      if (!result.ok) {
        setMessage(result.error === "exists" ? t.auth.userExists : t.auth.invalidCredentials)
        return
      }
    } else {
      const result = await login(identifier, password)
      setSubmitting(false)
      if (!result.ok) {
        setMessage(t.auth.invalidCredentials)
        return
      }
    }
    navigate("/panel")
  }

  // Aún no hay backend de autenticación: el acceso con Google solo avisa que llegará pronto.
  const handleGoogle = () => setMessage(t.auth.unavailable)

  const googleButton = (label: string) => (
    <>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t.auth.or}
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button type="button" variant="outline" onClick={handleGoogle} className="w-full gap-3 border-border bg-white text-black hover:bg-gray-50">
        <GoogleIcon />
        {label}
      </Button>
    </>
  )

  const modeSwitch = (
    <div className="mx-auto mb-8 grid w-full max-w-sm grid-cols-2 rounded-full bg-muted p-1">
      {(["login", "register"] as Mode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => switchMode(m)}
          className={`rounded-full py-2 text-sm font-semibold transition-colors duration-300 ${
            mode === m ? "bg-black text-white shadow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {m === "login" ? t.auth.tabLogin : t.auth.tabRegister}
        </button>
      ))}
    </div>
  )

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

        {/* Imagen: a la izquierda en "Ingresar", se desliza a la derecha en "Regístrate" */}
        <div
          className={`absolute inset-y-0 left-0 z-10 hidden w-1/2 transition-transform duration-700 ease-in-out md:block ${
            isRegister ? "translate-x-full" : "translate-x-0"
          }`}
        >
          {/* Dos fotos apiladas: mientras el panel se desliza, una se desvanece y la otra aparece */}
          <img
            src="/hero-bg.jpg"
            alt="JT Training"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${
              isRegister ? "scale-110 opacity-0" : "scale-100 opacity-100"
            }`}
          />
          <img
            src="/about-photo.jpg"
            alt="JT Training"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${
              isRegister ? "scale-100 opacity-100" : "scale-110 opacity-0"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 space-y-4 p-12 text-white">
            <img src="/jt-logo-white.png" alt="JT Training" className="h-24 w-auto" />
            <div className="relative h-10">
              <p
                className={`absolute inset-x-0 top-0 text-3xl font-bold transition-all duration-700 ${
                  isRegister ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
                }`}
              >
                {t.auth.imageTagline}
              </p>
              <p
                className={`absolute inset-x-0 top-0 text-3xl font-bold transition-all duration-700 ${
                  isRegister ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                {t.auth.registerTagline}
              </p>
            </div>
          </div>
        </div>

        {/* Ingresar: panel derecho */}
        <div
          className={`flex flex-col justify-center p-6 transition-opacity duration-500 md:absolute md:inset-y-0 md:left-1/2 md:w-1/2 md:p-16 ${
            isRegister ? "hidden md:pointer-events-none md:flex md:opacity-0" : "opacity-100"
          }`}
        >
          {modeSwitch}
          <div className="mb-6 space-y-2 text-center">
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
            {googleButton(t.auth.googleLogin)}
            {message && !isRegister && <p className="text-center text-sm text-muted-foreground">{message}</p>}
          </form>
        </div>

        {/* Regístrate: panel izquierdo */}
        <div
          className={`flex flex-col justify-center p-6 transition-opacity duration-500 md:absolute md:inset-y-0 md:left-0 md:w-1/2 md:p-16 ${
            isRegister ? "opacity-100" : "hidden md:pointer-events-none md:flex md:opacity-0"
          }`}
        >
          {modeSwitch}
          <div className="mb-6 space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">{t.auth.registerTitle}</h1>
            <p className="text-muted-foreground">{t.auth.registerSubtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">{t.auth.name}</Label>
              <Input id="reg-name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">{t.auth.email}</Label>
              <Input id="reg-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">{t.auth.password}</Label>
              <Input id="reg-password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm">{t.auth.confirmPassword}</Label>
              <Input id="reg-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">{t.auth.registerSubmit}</Button>
            {googleButton(t.auth.googleRegister)}
            {message && isRegister && <p className="text-center text-sm text-muted-foreground">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
