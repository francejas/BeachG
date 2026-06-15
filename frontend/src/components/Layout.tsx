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
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Umbrella className="h-4 w-4 text-primary" />
                BeachG
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Reservá tu lugar en la playa. Pagá online, ingresá con QR.</p>
            </div>
            <div className="flex gap-10 text-sm text-muted-foreground">
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground">Plataforma</p>
                <p>Reservas online</p>
                <p>Ingreso con QR</p>
                <p>Panel de administración</p>
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground">Legal</p>
                <p>Términos de uso</p>
                <p>Política de privacidad</p>
                <p>Protección de datos</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} BeachG. Todos los derechos reservados.</p>
            <p>Desarrollado por el equipo BeachG · UTN · Proyecto académico</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
