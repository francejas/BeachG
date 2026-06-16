import { FormEvent, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Umbrella } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getApiErrorMessage } from "@/lib/api"
import { Button, Input, Label } from "@/components/ui"
import { AuthShell } from "@/components/AuthShell"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const role = await login(email, password)
      if (role === "ADMIN") navigate("/admin", { replace: true })
      else navigate(from ?? "/dashboard", { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, "Email o contraseña incorrectos."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Bienvenido de vuelta" subtitle="Ingresá para reservar y ver tus QR de ingreso.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Ingresar
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link to="/register" state={from ? { from } : undefined} className="font-semibold text-primary hover:underline">
          Registrate
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <Umbrella className="mr-1 inline h-3 w-3" /> Demo: admin.mdp@beachg.com / santi.rodriguez@gmail.com · contraseña: admin123
      </p>
    </AuthShell>
  )
}
