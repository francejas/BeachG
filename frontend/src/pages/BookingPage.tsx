import { FormEvent, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CalendarDays, CreditCard, Plus, Tent, Trash2, Umbrella, Users } from "lucide-react"
import { useResort, useCreateBooking } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Button, Card, ErrorState, Input, Label, Loading, Select } from "@/components/ui"
import { addDaysISO, daysBetween, formatCurrency, todayISO } from "@/lib/utils"
import type { UnitType } from "@/lib/types"

export function BookingPage() {
  const { resortId } = useParams()
  const { clientId } = useAuth()
  const navigate = useNavigate()
  const { data: resort, isLoading, error } = useResort(resortId)
  const createBooking = useCreateBooking()

  const [unitType, setUnitType] = useState<UnitType>("TENT")
  const [rentalUnitId, setRentalUnitId] = useState<number | "">("")
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState(addDaysISO(todayISO(), 1))
  const [guestNames, setGuestNames] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!resortId) return
    const pending = sessionStorage.getItem(`beachg_unit_${resortId}`)
    if (pending) {
      try {
        const { unitId, type } = JSON.parse(pending)
        setUnitType(type)
        setRentalUnitId(unitId)
      } catch {}
      sessionStorage.removeItem(`beachg_unit_${resortId}`)
    }
  }, [resortId])

  const availableUnits = useMemo(
    () => resort?.rentalUnits?.filter((u) => !u.isBlocked && u.type === unitType) ?? [],
    [resort, unitType],
  )

  const selectedUnit = availableUnits.find((u) => u.idRentalUnit === rentalUnitId)
  const nights = startDate && endDate && endDate >= startDate ? daysBetween(startDate, endDate) : 0
  const total = selectedUnit ? selectedUnit.dailyPrice * nights : 0

  if (isLoading) return <Loading label="Cargando..." />
  if (error || !resort)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={getApiErrorMessage(error, "No encontramos el balneario.")} />
      </div>
    )

  function changeUnitType(type: UnitType) {
    setUnitType(type)
    setRentalUnitId("")
  }

  function updateGuest(i: number, value: string) {
    setGuestNames((g) => g.map((n, idx) => (idx === i ? value : n)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    if (!rentalUnitId) return setSubmitError("Elegí una unidad disponible.")
    if (endDate < startDate) return setSubmitError("La fecha de salida debe ser posterior a la de entrada.")
    const names = guestNames.map((n) => n.trim()).filter(Boolean)

    try {
      const result = await createBooking.mutateAsync({
        startDate,
        endDate,
        clientId: clientId!,
        rentalUnitId: Number(rentalUnitId),
        guestNames: names,
      })
      if (result.paymentUrl) {
        window.open(result.paymentUrl, "_blank", "noopener,noreferrer")
        navigate("/my-bookings")
      } else {
        navigate("/my-bookings")
      }
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "No pudimos crear la reserva. Probá con otras fechas o unidad."))
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to={`/resorts/${resort.idResort}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al balneario
      </Link>
      <h1 className="text-3xl font-extrabold">Reservar en {resort.name}</h1>
      <p className="mt-1 text-muted-foreground">Completá los datos y continuá al pago seguro.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Unit type */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <Umbrella className="h-5 w-5 text-primary" /> Tipo de unidad
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(["TENT", "UMBRELLA"] as UnitType[]).map((type) => {
                const Icon = type === "TENT" ? Tent : Umbrella
                const count = resort.rentalUnits.filter((u) => !u.isBlocked && u.type === type).length
                const active = unitType === type
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => changeUnitType(type)}
                    className={
                      "flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors " +
                      (active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")
                    }
                  >
                    <Icon className={"h-6 w-6 " + (active ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-semibold">{type === "TENT" ? "Carpa" : "Sombrilla"}</span>
                    <span className="text-xs text-muted-foreground">{count} disponibles</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4">
              <Label htmlFor="unit">Unidad</Label>
              <Select id="unit" value={rentalUnitId} onChange={(e) => setRentalUnitId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Elegí una unidad</option>
                {availableUnits.map((u) => (
                  <option key={u.idRentalUnit} value={u.idRentalUnit}>
                    {u.identifier} — {formatCurrency(u.dailyPrice)} / día
                  </option>
                ))}
              </Select>
              {availableUnits.length === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">No hay unidades de este tipo disponibles.</p>
              )}
            </div>
          </Card>

          {/* Dates */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <CalendarDays className="h-5 w-5 text-primary" /> Fechas
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start">Entrada</Label>
                <Input
                  id="start"
                  type="date"
                  min={todayISO()}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (endDate < e.target.value) setEndDate(addDaysISO(e.target.value, 1))
                  }}
                />
              </div>
              <div>
                <Label htmlFor="end">Salida</Label>
                <Input id="end" type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </Card>

          {/* Guests */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <Users className="h-5 w-5 text-primary" /> Huéspedes <span className="text-sm font-normal text-muted-foreground">(opcional)</span>
            </h2>
            <p className="mb-3 text-sm text-muted-foreground">Cada huésped recibirá su propio código QR de ingreso.</p>
            <div className="space-y-2">
              {guestNames.map((name, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder={`Nombre del huésped ${i + 1}`} value={name} onChange={(e) => updateGuest(i, e.target.value)} />
                  <Button type="button" variant="outline" size="icon" onClick={() => setGuestNames((g) => g.filter((_, idx) => idx !== i))} aria-label="Quitar huésped">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => setGuestNames((g) => [...g, ""])}>
              <Plus className="h-4 w-4" /> Agregar huésped
            </Button>
          </Card>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-20 p-6">
            <h3 className="text-lg font-bold">Resumen</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Unidad</dt>
                <dd className="font-medium">{selectedUnit ? selectedUnit.identifier : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Precio / día</dt>
                <dd className="font-medium">{selectedUnit ? formatCurrency(selectedUnit.dailyPrice) : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Días</dt>
                <dd className="font-medium">{nights || "—"}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-extrabold">{formatCurrency(total)}</span>
            </div>
            {submitError && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{submitError}</p>}
            <Button type="submit" size="lg" className="mt-4 w-full" loading={createBooking.isPending} disabled={!selectedUnit || nights < 1}>
              <CreditCard className="h-5 w-5" /> Ir a pagar
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">Pago seguro con Mercado Pago</p>
          </Card>
        </aside>
      </form>
    </div>
  )
}
