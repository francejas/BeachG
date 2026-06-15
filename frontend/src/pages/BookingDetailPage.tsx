import { Link, useParams } from "react-router-dom"
import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin, Printer, QrCode } from "lucide-react"
import { useBooking } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { Button, Card, ErrorState, Loading, StatusBadge } from "@/components/ui"
import { GuestQR } from "@/components/GuestQR"
import { resortCover } from "@/components/resort-helpers"
import { formatCurrency, formatDate, todayISO } from "@/lib/utils"

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
  const today = todayISO()
  const qrAvailable = today >= String(booking.startDate)
  const isExpired = String(booking.endDate) < today
  const cover = resortCover({ idResort: booking.resortId ?? 1, coverPhotoUrl: booking.resortCoverPhotoUrl ?? "" })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="print:hidden">
        <Link to="/my-bookings" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver a mis reservas
        </Link>
      </div>

      {/* Resort header */}
      {booking.resortName && (
        <Card className="mb-6 overflow-hidden print:hidden">
          <div className="flex items-center gap-0">
            <img src={cover} alt={booking.resortName} className="h-28 w-28 shrink-0 object-cover sm:h-32 sm:w-36" />
            <div className="flex flex-1 flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Balneario</p>
                <h2 className="mt-0.5 text-xl font-extrabold">{booking.resortName}</h2>
                {booking.resortLocation && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {booking.resortLocation}
                  </p>
                )}
              </div>
              {booking.resortLocation && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.resortLocation)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3.5 w-3.5" /> Cómo llegar
                  </Button>
                </a>
              )}
            </div>
          </div>
        </Card>
      )}

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

      <div className="mt-6 grid gap-3 sm:grid-cols-4 print:hidden">
        <InfoCard icon={CalendarDays} label="Entrada" value={formatDate(booking.startDate)} />
        <InfoCard icon={CalendarDays} label="Salida" value={formatDate(booking.endDate)} />
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

        {!isConfirmed && (
          <Card className="mt-3 border-warning/40 bg-warning/10 p-5">
            <p className="font-medium text-warning-foreground">
              Los códigos QR se habilitan cuando el pago esté confirmado.
            </p>
            <p className="mt-1 text-sm text-warning-foreground/80">Estado actual: {booking.status}</p>
          </Card>
        )}

        {isConfirmed && isExpired && (
          <Card className="mt-3 border-muted bg-muted/30 p-5">
            <p className="font-medium text-muted-foreground">
              Esta reserva ya venció — los QR están deshabilitados.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              La estadía finalizó el {formatDate(String(booking.endDate))}.
            </p>
          </Card>
        )}

        {isConfirmed && !isExpired && !qrAvailable && (
          <Card className="mt-3 border-blue-200 bg-blue-50 p-5">
            <p className="font-medium text-blue-800">
              Tu QR estará disponible a partir del {formatDate(String(booking.startDate))}.
            </p>
            <p className="mt-1 text-sm text-blue-700">
              Volvé el día de tu reserva para ver y mostrar tu código de ingreso.
            </p>
          </Card>
        )}

        {isConfirmed && !isExpired && qrAvailable && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Mostrá estos códigos en la entrada. Cada huésped tiene el suyo.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(booking.guests ?? []).map((g) => (
                <GuestQR key={g.idGuest} guest={g} />
              ))}
            </div>
          </>
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
