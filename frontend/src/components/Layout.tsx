import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 38 38" className="h-7 w-7 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="38" height="38" rx="10" fill="hsl(199,89%,42%)"/>
                  <circle cx="19" cy="14" r="5" fill="white"/>
                  <path d="M6 25c2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0 2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                  <path d="M6 30c2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0 2.2-3.5 4.3-3.5 6.5 0 2.2 3.5 4.3 3.5 6.5 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.45"/>
                </svg>
                <span className="font-display font-bold tracking-tight">Beach<span className="text-primary">G</span></span>
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
