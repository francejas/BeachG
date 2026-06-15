import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, LogOut, QrCode, ScrollText, Store, Umbrella, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/resort", label: "Mi balneario", icon: Store, end: false },
  { to: "/admin/units", label: "Unidades", icon: Umbrella, end: false },
  { to: "/admin/walkin", label: "Reserva presencial", icon: UserPlus, end: false },
  { to: "/admin/bookings", label: "Todas las reservas", icon: ScrollText, end: false },
  { to: "/admin/validate", label: "Validar QR", icon: QrCode, end: false },
]

export function AdminLayout() {
  const { logout, email } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/")
  }

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 font-extrabold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Umbrella className="h-4 w-4" />
          </span>
          Beach<span className="-ml-1.5 text-primary">G</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-3 pb-2 text-xs text-muted-foreground">{email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 font-extrabold">
            <Umbrella className="h-5 w-5 text-primary" /> BeachG Admin
          </div>
          <button onClick={handleLogout} aria-label="Cerrar sesión" className="rounded-lg p-2 hover:bg-muted">
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
