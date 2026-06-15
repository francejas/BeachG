import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, MapPin, Tent, Umbrella } from "lucide-react"
import { useResort } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Button, Card, ErrorState, Loading } from "@/components/ui"
import { amenityIcon, resortCover } from "@/components/resort-helpers"
import { formatCurrency } from "@/lib/utils"
import type { RentalUnit, UnitType } from "@/lib/types"

export function ResortDetailPage() {
  const { id } = useParams()
  const { data: resort, isLoading, error } = useResort(id)
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)

  if (isLoading) return <Loading label="Cargando balneario..." />
  if (error || !resort)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={getApiErrorMessage(error, "No encontramos este balneario.")} />
      </div>
    )

  const available = resort.rentalUnits?.filter((u) => !u.isBlocked) ?? []
  const tents = available.filter((u) => u.type === "TENT")
  const umbrellas = available.filter((u) => u.type === "UMBRELLA")

  // Deduplicate amenities by idAmenity
  const uniqueAmenities = resort.amenities
    ? [...new Map(resort.amenities.map((a) => [a.idAmenity, a])).values()]
    : []

  const selectedUnit = available.find((u) => u.idRentalUnit === selectedUnitId)

  function handleReserve() {
    if (!isAuthenticated) {
      if (selectedUnit) {
        sessionStorage.setItem(
          `beachg_unit_${resort!.idResort}`,
          JSON.stringify({ unitId: selectedUnit.idRentalUnit, type: selectedUnit.type }),
        )
      }
      navigate("/login", { state: { from: `/book/${resort!.idResort}` } })
    } else {
      navigate(`/book/${resort!.idResort}`)
    }
  }

  return (
    <div>
      <div className="relative h-64 md:h-80">
        <img src={resortCover(resort)} alt={resort.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-6">
          <Link to="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <h1 className="text-3xl font-extrabold text-white md:text-4xl">{resort.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-white/90">
            <MapPin className="h-4 w-4" /> {resort.location}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {resort.description && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Sobre el balneario</h2>
              <p className="leading-relaxed text-muted-foreground">{resort.description}</p>
            </section>
          )}
          {uniqueAmenities.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Servicios</h2>
              <div className="flex flex-wrap gap-2">
                {uniqueAmenities.map((a) => {
                  const Icon = amenityIcon(a.name)
                  return (
                    <span
                      key={a.idAmenity}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                    >
                      <Icon className="h-4 w-4 text-primary" /> {a.name}
                    </span>
                  )
                })}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-1 text-xl font-bold">Unidades disponibles</h2>
            <p className="mb-4 text-sm text-muted-foreground">Tocá una unidad para seleccionarla antes de reservar.</p>
            <div className="space-y-4">
              <UnitTypeBlock
                type="TENT"
                label="Carpas"
                units={tents}
                selectedUnitId={selectedUnitId}
                onSelect={setSelectedUnitId}
              />
              <UnitTypeBlock
                type="UMBRELLA"
                label="Sombrillas"
                units={umbrellas}
                selectedUnitId={selectedUnitId}
                onSelect={setSelectedUnitId}
              />
              {available.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay unidades disponibles por el momento.</p>
              )}
            </div>
          </section>
        </div>

        {/* Booking sidebar */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-20 p-6">
            <h3 className="text-lg font-bold">Reservá tu lugar</h3>
            {selectedUnit ? (
              <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm">
                <p className="font-semibold text-primary">Unidad seleccionada</p>
                <p className="text-foreground">
                  {selectedUnit.type === "TENT" ? "Carpa" : "Sombrilla"} {selectedUnit.identifier} ·{" "}
                  {formatCurrency(selectedUnit.dailyPrice)} / día
                </p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                {available.length > 0
                  ? "Seleccioná una unidad del listado o reservá y elegí en el siguiente paso."
                  : "Elegí fechas y unidad en el siguiente paso. Pagás online y recibís tu QR."}
              </p>
            )}
            {available.length > 0 && !selectedUnit && (
              <p className="mt-4 text-sm text-muted-foreground">
                Desde{" "}
                <span className="text-xl font-extrabold text-foreground">
                  {formatCurrency(Math.min(...available.map((u) => u.dailyPrice)))}
                </span>{" "}
                / día
              </p>
            )}
            <div className="mt-5">
              {role === "ADMIN" ? (
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  Estás en una cuenta de administrador. Usá el panel para crear reservas presenciales.
                </p>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  disabled={available.length === 0}
                  onClick={handleReserve}
                >
                  {isAuthenticated ? "Reservar ahora" : "Reservar ahora"}
                </Button>
              )}
              {!isAuthenticated && available.length > 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">Te pediremos que ingreses o te registres.</p>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function UnitTypeBlock({
  type,
  label,
  units,
  selectedUnitId,
  onSelect,
}: {
  type: UnitType
  label: string
  units: RentalUnit[]
  selectedUnitId: number | null
  onSelect: (id: number | null) => void
}) {
  if (units.length === 0) return null
  const Icon = type === "TENT" ? Tent : Umbrella
  const minPrice = Math.min(...units.map((u) => u.dailyPrice))

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold">{label}</p>
            <p className="text-sm text-muted-foreground">{units.length} disponibles</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">desde</p>
          <p className="text-lg font-extrabold">{formatCurrency(minPrice)}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {units.map((u) => {
          const isSelected = u.idRentalUnit === selectedUnitId
          return (
            <button
              key={u.idRentalUnit}
              type="button"
              onClick={() => onSelect(isSelected ? null : u.idRentalUnit)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                (isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/60 hover:bg-primary/5")
              }
            >
              {u.identifier} · {formatCurrency(u.dailyPrice)}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
