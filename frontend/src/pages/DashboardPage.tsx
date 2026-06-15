import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  ChevronRight,
  MapPin,
  QrCode,
  Search,
  Umbrella,
} from "lucide-react"
import { useClientBookings, useClient, useResorts } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Button, Card, ErrorState, Loading, StatusBadge } from "@/components/ui"
import { amenityIcon, resortCover } from "@/components/resort-helpers"
import { formatCurrency, formatDate, todayISO } from "@/lib/utils"
import type { Booking, Resort } from "@/lib/types"

export function DashboardPage() {
  const { clientId } = useAuth()
  const { data: client } = useClient(clientId)
  const { data: bookings, isLoading: loadingBookings } = useClientBookings(clientId)
  const { data: resorts, isLoading: loadingResorts, error: resortError } = useResorts()

  const [searchCity, setSearchCity] = useState("")
  const [searchName, setSearchName] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [applied, setApplied] = useState({ city: "", name: "", date: "" })

  const today = todayISO()

  // Active booking: confirmed, start date <= today <= end date
  const activeBooking = bookings?.find(
    (b) => b.status === "CONFIRMED" && String(b.startDate) <= today && today <= String(b.endDate),
  )

  // Upcoming bookings: confirmed or pending, start date > today
  const upcomingBookings = bookings
    ?.filter((b) => b.status !== "CANCELED" && String(b.startDate) > today)
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))
    .slice(0, 3)

  const confirmedCount = bookings?.filter((b) => b.status === "CONFIRMED").length ?? 0
  const pendingCount = bookings?.filter((b) => b.status === "PENDING").length ?? 0

  function handleSearch() {
    setApplied({ city: searchCity.trim(), name: searchName.trim(), date: searchDate })
  }

  const hasFilters = applied.city || applied.name || applied.date
  const filteredResorts = resorts?.filter((r) => {
    const matchesCity = !applied.city || r.location.toLowerCase().includes(applied.city.toLowerCase())
    const matchesName = !applied.name || r.name.toLowerCase().includes(applied.name.toLowerCase())
    return matchesCity && matchesName
  })

  const firstName = client?.firstName ?? "vos"

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">

      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-extrabold">
          Bienvenido/a, {firstName} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Desde acá podés buscar balnearios, ver tus reservas y gestionar tu cuenta.</p>
      </div>

      {/* Stats row */}
      {!loadingBookings && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard
            label="Reservas confirmadas"
            value={confirmedCount}
            icon={<CalendarDays className="h-5 w-5 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            label="Pago pendiente"
            value={pendingCount}
            icon={<Calendar className="h-5 w-5 text-yellow-600" />}
            color="bg-yellow-50"
          />
          <StatCard
            label="Total de reservas"
            value={bookings?.length ?? 0}
            icon={<Umbrella className="h-5 w-5 text-primary" />}
            color="bg-primary/5"
          />
        </div>
      )}

      {/* Active booking */}
      {activeBooking && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Hoy en el balneario</h2>
          <ActiveBookingCard booking={activeBooking} />
        </section>
      )}

      {/* Upcoming bookings */}
      {upcomingBookings && upcomingBookings.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Próximas reservas</h2>
            <Link to="/my-bookings" className="text-sm font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingBookings.map((b) => (
              <UpcomingBookingRow key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loadingBookings && (!bookings || bookings.length === 0) && (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Umbrella className="h-7 w-7" />
          </span>
          <div>
            <p className="text-lg font-bold">Todavía no tenés reservas</p>
            <p className="text-muted-foreground">Buscá un balneario abajo y reservá tu lugar en la playa.</p>
          </div>
        </Card>
      )}

      {/* Search */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Buscar balnearios</h2>
        <Card className="p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ciudad</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Ej: Mar del Plata"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Balneario</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nombre del balneario"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fecha</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" /> Buscar
            </Button>
          </div>
        </Card>

        {/* Results */}
        {hasFilters && (
          <div className="mt-6">
            {loadingResorts && <Loading label="Cargando balnearios..." />}
            {resortError && <ErrorState message={getApiErrorMessage(resortError, "No pudimos cargar los balnearios.")} />}
            {filteredResorts && filteredResorts.length === 0 && (
              <p className="text-muted-foreground">No se encontraron balnearios con esos criterios.</p>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResorts?.map((r) => (
                <ResortCard key={r.idResort} resort={r} />
              ))}
            </div>
          </div>
        )}

        {/* Show all resorts when no filter */}
        {!hasFilters && (
          <div className="mt-6">
            <p className="mb-4 text-sm text-muted-foreground">Todos los balnearios disponibles</p>
            {loadingResorts && <Loading label="Cargando balnearios..." />}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resorts?.map((r) => (
                <ResortCard key={r.idResort} resort={r} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card className={`p-4 ${color}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-extrabold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function ActiveBookingCard({ booking }: { booking: Booking }) {
  const cover = resortCover({ idResort: booking.resortId ?? 1, coverPhotoUrl: booking.resortCoverPhotoUrl ?? "" })
  return (
    <Card className="overflow-hidden border-green-200 bg-green-50">
      <div className="flex items-center gap-0">
        <img src={cover} alt={booking.resortName ?? ""} className="h-28 w-28 shrink-0 object-cover sm:h-32 sm:w-32" />
        <div className="flex flex-1 flex-wrap items-start justify-between gap-3 p-4">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-green-700" />
              <p className="font-bold text-green-800">{booking.resortName ?? `Reserva #${booking.id}`}</p>
            </div>
            {booking.resortLocation && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-green-700">
                <MapPin className="h-3.5 w-3.5" /> {booking.resortLocation}
              </p>
            )}
            <p className="mt-1 text-sm text-green-700">
              {formatDate(String(booking.startDate))} — {formatDate(String(booking.endDate))}
            </p>
            <p className="text-sm text-green-700">
              {booking.guests.length} huésped{booking.guests.length !== 1 ? "es" : ""} · {formatCurrency(booking.totalPrice)}
            </p>
          </div>
          <Link to={`/bookings/${booking.id}`}>
            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
              Ver QR <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

function UpcomingBookingRow({ booking }: { booking: Booking }) {
  const cover = resortCover({ idResort: booking.resortId ?? 1, coverPhotoUrl: booking.resortCoverPhotoUrl ?? "" })
  return (
    <Link to={`/bookings/${booking.id}`}>
      <Card className="flex items-center gap-0 overflow-hidden transition-shadow hover:shadow-md">
        <img src={cover} alt={booking.resortName ?? ""} className="h-20 w-20 shrink-0 object-cover" />
        <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{booking.resortName ?? `Reserva #${booking.id}`}</span>
              <StatusBadge status={booking.status} />
            </div>
            {booking.resortLocation && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {booking.resortLocation}
              </p>
            )}
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(String(booking.startDate))} — {formatDate(String(booking.endDate))}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden font-semibold sm:block">{formatCurrency(booking.totalPrice)}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </Link>
  )
}

function ResortCard({ resort }: { resort: Resort }) {
  const uniqueAmenities = resort.amenities
    ? [...new Map(resort.amenities.map((a) => [a.idAmenity, a])).values()]
    : []
  const available = resort.rentalUnits?.filter((u) => !u.isBlocked) ?? []
  const fromPrice = available.length ? Math.min(...available.map((u) => u.dailyPrice)) : null

  return (
    <Link to={`/resorts/${resort.idResort}`} className="group">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-36 overflow-hidden">
          <img
            src={resortCover(resort)}
            alt={resort.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold">{resort.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {resort.location}
          </p>
          {uniqueAmenities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {uniqueAmenities.slice(0, 3).map((a) => {
                const Icon = amenityIcon(a.name)
                return (
                  <span key={a.idAmenity} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    <Icon className="h-3 w-3" /> {a.name}
                  </span>
                )
              })}
            </div>
          )}
          {fromPrice !== null && (
            <p className="mt-3 text-sm text-muted-foreground">
              Desde <span className="font-bold text-foreground">{formatCurrency(fromPrice)}</span> / día
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
