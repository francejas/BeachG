import type { ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Umbrella } from "lucide-react"

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen">
      {/* Visual side */}
      <div className="relative hidden w-1/2 lg:block">
        <img src="/images/hero-beach.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/80 to-primary/50" />
        <div className="relative flex h-full flex-col justify-center p-12 text-primary-foreground">
          <Link to="/" className="mb-10 flex items-center gap-2 text-xl font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <Umbrella className="h-5 w-5" />
            </span>
            BeachG
          </Link>
          <div>
            <h2 className="text-balance text-3xl font-extrabold leading-tight">
              La playa te espera. Reservá en segundos.
            </h2>
            <p className="mt-3 max-w-sm text-primary-foreground/85">
              Gestioná tus reservas de carpas y sombrillas, pagá online y validá tu ingreso con QR.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 text-xl font-extrabold lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Umbrella className="h-5 w-5" />
            </span>
            Beach<span className="-ml-1.5 text-primary">G</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="mt-1 mb-6 text-muted-foreground">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
