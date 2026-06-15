import { Link, useSearchParams } from "react-router-dom"
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, QrCode } from "lucide-react"
import { useBooking } from "@/lib/queries"
import { Button, Card, Loading } from "@/components/ui"
import { formatCurrency, formatDate, todayISO } from "@/lib/utils"

export function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const bookingId = params.get("bookingId")
  const { data: booking, isLoading } = useBooking(bookingId ?? undefined)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-background px-4 py-12">
      {/* Success icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-lg shadow-green-200">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">¡Pago confirmado!</h1>
      <p className="mt-2 max-w-xs text-center text-muted-foreground">
        Tu reserva está activa. Ya podés ver tus códigos QR de ingreso.
      </p>

      {/* Booking summary card */}
      {bookingId && (
        <div className="mt-8 w-full max-w-md">
          {isLoading ? (
            <Loading label="Cargando detalle de reserva..." />
          ) : booking ? (
            <Card className="overflow-hidden">
              {/* Header strip */}
              <div className="bg-gradient-to-r from-primary to-accent px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Reserva confirmada</p>
                <h2 className="mt-0.5 text-lg font-extrabold text-white">
                  {booking.resortName ?? "Balneario"}
                </h2>
                {booking.resortLocation && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                    <MapPin className="h-3.5 w-3.5" /> {booking.resortLocation}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="divide-y divide-border">
                <Row label="Reserva #" value={String(booking.id)} />
                <Row
                  label="Fechas"
                  value={`${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`}
                  icon={CalendarDays}
                />
                <Row label="Unidad" value={`#${booking.rentalUnitId}`} />
                <Row label="Total abonado" value={formatCurrency(booking.totalPrice)} highlight />
              </div>

              {/* QR notice */}
              <div className="px-5 py-4">
                {todayISO() >= String(booking.startDate) ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <p className="flex items-center gap-2 font-semibold">
                      <QrCode className="h-4 w-4" /> Tu QR ya está disponible
                    </p>
                    <p className="mt-0.5 text-green-700/80">
                      Mostralo en la entrada el día de ingreso.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    <p className="flex items-center gap-2 font-semibold">
                      <QrCode className="h-4 w-4" /> QR disponible desde el {formatDate(String(booking.startDate))}
                    </p>
                    <p className="mt-0.5 text-blue-700/80">
                      Volvé el día de tu reserva para ver el código de ingreso.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-center text-sm text-muted-foreground">
              No se pudo cargar el detalle de la reserva.
            </Card>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        {bookingId && (
          <Link to={`/bookings/${bookingId}`} className="flex-1">
            <Button size="lg" className="w-full gap-2">
              <QrCode className="h-4 w-4" /> Ver mis QR <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <Link to="/my-bookings" className="flex-1">
          <Button size="lg" variant={bookingId ? "outline" : "default"} className="w-full">
            Mis reservas
          </Button>
        </Link>
      </div>

      {!bookingId && (
        <Link to="/" className="mt-3">
          <Button variant="ghost" size="sm">Volver al inicio</Button>
        </Link>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string
  value: string
  icon?: React.ElementType
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
      <span className={highlight ? "text-lg font-extrabold text-foreground" : "text-sm font-semibold text-foreground"}>
        {value}
      </span>
    </div>
  )
}
