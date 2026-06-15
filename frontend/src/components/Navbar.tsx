import { Link, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { BookOpen, ChevronDown, Home, LogIn, Menu, Settings, Umbrella, UserPlus, X } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Button } from "./ui"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    setOpen(false)
    setDropdownOpen(false)
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Umbrella className="h-5 w-5" />
          </span>
          <span>
            Beach<span className="text-primary">G</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {isAuthenticated && role === "ADMIN" && (
            <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              Panel admin
            </Link>
          )}

          {isAuthenticated && role === "USER" && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Mi cuenta <ChevronDown className={cn("h-4 w-4 transition-transform", dropdownOpen && "rotate-180")} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-border bg-card shadow-lg">
                  <div className="p-1">
                    <DropItem to="/dashboard" icon={<Home className="h-4 w-4" />} label="Inicio" onClose={() => setDropdownOpen(false)} />
                    <DropItem to="/my-bookings" icon={<BookOpen className="h-4 w-4" />} label="Mis reservas" onClose={() => setDropdownOpen(false)} />
                    <DropItem to="/profile" icon={<Settings className="h-4 w-4" />} label="Mi perfil" onClose={() => setDropdownOpen(false)} />
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isAuthenticated && role === "ADMIN" && (
            <Button variant="outline" size="sm" className="ml-2" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          )}

          {!isAuthenticated && (
            <div className="ml-2 flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" /> Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gap-1.5">
                  <UserPlus className="h-4 w-4" /> Registrarse
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 hover:bg-muted md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn("border-t border-border bg-card md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {isAuthenticated && role === "ADMIN" && (
            <Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
              Panel admin
            </Link>
          )}
          {isAuthenticated && role === "USER" && (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                Inicio
              </Link>
              <Link to="/my-bookings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                Mis reservas
              </Link>
              <Link to="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                Mi perfil
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={handleLogout} className="mt-1">
              Cerrar sesión
            </Button>
          ) : (
            <div className="mt-1 flex flex-col gap-2">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full gap-1.5">
                  <LogIn className="h-4 w-4" /> Iniciar sesión
                </Button>
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full gap-1.5">
                  <UserPlus className="h-4 w-4" /> Registrarse
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

function DropItem({
  to,
  icon,
  label,
  onClose,
}: {
  to: string
  icon: React.ReactNode
  label: string
  onClose: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
    >
      {icon}
      {label}
    </Link>
  )
}
