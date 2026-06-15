import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Eye, Search, Users, XCircle } from "lucide-react"
import { useAllBookings, useCancelBooking } from "@/lib/queries"
import type { Booking, BookingStatus } from "@/lib/types"
import { Badge, Button, Card, CardBody, ErrorState, Input, Loading, Select, StatusBadge } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/utils"

const STATUS_FILTERS: { value: "ALL" | BookingStatus; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CANCELED", label: "Canceladas" },
]

export default function AdminBookingsPage() {
  const { data: bookings, isLoading, isError } = useAllBookings()
  const cancelBooking = useCancelBooking()
  const [status, setStatus] = useState<"ALL" | BookingStatus>("ALL")
  const [search, setSearch] = useState("")
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!bookings) return []
    return bookings.filter((b) => {
      if (status !== "ALL" && b.status !== status) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const inGuests = b.guests.some((g) => g.fullName.toLowerCase().includes(q))
        const inWalkIn = (b.walkInName ?? "").toLowerCase().includes(q)
        const inId = String(b.id).includes(q)
        if (!inGuests && !inWalkIn && !inId) return false
      }
      return true
    })
  }, [bookings, status, search])

  async function handleCancel(id: number) {
    setCancelError(null)
    try {
      await cancelBooking.mutateAsync(id)
      setConfirmCancel(null)
    } catch {
      setCancelError("No se pudo cancelar la reserva. Intentá de nuevo.")
    }
  }

  if (isLoading) return <Loading label="Cargando reservas..." />
  if (isError) return <ErrorState message="No pudimos cargar las reservas." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
        <p className="text-sm text-muted-foreground">Todas las reservas de tu balneario.</p>
      </div>

      {cancelError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{cancelError}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por huésped o N° de reserva"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select className="w-auto" value={status} onChange={(e) => setStatus(e.target.value as "ALL" | BookingStatus)}>
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-muted-foreground">No hay reservas que coincidan.</CardBody>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">N°</th>
                  <th className="px-4 py-3 font-semibold">Huésped</th>
                  <th className="px-4 py-3 font-semibold">Entrada</th>
                  <th className="px-4 py-3 font-semibold">Salida</th>
                  <th className="px-4 py-3 font-semibold">Personas</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    confirmCancel={confirmCancel}
                    setConfirmCancel={setConfirmCancel}
                    onCancel={handleCancel}
                    cancelPending={cancelBooking.isPending && cancelBooking.variables === b.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

function BookingRow({
  booking: b,
  confirmCancel,
  setConfirmCancel,
  onCancel,
  cancelPending,
}: {
  booking: Booking
  confirmCancel: number | null
  setConfirmCancel: (id: number | null) => void
  onCancel: (id: number) => void
  cancelPending: boolean
}) {
  const primaryName = b.walkInName || b.guests[0]?.fullName || "—"
  const canCancel = b.status !== "CANCELED"
  const isConfirming = confirmCancel === b.id

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30">
      <td className="px-4 py-3 font-mono text-muted-foreground">#{b.id}</td>
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">{primaryName}</div>
        {b.walkInName && <span className="text-xs text-muted-foreground">Presencial</span>}
        {b.walkInDni && <span className="block text-xs text-muted-foreground">DNI {b.walkInDni}</span>}
        {!b.walkInName && b.guests.length > 1 && (
          <div className="mt-0.5 space-y-0.5">
            {b.guests.slice(1).map((g) => (
              <span key={g.idGuest} className="block text-xs text-muted-foreground">{g.fullName}</span>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{formatDate(b.startDate)}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatDate(b.endDate)}</td>
      <td className="px-4 py-3">
        <Badge variant="muted">
          <Users className="h-3 w-3" />
          {b.guests.length || 1}
        </Badge>
      </td>
      <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(b.totalPrice)}</td>
      <td className="px-4 py-3">
        <StatusBadge status={b.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1">
          <Link to={`/admin/bookings/${b.id}`}>
            <Button size="sm" variant="ghost" className="gap-1">
              <Eye className="h-3.5 w-3.5" /> Ver
            </Button>
          </Link>
          {canCancel && !isConfirming && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmCancel(b.id)}
            >
              <XCircle className="h-3.5 w-3.5" /> Cancelar
            </Button>
          )}
          {canCancel && isConfirming && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                loading={cancelPending}
                onClick={() => onCancel(b.id)}
              >
                Confirmar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(null)}>
                No
              </Button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
