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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-gradient-to-b from-card via-card to-secondary/40 md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent px-5">
          <svg viewBox="0 0 38 38" className="h-8 w-8 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="38" rx="10" fill="hsl(199,89%,42%)"/>
            <circle cx="19" cy="14" r="5" fill="white"/>
            <path d="M6 25c2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0 2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <path d="M6 30c2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0 2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.45"/>
          </svg>
          <span className="font-display text-lg font-extrabold tracking-tight">Beach<span className="text-primary">G</span></span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3 stagger">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-3 pb-2 text-xs text-muted-foreground">{email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 38 38" className="h-7 w-7 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="38" height="38" rx="10" fill="hsl(199,89%,42%)"/>
              <circle cx="19" cy="14" r="5" fill="white"/>
              <path d="M6 25c2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0 2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M6 30c2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0 2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.45"/>
            </svg>
            <span className="font-display font-extrabold tracking-tight">Beach<span className="text-primary">G</span></span>
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
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-5xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
