import { Link } from "react-router-dom"
import { CalendarCheck, DollarSign, TrendingUp, Umbrella, UserPlus } from "lucide-react"
import { useAllBookings, useMyResort, useRentalUnits } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { Button, Card, ErrorState, Loading, StatusBadge } from "@/components/ui"
import { formatCurrency, formatDate, todayISO } from "@/lib/utils"
import type { ReactNode } from "react"

export function AdminDashboardPage() {
  const { data: bookings, isLoading, error } = useAllBookings()
  const { data: units } = useRentalUnits()
  const { data: resort } = useMyResort()

  if (isLoading) return <Loading label="Cargando panel..." />
  if (error) return <ErrorState message={getApiErrorMessage(error, "No pudimos cargar el panel.")} />

  const today = todayISO()
  const all = bookings ?? []
  const activeToday = all.filter((b) => b.status === "CONFIRMED" && b.startDate <= today && b.endDate >= today)
  const occupiedUnitIds = new Set(activeToday.map((b) => b.rentalUnitId))
  const revenue = all.filter((b) => b.status === "CONFIRMED").reduce((sum, b) => sum + (b.totalPrice ?? 0), 0)
  const totalUnits = units?.length ?? 0
  const recent = [...all].sort((a, b) => b.id - a.id).slice(0, 5)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Panel</h1>
          <p className="mt-1 text-muted-foreground">{resort ? resort.name : "Resumen de tu balneario"}</p>
        </div>
        <Link to="/admin/walkin">
          <Button>
            <UserPlus className="h-4 w-4" /> Reserva presencial
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<CalendarCheck className="h-5 w-5" />} label="Activas hoy" value={String(activeToday.length)} hint="reservas en curso" />
        <StatCard icon={<Umbrella className="h-5 w-5" />} label="Unidades ocupadas" value={`${occupiedUnitIds.size}/${totalUnits}`} hint="hoy" />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Ingresos confirmados" value={formatCurrency(revenue)} hint="acumulado" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Reservas totales" value={String(all.length)} hint="histórico" />
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold">Reservas recientes</h2>
          <Link to="/admin/bookings" className="text-sm font-semibold text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 && <p className="px-6 py-8 text-center text-muted-foreground">Todavía no hay reservas.</p>}
          {recent.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="font-semibold">
                  #{b.id} · {b.walkInName ?? `Cliente ${b.idClient}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(b.startDate)} — {formatDate(b.endDate)} · Unidad #{b.rentalUnitId}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden font-semibold sm:block">{formatCurrency(b.totalPrice)}</span>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}
