import { Link } from "react-router-dom"
import { CalendarDays, ChevronRight, MapPin, QrCode, Umbrella } from "lucide-react"
import { useClientBookings } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Button, Card, ErrorState, Loading, StatusBadge } from "@/components/ui"
import { formatCurrency, formatDate, todayISO } from "@/lib/utils"
import { resortCover } from "@/components/resort-helpers"
import type { Booking } from "@/lib/types"

export function MyBookingsPage() {
  const { clientId } = useAuth()
  const { data: bookings, isLoading, error } = useClientBookings(clientId)
  const today = todayISO()

  const active = bookings?.filter((b) => b.status !== "CANCELED" && String(b.endDate) >= today) ?? []
  const past = bookings?.filter((b) => b.status === "CANCELED" || String(b.endDate) < today) ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Mis reservas</h1>
          <p className="mt-1 text-muted-foreground">Seguí el estado de tus reservas y mostrá tu QR para ingresar.</p>
        </div>
        <Link to="/" className="hidden sm:block">
          <Button variant="outline">Nueva reserva</Button>
        </Link>
      </div>

      {isLoading && <Loading label="Cargando tus reservas..." />}
      {error && <ErrorState message={getApiErrorMessage(error, "No pudimos cargar tus reservas.")} />}

      {bookings && bookings.length === 0 && (
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Umbrella className="h-7 w-7" />
          </span>
          <div>
            <p className="text-lg font-bold">Todavía no tenés reservas</p>
            <p className="text-muted-foreground">Elegí un balneario y reservá tu lugar en la playa.</p>
          </div>
          <Link to="/">
            <Button>Ver balnearios</Button>
          </Link>
        </Card>
      )}

      {/* Active & upcoming */}
      {active.length > 0 && (
        <section>
          <div className="space-y-3">
            {active.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}

      {/* Past & canceled */}
      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold text-muted-foreground">Historial</h2>
          <div className="space-y-3 opacity-70">
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BookingRow({ booking }: { booking: Booking }) {
  const today = todayISO()
  const isExpired = String(booking.endDate) < today
  const qrAvailable = today >= String(booking.startDate)
  const confirmedQrCount =
    booking.status === "CONFIRMED" && !isExpired && qrAvailable ? booking.guests.length : 0

  const cover = resortCover({ idResort: booking.resortId ?? 1, coverPhotoUrl: booking.resortCoverPhotoUrl ?? "" })

  return (
    <Link to={`/bookings/${booking.id}`}>
      <Card className="flex items-center gap-4 overflow-hidden p-0 transition-shadow hover:shadow-md">
        <img
          src={cover}
          alt={booking.resortName ?? "Balneario"}
          className="h-24 w-24 shrink-0 object-cover sm:h-28 sm:w-28"
        />
        <div className="min-w-0 flex-1 py-4 pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{booking.resortName ?? `Reserva #${booking.id}`}</span>
            <StatusBadge status={booking.status} />
            {isExpired && booking.status === "CONFIRMED" && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Vencida</span>
            )}
          </div>
          {booking.resortLocation && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {booking.resortLocation}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {formatDate(String(booking.startDate))} — {formatDate(String(booking.endDate))}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{formatCurrency(booking.totalPrice)}</span>
            {confirmedQrCount > 0 && (
              <span className="inline-flex items-center gap-1 text-success">
                <QrCode className="h-4 w-4" /> {confirmedQrCount} QR listos
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="mr-4 h-5 w-5 shrink-0 text-muted-foreground" />
      </Card>
    </Link>
  )
}
