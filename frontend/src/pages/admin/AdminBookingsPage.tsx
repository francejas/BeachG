import { useMemo, useState } from "react"
import { Search, Users } from "lucide-react"
import { useAllBookings } from "@/lib/queries"
import type { BookingStatus } from "@/lib/types"
import { Badge, Card, CardBody, ErrorState, Input, Loading, Select, StatusBadge } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/utils"

const STATUS_FILTERS: { value: "ALL" | BookingStatus; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CANCELED", label: "Canceladas" },
]

export default function AdminBookingsPage() {
  const { data: bookings, isLoading, isError } = useAllBookings()
  const [status, setStatus] = useState<"ALL" | BookingStatus>("ALL")
  const [search, setSearch] = useState("")

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

  if (isLoading) return <Loading label="Cargando reservas..." />
  if (isError) return <ErrorState message="No pudimos cargar las reservas." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
        <p className="text-sm text-muted-foreground">Todas las reservas de tu balneario.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
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
                  <th className="px-4 py-3 font-semibold">Fechas</th>
                  <th className="px-4 py-3 font-semibold">Personas</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const primaryName = b.walkInName || b.guests[0]?.fullName || "—"
                  return (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-muted-foreground">#{b.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{primaryName}</div>
                        {b.walkInName && <span className="text-xs text-muted-foreground">Walk-in</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(b.startDate)} – {formatDate(b.endDate)}
                      </td>
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
