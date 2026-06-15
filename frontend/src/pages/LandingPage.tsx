import { Link } from "react-router-dom"
import { ArrowRight, MapPin, QrCode, ShieldCheck, Umbrella, Waves } from "lucide-react"
import { useResorts } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { Button, Card, ErrorState, Loading } from "@/components/ui"
import { amenityIcon, resortCover } from "@/components/resort-helpers"
import type { Resort } from "@/lib/types"

export function LandingPage() {
  const { data: resorts, isLoading, error } = useResorts()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="/images/hero-beach.png"
          alt="Vista aérea de un balneario con carpas y sombrillas frente al mar"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/85 via-accent/55 to-primary/30" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-24 md:py-32">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-card/20 px-3 py-1 text-sm font-medium text-primary-foreground backdrop-blur">
            <Waves className="h-4 w-4" /> Temporada de playa abierta
          </span>
          <h1 className="max-w-2xl text-balance text-4xl font-extrabold leading-tight text-primary-foreground md:text-6xl">
            Tu lugar en la playa, reservado en segundos
          </h1>
          <p className="max-w-xl text-pretty text-lg text-primary-foreground/90">
            Elegí tu balneario favorito, reservá tu carpa o sombrilla, pagá online y entrá con tu código QR. Sin filas,
            sin papeles.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#resorts">
              <Button size="lg">
                Ver balnearios <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Crear mi cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 md:grid-cols-3">
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
      </section>

      {/* Resorts */}
      <section id="resorts" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold">Balnearios disponibles</h2>
            <p className="mt-1 text-muted-foreground">Elegí dónde querés pasar tu día de playa.</p>
          </div>
        </div>

        {isLoading && <Loading label="Cargando balnearios..." />}
        {error && <ErrorState message={getApiErrorMessage(error, "No pudimos cargar los balnearios.")} />}
        {resorts && resorts.length === 0 && (
          <p className="text-muted-foreground">Todavía no hay balnearios publicados.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resorts?.map((resort) => (
            <ResortCard key={resort.idResort} resort={resort} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ResortCard({ resort }: { resort: Resort }) {
  const fromPrice = resort.rentalUnits?.length
    ? Math.min(...resort.rentalUnits.filter((u) => !u.isBlocked).map((u) => u.dailyPrice))
    : null

  return (
    <Link to={`/resorts/${resort.idResort}`} className="group">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-44 overflow-hidden">
          <img
            src={resortCover(resort)}
            alt={resort.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold">{resort.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" /> {resort.location}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {resort.amenities?.slice(0, 4).map((a) => {
              const Icon = amenityIcon(a.name)
              return (
                <span key={a.idAmenity} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                  <Icon className="h-3.5 w-3.5" /> {a.name}
                </span>
              )
            })}
          </div>
          {fromPrice !== null && (
            <p className="mt-4 text-sm text-muted-foreground">
              Desde <span className="text-base font-bold text-foreground">${fromPrice.toLocaleString("es-AR")}</span> / día
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
