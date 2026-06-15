import { useState } from "react"
import { CheckCircle2, UserPlus } from "lucide-react"
import { useCreateWalkIn, useMyResort, useRentalUnits } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { Button, Card, CardBody, Input, Label, Loading, Select } from "@/components/ui"
import { addDaysISO, formatCurrency, todayISO } from "@/lib/utils"

export default function AdminWalkInPage() {
  const { data: resort } = useMyResort()
  const { data: units, isLoading } = useRentalUnits()
  const createWalkIn = useCreateWalkIn()

  const [walkInName, setWalkInName] = useState("")
  const [walkInDni, setWalkInDni] = useState("")
  const [rentalUnitId, setRentalUnitId] = useState("")
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState(addDaysISO(todayISO(), 1))
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  if (isLoading) return <Loading label="Cargando unidades..." />

  const availableUnits = units?.filter((u) => !u.isBlocked) ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setDone(null)
    if (!resort) return
    try {
      const res = await createWalkIn.mutateAsync({
        startDate,
        endDate,
        clientId: 0,
        rentalUnitId: Number(rentalUnitId),
        guestNames: [walkInName],
        walkInName,
        walkInDni,
        isWalkIn: true,
      })
      setDone(`Reserva registrada por ${formatCurrency(res.booking.totalPrice)}.`)
      setWalkInName("")
      setWalkInDni("")
      setRentalUnitId("")
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reserva en mostrador</h1>
        <p className="text-sm text-muted-foreground">
          Registrá una reserva presencial (walk-in) para un cliente sin cuenta.
        </p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="wname">Nombre del cliente</Label>
                <Input id="wname" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="wdni">DNI</Label>
                <Input id="wdni" value={walkInDni} onChange={(e) => setWalkInDni(e.target.value)} required />
              </div>
            </div>

            <div>
              <Label htmlFor="unit">Unidad</Label>
              <Select id="unit" value={rentalUnitId} onChange={(e) => setRentalUnitId(e.target.value)} required>
                <option value="">Seleccioná una unidad</option>
                {availableUnits.map((u) => (
                  <option key={u.idRentalUnit} value={u.idRentalUnit}>
                    {u.identifier} — {u.type === "TENT" ? "Carpa" : "Sombrilla"} ({formatCurrency(u.dailyPrice)}/día)
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="start">Desde</Label>
                <Input
                  id="start"
                  type="date"
                  min={todayISO()}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (e.target.value >= endDate) setEndDate(addDaysISO(e.target.value, 1))
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end">Hasta</Label>
                <Input
                  id="end"
                  type="date"
                  min={addDaysISO(startDate, 1)}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {done && (
              <p className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                {done}
              </p>
            )}

            <Button type="submit" loading={createWalkIn.isPending}>
              <UserPlus className="h-4 w-4" />
              Registrar reserva
            </Button>
          </CardBody>
        </form>
      </Card>
    </div>
  )
}
