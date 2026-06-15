import { Outlet } from "react-router-dom"
import { Umbrella } from "lucide-react"
import { Navbar } from "./Navbar"

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Umbrella className="h-4 w-4 text-primary" />
            BeachG
          </div>
          <p>Reservá tu lugar en la playa. Pagá online, ingresá con QR.</p>
          <p>{new Date().getFullYear()} BeachG</p>
        </div>
      </footer>
    </div>
  )
}
