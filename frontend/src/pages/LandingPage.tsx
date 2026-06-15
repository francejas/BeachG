import { useState } from "react"
import { Link } from "react-router-dom"
import { MapPin, QrCode, Search, ShieldCheck, Umbrella, Waves } from "lucide-react"
import { useResorts } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Button, Card, ErrorState, Loading } from "@/components/ui"
import { amenityIcon, resortCover } from "@/components/resort-helpers"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"
import type { Resort } from "@/lib/types"

export function LandingPage() {
  const { data: resorts, isLoading, error } = useResorts()
  const { isAuthenticated } = useAuth()

  const [searchCity, setSearchCity] = useState("")
  const [searchName, setSearchName] = useState("")
  const [applied, setApplied] = useState({ city: "", name: "" })

  function handleSearch() {
    setApplied({ city: searchCity.trim(), name: searchName.trim() })
  }

  function handleClear() {
    setSearchCity("")
    setSearchName("")
    setApplied({ city: "", name: "" })
  }

  const hasFilters = applied.city || applied.name

  const filtered = resorts?.filter((r) => {
    const cityKey = applied.city.split(",")[0].trim().toLowerCase()
    const matchesCity = !applied.city || r.location.toLowerCase().includes(cityKey)
    const matchesName = !applied.name || r.name.toLowerCase().includes(applied.name.toLowerCase())
    return matchesCity && matchesName
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="/images/hero-beach.png"
          alt="Vista aérea de un balneario con carpas y sombrillas frente al mar"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Layered gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/92 via-accent/65 to-primary/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 md:py-16">
          <span className="animate-fade-in inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-semibold text-white">
            <Waves className="h-4 w-4" /> Temporada de playa abierta
          </span>
          <h1 className="animate-slide-up max-w-2xl text-balance text-4xl font-extrabold leading-tight text-white md:text-6xl" style={{ animationDelay: "80ms" }}>
            Tu lugar en la playa, reservado en segundos
          </h1>
          <p className="animate-slide-up max-w-lg text-pretty text-base text-white/85 md:text-lg" style={{ animationDelay: "160ms" }}>
            Elegí tu balneario, reservá tu carpa o sombrilla, pagá online y entrá con tu código QR.
          </p>
          <div className="animate-slide-up flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <a href="#search">
              <Button size="lg" className="shadow-lg shadow-primary/30">Ver balnearios</Button>
            </a>
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="lg" variant="secondary" className="bg-white/90 text-accent hover:bg-white">
                  Crear mi cuenta
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Search */}
      <section id="search" className="scroll-mt-20 bg-muted/40 py-8">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-5 text-center text-2xl font-extrabold">Encontrá tu balneario ideal</h2>
          <Card className="p-5">
            <div className="flex flex-wrap items-end justify-center gap-3">
              <div className="w-full space-y-1 sm:w-56">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ciudad</label>
                <AddressAutocomplete
                  value={searchCity}
                  onChange={setSearchCity}
                  placeholder="Ej: Mar del Plata"
                />
              </div>
              <div className="w-full space-y-1 sm:w-56">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Balneario</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nombre del balneario"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
                {hasFilters && (
                  <Button variant="outline" onClick={handleClear}>
                    Limpiar
                  </Button>
                )}
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" /> Buscar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Resort results */}
      <section id="resorts" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold">
            {hasFilters ? "Resultados de búsqueda" : "Todos los balnearios"}
          </h2>
          {hasFilters && filtered && (
            <p className="mt-1 text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "balneario encontrado" : "balnearios encontrados"}
            </p>
          )}
        </div>

        {isLoading && <Loading label="Cargando balnearios..." />}
        {error && <ErrorState message={getApiErrorMessage(error, "No pudimos cargar los balnearios.")} />}
        {filtered && filtered.length === 0 && !isLoading && (
          <p className="text-muted-foreground">
            {resorts?.length === 0
              ? "Todavía no hay balnearios publicados."
              : "No encontramos balnearios con esos criterios."}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((resort) => (
            <ResortCard key={resort.idResort} resort={resort} />
          ))}
        </div>
      </section>

      {/* Features — bottom */}
      <section className="bg-muted/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-2xl font-extrabold">¿Por qué usar BeachG?</h2>
          <div className="grid gap-4 md:grid-cols-3 stagger">
            {[
              { icon: Umbrella, title: "Carpas y sombrillas", desc: "Reservá la unidad exacta que querés, por los días que necesites." },
              { icon: ShieldCheck, title: "Pago seguro", desc: "Pagá con Mercado Pago. Tu reserva queda confirmada al instante." },
              { icon: QrCode, title: "Ingreso con QR", desc: "Cada huésped recibe su código QR para validar el ingreso." },
            ].map((f) => (
              <Card key={f.title} className="p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ResortCard({ resort }: { resort: Resort }) {
  const uniqueAmenities = resort.amenities
    ? [...new Map(resort.amenities.map((a) => [a.idAmenity, a])).values()]
    : []

  return (
    <Link to={`/resorts/${resort.idResort}`} className="group">
      <Card className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
        <div className="relative h-44 overflow-hidden">
          <img
            src={resortCover(resort)}
            alt={resort.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold">{resort.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" /> {resort.location}
          </p>
          {uniqueAmenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {uniqueAmenities.slice(0, 4).map((a) => {
                const Icon = amenityIcon(a.name)
                return (
                  <span
                    key={a.idAmenity}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" /> {a.name}
                  </span>
                )
              })}
              {uniqueAmenities.length > 4 && (
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                  +{uniqueAmenities.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
