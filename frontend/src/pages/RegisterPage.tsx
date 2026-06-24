import { FormEvent, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { api, getApiErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Button, Input, Label } from "@/components/ui"
import { AuthShell } from "@/components/AuthShell"

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const { login } = useAuth()
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", dni: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post("/api/clients", form)
      await login(form.email, form.password)
      navigate(from ?? "/dashboard", { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, "No pudimos crear tu cuenta. Revisá los datos."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Creá tu cuenta" subtitle="Registrate gratis para reservar tu lugar en la playa.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Input id="firstName" required value={form.firstName} onChange={update("firstName")} />
          </div>
          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Input id="lastName" required value={form.lastName} onChange={update("lastName")} />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" type="tel" required value={form.phone} onChange={update("phone")} placeholder="2235551234" />
        </div>
        <div>
          <Label htmlFor="dni">DNI</Label>
          <Input
            id="dni"
            inputMode="numeric"
            required
            value={form.dni}
            onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value.replace(/\D/g, "") }))}
            placeholder="40123456"
            maxLength={8}
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" autoComplete="new-password" required minLength={4} value={form.password} onChange={update("password")} />
        </div>
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Crear cuenta
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" state={from ? { from } : undefined} className="font-semibold text-primary hover:underline">
          Ingresá
        </Link>
      </p>
    </AuthShell>
  )
}
