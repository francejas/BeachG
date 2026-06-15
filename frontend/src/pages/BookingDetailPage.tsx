import { Link, useParams } from "react-router-dom"
import { ArrowLeft, CalendarDays, Clock, MapPin, Printer, QrCode } from "lucide-react"
import { useBooking } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { Button, Card, ErrorState, Loading, StatusBadge } from "@/components/ui"
import { GuestQR } from "@/components/GuestQR"
import { formatCurrency, formatDate } from "@/lib/utils"

export function BookingDetailPage() {
  const { id } = useParams()
  const { data: booking, isLoading, error } = useBooking(id)

  if (isLoading) return <Loading label="Cargando reserva..." />
  if (error || !booking)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={getApiErrorMessage(error, "No encontramos esta reserva.")} />
      </div>
    )

  const isConfirmed = booking.status === "CONFIRMED"

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="print:hidden">
        <Link to="/my-bookings" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver a mis reservas
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold">Reserva #{booking.id}</h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-muted-foreground">Creada el {formatDate(booking.createdAt?.slice(0, 10))}</p>
        </div>
        {isConfirmed && (
          <Button variant="outline" onClick={() => window.print()} className="print:hidden">
            <Printer className="h-4 w-4" /> Imprimir QR
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 print:hidden">
        <InfoCard icon={CalendarDays} label="Estadía" value={`${formatDate(booking.startDate)} — ${formatDate(booking.endDate)}`} />
        <InfoCard icon={MapPin} label="Unidad" value={`#${booking.rentalUnitId}`} />
        <InfoCard icon={Clock} label="Total" value={formatCurrency(booking.totalPrice)} />
      </div>

      {booking.walkInName && (
        <Card className="mt-4 p-5 print:hidden">
          <p className="text-sm text-muted-foreground">Reserva presencial</p>
          <p className="font-semibold">
            {booking.walkInName}
            {booking.walkInDni ? ` · DNI ${booking.walkInDni}` : ""}
          </p>
        </Card>
      )}

      <section className="mt-8">
        <h2 className="mb-1 flex items-center gap-2 text-xl font-bold">
          <QrCode className="h-5 w-5 text-primary" /> Códigos QR de ingreso
        </h2>
        {isConfirmed ? (
          <p className="mb-4 text-sm text-muted-foreground">
            Mostrá estos códigos en la entrada. Cada huésped tiene el suyo.
          </p>
        ) : (
          <Card className="mt-3 border-warning/40 bg-warning/10 p-5">
            <p className="font-medium text-warning-foreground">
              Los códigos QR se habilitan cuando el pago esté confirmado.
            </p>
            <p className="mt-1 text-sm text-warning-foreground/80">Estado actual: {booking.status}</p>
          </Card>
        )}

        {isConfirmed && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {booking.guests.map((g) => (
              <GuestQR key={g.idGuest} guest={g} />
            ))}
          </div>
        )}
      </section>
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
