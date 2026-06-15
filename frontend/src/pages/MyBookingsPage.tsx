import { Link } from "react-router-dom"
import { CalendarDays, ChevronRight, QrCode, Umbrella } from "lucide-react"
import { useClientBookings } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Button, Card, ErrorState, Loading, StatusBadge } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Booking } from "@/lib/types"

export function MyBookingsPage() {
  const { clientId } = useAuth()
  const { data: bookings, isLoading, error } = useClientBookings(clientId)

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

      <div className="space-y-3">
        {bookings?.map((b) => (
          <BookingRow key={b.id} booking={b} />
        ))}
      </div>
    </div>
  )
}

function BookingRow({ booking }: { booking: Booking }) {
  const confirmedQrCount = booking.status === "CONFIRMED" ? booking.guests.length : 0
  return (
    <Link to={`/bookings/${booking.id}`}>
      <Card className="flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-md">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">Reserva #{booking.id}</span>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{booking.guests.length} huésped{booking.guests.length !== 1 ? "es" : ""}</span>
            {confirmedQrCount > 0 && (
              <span className="inline-flex items-center gap-1 text-success">
                <QrCode className="h-4 w-4" /> {confirmedQrCount} QR listos
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-bold sm:block">{formatCurrency(booking.totalPrice)}</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>
    </Link>
  )
}
