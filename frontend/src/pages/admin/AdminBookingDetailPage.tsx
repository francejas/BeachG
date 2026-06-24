import { Link, useParams } from "react-router-dom"
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, MapPin, User, XCircle } from "lucide-react"
import { useBooking } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { Card, ErrorState, Loading, StatusBadge } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function AdminBookingDetailPage() {
  const { id } = useParams()
  const { data: booking, isLoading, error } = useBooking(id)

  if (isLoading) return <Loading label="Cargando reserva..." />
  if (error || !booking)
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState message={getApiErrorMessage(error, "No encontramos esta reserva.")} />
      </div>
    )

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/bookings"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a reservas
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">Reserva #{booking.id}</h1>
          <StatusBadge status={booking.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Creada el {formatDate(booking.createdAt?.slice(0, 10))}
        </p>
      </div>

      {/* Info cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <InfoCard icon={CalendarDays} label="Entrada" value={formatDate(booking.startDate)} />
        <InfoCard icon={CalendarDays} label="Salida" value={formatDate(booking.endDate)} />
        <InfoCard icon={MapPin} label="Unidad" value={`#${booking.rentalUnitId}`} />
        <InfoCard icon={Clock} label="Total" value={formatCurrency(booking.totalPrice)} />
      </div>

      {/* Walk-in info */}
      {booking.walkInName && (
        <Card className="p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Reserva presencial
          </p>
          <p className="text-lg font-bold">{booking.walkInName}</p>
          {booking.walkInDni && (
            <p className="text-sm text-muted-foreground">DNI {booking.walkInDni}</p>
          )}
        </Card>
      )}

      {/* Guests */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <User className="h-5 w-5 text-primary" />
          Huéspedes
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {booking.guests.length}
          </span>
        </h2>

        {booking.guests.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">Sin huéspedes registrados.</Card>
        ) : (
          <div className="space-y-2">
            {booking.guests.map((g) => (
              <Card key={g.idGuest} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{g.fullName}</p>
                  <p className="text-sm text-muted-foreground">{g.dni ? `DNI ${g.dni}` : "Sin DNI"}</p>
                  <p className="font-mono text-xs text-muted-foreground">{g.qrToken}</p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  {g.isEntryValidated ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-success">Ingresó</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Pendiente</span>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="mt-1 font-semibold">{value}</p>
    </Card>
  )
}
