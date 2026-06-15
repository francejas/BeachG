import { FormEvent, useEffect, useState } from "react"
import { User, Lock, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useClient, useUpdateClient } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { Button, Card, Input, Label, Loading } from "@/components/ui"

export function ProfilePage() {
  const { clientId } = useAuth()
  const { data: client, isLoading } = useClient(clientId)
  const updateClient = useUpdateClient()

  // Profile form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Password form state
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  useEffect(() => {
    if (client) {
      setFirstName(client.firstName ?? "")
      setLastName(client.lastName ?? "")
      setEmail(client.email ?? "")
      setPhone(client.phone ?? "")
    }
  }, [client])

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    setProfileMsg(null)
    try {
      await updateClient.mutateAsync({ id: clientId!, firstName, lastName, email, phone })
      setProfileMsg({ type: "ok", text: "Datos actualizados correctamente." })
    } catch (err) {
      setProfileMsg({ type: "err", text: getApiErrorMessage(err, "No se pudo actualizar el perfil.") })
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "err", text: "La contraseña debe tener al menos 6 caracteres." })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "err", text: "Las contraseñas no coinciden." })
      return
    }
    try {
      await updateClient.mutateAsync({
        id: clientId!,
        firstName: client?.firstName ?? firstName,
        lastName: client?.lastName ?? lastName,
        email: client?.email ?? email,
        phone: client?.phone ?? phone,
        password: newPassword,
      })
      setNewPassword("")
      setConfirmPassword("")
      setPasswordMsg({ type: "ok", text: "Contraseña actualizada correctamente." })
    } catch (err) {
      setPasswordMsg({ type: "err", text: getApiErrorMessage(err, "No se pudo cambiar la contraseña.") })
    }
  }

  if (isLoading) return <Loading label="Cargando perfil..." />

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Mi cuenta</h1>
      <p className="mt-1 text-muted-foreground">Administrá tu información personal.</p>

      {/* Profile info */}
      <Card className="mt-8 p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-bold">Información personal</h2>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 9 11 1234-5678" />
          </div>
          {profileMsg && (
            <p className={`rounded-lg px-3 py-2 text-sm ${profileMsg.type === "ok" ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
              {profileMsg.text}
            </p>
          )}
          <Button type="submit" loading={updateClient.isPending}>
            Guardar cambios
          </Button>
        </form>
      </Card>

      {/* Change password */}
      <Card className="mt-6 p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-bold">Cambiar contraseña</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí la nueva contraseña"
              autoComplete="new-password"
            />
          </div>
          {passwordMsg && (
            <p className={`rounded-lg px-3 py-2 text-sm ${passwordMsg.type === "ok" ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
              {passwordMsg.text}
            </p>
          )}
          <Button type="submit" loading={updateClient.isPending}>
            Cambiar contraseña
          </Button>
        </form>
      </Card>

      {/* Account info */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-bold">Información de cuenta</h2>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ID de cliente</dt>
            <dd className="font-medium">#{clientId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email registrado</dt>
            <dd className="font-medium">{client?.email}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
