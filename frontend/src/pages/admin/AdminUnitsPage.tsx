import { useState } from "react"
import { Lock, LockOpen, Plus, Tent, Umbrella, X } from "lucide-react"
import {
  useCreateUnit,
  useMyResort,
  useRentalUnits,
  useUpdateUnitBlock,
  useUpdateUnitPrice,
} from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import type { RentalUnit, UnitType } from "@/lib/types"
import { Badge, Button, Card, CardBody, ErrorState, Input, Label, Loading, Select } from "@/components/ui"
import { formatCurrency } from "@/lib/utils"

export default function AdminUnitsPage() {
  const { data: resort } = useMyResort()
  const { data: units, isLoading, isError } = useRentalUnits()
  const createUnit = useCreateUnit()
  const updateBlock = useUpdateUnitBlock()

  const [showForm, setShowForm] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [type, setType] = useState<UnitType>("TENT")
  const [dailyPrice, setDailyPrice] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <Loading label="Cargando unidades..." />
  if (isError) return <ErrorState message="No pudimos cargar las unidades." />

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!resort) return
    try {
      await createUnit.mutateAsync({
        identifier,
        type,
        dailyPrice: Number(dailyPrice),
        isBlocked: false,
        resortId: resort.idResort,
      })
      setIdentifier("")
      setDailyPrice("")
      setType("TENT")
      setShowForm(false)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Unidades</h1>
          <p className="text-sm text-muted-foreground">Carpas y sombrillas disponibles para alquilar.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)} variant={showForm ? "outline" : "primary"}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Nueva unidad"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate}>
            <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <div>
                <Label htmlFor="identifier">Identificador</Label>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ej: A-12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select id="type" value={type} onChange={(e) => setType(e.target.value as UnitType)}>
                  <option value="TENT">Carpa</option>
                  <option value="UMBRELLA">Sombrilla</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Precio diario ($)</Label>
                <Input
                  id="price"
                  inputMode="numeric"
                  value={dailyPrice}
                  onChange={(e) => setDailyPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Ej: 5000"
                  required
                />
              </div>
              <Button type="submit" loading={createUnit.isPending}>
                Crear unidad
              </Button>
              {error && <p className="text-sm font-medium text-destructive sm:col-span-2 lg:col-span-4">{error}</p>}
            </CardBody>
          </form>
        </Card>
      )}

      {units && units.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-muted-foreground">
            Todavía no cargaste unidades. Creá la primera para empezar a recibir reservas.
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {units?.map((unit) => (
            <UnitCard key={unit.idRentalUnit} unit={unit} onToggleBlock={updateBlock} />
          ))}
        </div>
      )}
    </div>
  )
}

function UnitCard({
  unit,
  onToggleBlock,
}: {
  unit: RentalUnit
  onToggleBlock: ReturnType<typeof useUpdateUnitBlock>
}) {
  const updatePrice = useUpdateUnitPrice()
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(String(unit.dailyPrice))
  const Icon = unit.type === "TENT" ? Tent : Umbrella

  async function savePrice() {
    await updatePrice.mutateAsync({ id: unit.idRentalUnit, newPrice: Number(price) })
    setEditing(false)
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">{unit.identifier}</p>
              <p className="text-xs text-muted-foreground">{unit.type === "TENT" ? "Carpa" : "Sombrilla"}</p>
            </div>
          </div>
          {unit.isBlocked ? <Badge variant="destructive">Bloqueada</Badge> : <Badge variant="success">Activa</Badge>}
        </div>

        {editing ? (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor={`price-${unit.idRentalUnit}`}>Precio diario ($)</Label>
              <Input
                id={`price-${unit.idRentalUnit}`}
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <Button size="sm" onClick={savePrice} loading={updatePrice.isPending}>
              OK
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(unit.dailyPrice)}
              <span className="text-sm font-normal text-muted-foreground"> /día</span>
            </p>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Editar precio
            </Button>
          </div>
        )}

        <Button
          variant={unit.isBlocked ? "outline" : "secondary"}
          size="sm"
          className="w-full"
          loading={onToggleBlock.isPending && onToggleBlock.variables?.id === unit.idRentalUnit}
          onClick={() => onToggleBlock.mutate({ id: unit.idRentalUnit, isBlocked: !unit.isBlocked })}
        >
          {unit.isBlocked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {unit.isBlocked ? "Desbloquear" : "Bloquear"}
        </Button>
      </CardBody>
    </Card>
  )
}
