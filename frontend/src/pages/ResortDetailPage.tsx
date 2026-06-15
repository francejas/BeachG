import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ExternalLink, MapPin, Tent, Umbrella } from "lucide-react"
import { useResort } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Button, Card, ErrorState, Loading } from "@/components/ui"
import { amenityIcon, resortCover } from "@/components/resort-helpers"
import { cn, formatCurrency } from "@/lib/utils"
import type { RentalUnit } from "@/lib/types"

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

  const allUnits = resort.rentalUnits ?? []
  const available = allUnits.filter((u) => !u.isBlocked)

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
      {/* Cover */}
      <div className="relative h-64 md:h-80">
        <img src={resortCover(resort)} alt={resort.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-6">
          <Link to="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <h1 className="text-3xl font-extrabold text-white md:text-4xl">{resort.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-1.5 text-white/90">
              <MapPin className="h-4 w-4" /> {resort.location}
            </p>
            {resort.location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resort.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur hover:bg-white/30"
              >
                <ExternalLink className="h-3 w-3" /> Ver en Maps
              </a>
            )}
          </div>
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

          {/* Beach map */}
          <section>
            <h2 className="mb-1 text-xl font-bold">Mapa del balneario</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Tocá una unidad disponible para seleccionarla. Las sombrillas están más cerca del mar.
            </p>

            {allUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay unidades registradas.</p>
            ) : (
              <>
                <BeachMap
                  allUnits={allUnits}
                  selectedUnitId={selectedUnitId}
                  onSelect={setSelectedUnitId}
                />
                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-sky-300 bg-sky-50">
                      <Umbrella className="h-2.5 w-2.5 text-sky-500" />
                    </span>
                    Sombrilla libre
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-amber-300 bg-amber-50">
                      <Tent className="h-2.5 w-2.5 text-amber-600" />
                    </span>
                    Carpa libre
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded border-2 border-gray-200 bg-gray-100" />
                    No disponible
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded border-2 border-primary bg-primary" />
                    Seleccionada
                  </span>
                </div>
              </>
            )}
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
                  ? "Seleccioná una unidad del mapa o reservá y elegí en el siguiente paso."
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
                <Button size="lg" className="w-full" disabled={available.length === 0} onClick={handleReserve}>
                  Reservar ahora
                </Button>
              )}
              {!isAuthenticated && available.length > 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Te pediremos que ingreses o te registres.
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

// ── Beach Map ──────────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

function BeachMap({
  allUnits,
  selectedUnitId,
  onSelect,
}: {
  allUnits: RentalUnit[]
  selectedUnitId: number | null
  onSelect: (id: number | null) => void
}) {
  const umbrellas = allUnits.filter((u) => u.type === "UMBRELLA")
  const tents = allUnits.filter((u) => u.type === "TENT")

  // Dynamic column count: aim for 2–5 rows per type
  const maxCount = Math.max(umbrellas.length, tents.length, 1)
  const COLS = maxCount <= 8 ? 4 : maxCount <= 20 ? 6 : maxCount <= 40 ? 8 : 10

  const umbrellaRows = chunkArray(umbrellas, COLS)
  const tentRows = chunkArray(tents, COLS)

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
      {/* Sea */}
      <div className="relative bg-gradient-to-b from-blue-700 via-blue-500 to-sky-400 py-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <WaveIcon className="h-5 w-5 text-white/70" />
          <span className="text-sm font-bold uppercase tracking-widest text-white">Mar</span>
          <WaveIcon className="h-5 w-5 text-white/70" />
        </div>
        {/* Wave edge */}
        <svg
          className="absolute -bottom-px left-0 w-full"
          viewBox="0 0 600 18"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,9 Q75,0 150,9 T300,9 T450,9 T600,9 L600,18 L0,18 Z"
            fill="hsl(39,33%,98%)"
          />
        </svg>
      </div>

      {/* Beach content */}
      <div
        className="px-4 py-5"
        style={{ background: "linear-gradient(to bottom, hsl(39,60%,97%), hsl(39,40%,93%))" }}
      >
        {/* Umbrellas */}
        {umbrellaRows.length > 0 && (
          <div className="space-y-2">
            <SectionLabel icon={<Umbrella className="h-3 w-3" />} label="Sombrillas" color="text-sky-600" />
            {umbrellaRows.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-3">
                {row.map((unit) => (
                  <UnitCell
                    key={unit.idRentalUnit}
                    unit={unit}
                    isSelected={unit.idRentalUnit === selectedUnitId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Walkway divider */}
        {umbrellaRows.length > 0 && tentRows.length > 0 && (
          <div className="my-4 flex items-center gap-3">
            <div className="h-0.5 flex-1 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-600">
              Paseo peatonal
            </span>
            <div className="h-0.5 flex-1 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
          </div>
        )}

        {/* Tents */}
        {tentRows.length > 0 && (
          <div className="space-y-2">
            <SectionLabel icon={<Tent className="h-3 w-3" />} label="Carpas" color="text-amber-700" />
            {tentRows.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-3">
                {row.map((unit) => (
                  <UnitCell
                    key={unit.idRentalUnit}
                    unit={unit}
                    isSelected={unit.idRentalUnit === selectedUnitId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

function SectionLabel({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className={cn("mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest", color)}>
      {icon} {label}
    </div>
  )
}

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 12" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0,6 Q3,0 6,6 T12,6 T18,6 T24,6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function UnitCell({
  unit,
  isSelected,
  onSelect,
}: {
  unit: RentalUnit
  isSelected: boolean
  onSelect: (id: number | null) => void
}) {
  const blocked = unit.isBlocked
  const isUmbrella = unit.type === "UMBRELLA"

  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => onSelect(isSelected ? null : unit.idRentalUnit)}
      title={blocked ? "No disponible" : `${isUmbrella ? "Sombrilla" : "Carpa"} ${unit.identifier} · ${formatCurrency(unit.dailyPrice)}/día`}
      className={cn(
        "flex w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 px-2 text-center transition-all duration-150",
        blocked && "cursor-not-allowed border-gray-200 bg-gray-100 opacity-40",
        isSelected &&
          "scale-[1.06] border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30",
        !blocked &&
          !isSelected &&
          isUmbrella &&
          "cursor-pointer border-sky-200 bg-sky-50 text-sky-800 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-100 hover:shadow-md",
        !blocked &&
          !isSelected &&
          !isUmbrella &&
          "cursor-pointer border-amber-200 bg-amber-50 text-amber-800 hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-100 hover:shadow-md",
      )}
    >
      {/* Icon */}
      {isUmbrella ? (
        <Umbrella className={cn("h-5 w-5 shrink-0", isSelected ? "text-white" : "text-sky-500", blocked && "text-gray-400")} />
      ) : (
        <Tent className={cn("h-5 w-5 shrink-0", isSelected ? "text-white" : "text-amber-600", blocked && "text-gray-400")} />
      )}
      {/* Identifier */}
      <span className="text-xs font-bold leading-tight">{unit.identifier}</span>
      {/* Price */}
      {!blocked && (
        <span className={cn("text-[11px] font-semibold leading-none", isSelected ? "text-white/90" : "opacity-80")}>
          {formatCurrency(unit.dailyPrice)}
        </span>
      )}
      {blocked && <span className="text-[10px] leading-none text-gray-400">ocupada</span>}
    </button>
  )
}
