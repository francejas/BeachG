import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  Clock,
  DollarSign,
  Tent,
  Umbrella,
  UserPlus,
} from "lucide-react"
import { useAllBookings, useMyResort, useRentalUnits } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { Button, Card, ErrorState, Loading, StatusBadge } from "@/components/ui"
import { cn, formatCurrency, formatDate, todayISO } from "@/lib/utils"
import type { RentalUnit } from "@/lib/types"
import type { ReactNode } from "react"

// ── Weather ───────────────────────────────────────────────────────────────────

interface WeatherData {
  temp: number
  apparentTemp: number
  windspeed: number
  description: string
  emoji: string
  city: string
}

function weatherInfo(code: number): { emoji: string; description: string } {
  if (code === 0) return { emoji: "☀️", description: "Despejado" }
  if (code <= 2) return { emoji: "🌤️", description: "Mayormente despejado" }
  if (code === 3) return { emoji: "☁️", description: "Nublado" }
  if (code <= 48) return { emoji: "🌫️", description: "Neblina" }
  if (code <= 57) return { emoji: "🌦️", description: "Llovizna" }
  if (code <= 67) return { emoji: "🌧️", description: "Lluvia" }
  if (code <= 77) return { emoji: "❄️", description: "Nieve" }
  if (code <= 82) return { emoji: "🌦️", description: "Chaparrones" }
  if (code <= 86) return { emoji: "🌨️", description: "Nevada" }
  return { emoji: "⛈️", description: "Tormenta" }
}

function useWeather(location: string | undefined) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!location) return
    let cancelled = false
    setLoading(true)

    async function load() {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location ?? "")}&format=json&limit=1&addressdetails=1`,
          { headers: { "Accept-Language": "es" } },
        )
        const geoData = await geoRes.json()
        const place = geoData[0]
        if (!place || cancelled) return

        const { lat, lon, address } = place
        const cityName =
          address.city ?? address.town ?? address.village ?? address.county ?? (location ?? "").split(",")[0].trim()

        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m` +
            `&timezone=America%2FArgentina%2FBuenos_Aires`,
        )
        const wData = await wRes.json()
        if (cancelled) return

        const cur = wData.current
        setWeather({
          temp: Math.round(cur.temperature_2m),
          apparentTemp: Math.round(cur.apparent_temperature),
          windspeed: Math.round(cur.windspeed_10m),
          ...weatherInfo(cur.weathercode),
          city: cityName,
        })
      } catch {
        // non-critical
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [location])

  return { weather, loading }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { data: bookings, isLoading, error } = useAllBookings()
  const { data: units } = useRentalUnits()
  const { data: resort } = useMyResort()
  const { weather, loading: weatherLoading } = useWeather(resort?.location)

  if (isLoading) return <Loading label="Cargando panel..." />
  if (error) return <ErrorState message={getApiErrorMessage(error, "No pudimos cargar el panel.")} />

  const today = todayISO()
  const thisMonth = today.slice(0, 7)
  const all = bookings ?? []

  const raw = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
  const todayLabel = raw.charAt(0).toUpperCase() + raw.slice(1)

  const activeToday = all.filter(
    (b) => b.status === "CONFIRMED" && String(b.startDate) <= today && String(b.endDate) >= today,
  )
  const pendingBookings = all.filter((b) => b.status === "PENDING").sort((a, b) => b.id - a.id)
  const occupiedUnitIds = new Set(activeToday.map((b) => b.rentalUnitId))
  const totalUnits = units?.length ?? 0

  const monthRevenue = all
    .filter((b) => b.status === "CONFIRMED" && String(b.startDate).startsWith(thisMonth))
    .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0)
  const totalRevenue = all
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0)

  const unitMap = new Map<number, RentalUnit>(units?.map((u) => [u.idRentalUnit, u]) ?? [])
  const recent = [...all].sort((a, b) => b.id - a.id).slice(0, 8)

  return (
    <div className="space-y-5">

      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-accent via-primary to-primary/70 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(199_89%_65%/0.3),transparent_60%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">

          {/* Left: resort info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
              Panel de administración
            </p>
            <h1 className="mt-1 text-4xl font-extrabold leading-tight text-white">
              🏖️ {resort?.name ?? "Mi balneario"}
            </h1>
            <p className="mt-2 text-sm font-medium text-primary-foreground/80">
              📅 {todayLabel}
            </p>
          </div>

          {/* Right: weather + action */}
          <div className="flex flex-col items-end gap-3">
            {/* Weather widget */}
            {resort?.location && (
              weatherLoading ? (
                <div className="w-52 space-y-2 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="h-3 w-32 animate-pulse rounded bg-white/20" />
                  <div className="h-8 w-20 animate-pulse rounded bg-white/20" />
                  <div className="h-3 w-28 animate-pulse rounded bg-white/20" />
                </div>
              ) : weather ? (
                <div className="w-52 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                    Clima actual en {weather.city}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-4xl leading-none">{weather.emoji}</span>
                    <div>
                      <p className="text-3xl font-extrabold leading-none text-white">{weather.temp}°C</p>
                      <p className="mt-0.5 text-xs text-white/75">{weather.description}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-medium text-white/70">
                    💨 {weather.windspeed} km/h &nbsp;·&nbsp; 🌡️ ST {weather.apparentTemp}°
                  </p>
                </div>
              ) : null
            )}

            <Link to="/admin/walkin">
              <Button className="w-52 bg-white text-accent hover:bg-white/90 shadow-lg shadow-black/20">
                <UserPlus className="h-4 w-4" /> Nueva reserva presencial
              </Button>
            </Link>
          </div>
        </div>
      </div>
      </Card>

      {/* ── Pending alert ─────────────────────────────────────────────────── */}
      {pendingBookings.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-5 py-3.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-yellow-600" />
          <p className="flex-1 text-sm font-medium text-yellow-800">
            {pendingBookings.length}{" "}
            {pendingBookings.length === 1 ? "reserva pendiente" : "reservas pendientes"} de pago — revisá en MercadoPago.
          </p>
          <Link to="/admin/bookings" className="flex items-center gap-1 text-sm font-semibold text-yellow-700 hover:underline">
            Ver <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <StatCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Activas hoy"
          value={String(activeToday.length)}
          hint="reservas en curso"
          colorClass="bg-green-50 text-green-700"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Pendientes de pago"
          value={String(pendingBookings.length)}
          hint="esperando confirmación"
          colorClass="bg-yellow-50 text-yellow-700"
        />
        <StatCard
          icon={<Umbrella className="h-5 w-5" />}
          label="Unidades libres"
          value={`${totalUnits - occupiedUnitIds.size} / ${totalUnits}`}
          hint="disponibles hoy"
          colorClass="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Ingresos este mes"
          value={formatCurrency(monthRevenue)}
          hint={`Histórico: ${formatCurrency(totalRevenue)}`}
          colorClass="bg-primary/5 text-primary"
        />
      </div>

      {/* ── Units grid ────────────────────────────────────────────────────── */}
      {units && units.length > 0 && (
        <Card>
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-bold">🌊 Estado de unidades — hoy</h2>
            <Link to="/admin/units" className="text-sm font-semibold text-primary hover:underline">
              Gestionar
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 p-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {units.map((u) => {
              const occupied = occupiedUnitIds.has(u.idRentalUnit)
              const Icon = u.type === "TENT" ? Tent : Umbrella
              return (
                <div
                  key={u.idRentalUnit}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center",
                    u.isBlocked
                      ? "border-border bg-muted text-muted-foreground"
                      : occupied
                        ? "border-green-300 bg-green-50 text-green-800"
                        : "border-border bg-card text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-bold">{u.identifier}</span>
                  <span className="text-[10px] leading-tight">
                    {u.isBlocked ? "Bloqueada" : occupied ? "Ocupada" : "Libre"}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── Recent bookings ───────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold">📋 Reservas recientes</h2>
          <Link to="/admin/bookings" className="text-sm font-semibold text-primary hover:underline">
            Ver todas
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-muted-foreground">Todavía no hay reservas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">N°</th>
                  <th className="px-5 py-3">Huésped</th>
                  <th className="px-5 py-3">Unidad</th>
                  <th className="px-5 py-3">Entrada</th>
                  <th className="px-5 py-3">Salida</th>
                  <th className="px-5 py-3 text-center">Pers.</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((b) => {
                  const unit = unitMap.get(b.rentalUnitId)
                  const guests = b.guests ?? []
                  const primaryName = b.walkInName || guests[0]?.fullName || `Cliente #${b.idClient}`
                  const extraGuests = !b.walkInName && guests.length > 1 ? guests.slice(1) : []
                  return (
                    <tr key={b.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{b.id}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold leading-tight">{primaryName}</p>
                        {b.walkInName && (
                          <span className="mt-0.5 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                            Presencial
                          </span>
                        )}
                        {b.walkInDni && (
                          <p className="text-xs text-muted-foreground">DNI {b.walkInDni}</p>
                        )}
                        {extraGuests.map((g) => (
                          <p key={g.idGuest} className="text-xs text-muted-foreground">{g.fullName}</p>
                        ))}
                      </td>
                      <td className="px-5 py-3">
                        {unit ? (
                          <div className="flex items-center gap-1.5">
                            {unit.type === "TENT"
                              ? <Tent className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              : <Umbrella className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                            <span className="font-medium">{unit.identifier}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">#{b.rentalUnitId}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(b.startDate)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(b.endDate)}</td>
                      <td className="px-5 py-3 text-center font-semibold">{guests.length || 1}</td>
                      <td className="px-5 py-3 font-semibold">{formatCurrency(b.totalPrice)}</td>
                      <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-5 py-3">
                        <Link to={`/admin/bookings/${b.id}`}>
                          <Button variant="outline" size="sm">Ver</Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, hint, colorClass,
}: {
  icon: ReactNode; label: string; value: string; hint: string; colorClass: string
}) {
  return (
    <Card className="p-5">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClass)}>
        {icon}
      </span>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}
