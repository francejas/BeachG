import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Menu, Umbrella, X } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Button } from "./ui"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    setOpen(false)
    navigate("/")
  }

  const links: { to: string; label: string }[] = []
  if (isAuthenticated && role === "USER") links.push({ to: "/my-bookings", label: "Mis reservas" })
  if (isAuthenticated && role === "ADMIN") links.push({ to: "/admin", label: "Panel admin" })

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Umbrella className="h-5 w-5" />
          </span>
          <span>
            Beach<span className="text-primary">G</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/validate" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
            Validar QR
          </Link>
          {isAuthenticated ? (
            <Button variant="outline" size="sm" className="ml-2" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Ingresar
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Crear cuenta</Button>
              </Link>
            </div>
          )}
        </nav>

        <button
          className="rounded-lg p-2 hover:bg-muted md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("border-t border-border bg-card md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
              {l.label}
            </Link>
          ))}
          <Link to="/validate" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
            Validar QR
          </Link>
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={handleLogout} className="mt-1">
              Cerrar sesión
            </Button>
          ) : (
            <div className="mt-1 flex flex-col gap-2">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Ingresar
                </Button>
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
