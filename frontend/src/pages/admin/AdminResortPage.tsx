import { useEffect, useState } from "react"
import { Check, MapPin, Save } from "lucide-react"
import { useAmenities, useMyResort, useUpdateMyResort } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import { amenityIcon, resortCover } from "@/components/resort-helpers"
import { Button, Card, CardBody, ErrorState, Input, Label, Loading } from "@/components/ui"
import { cn } from "@/lib/utils"

export default function AdminResortPage() {
  const { data: resort, isLoading, isError } = useMyResort()
  const { data: amenities } = useAmenities()
  const updateResort = useUpdateMyResort()

  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("")
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  useEffect(() => {
    if (resort) {
      setName(resort.name)
      setLocation(resort.location)
      setCoverPhotoUrl(resort.coverPhotoUrl ?? "")
      setSelectedAmenities(resort.amenities.map((a) => a.idAmenity))
    }
  }, [resort])

  if (isLoading) return <Loading label="Cargando tu balneario..." />
  if (isError || !resort) return <ErrorState message="No pudimos cargar tu balneario." />

  function toggleAmenity(id: number) {
    setSelectedAmenities((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    try {
      await updateResort.mutateAsync({ name, location, coverPhotoUrl, amenityIds: selectedAmenities })
      setFeedback({ type: "success", msg: "Cambios guardados correctamente." })
    } catch (err) {
      setFeedback({ type: "error", msg: getApiErrorMessage(err) })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi balneario</h1>
        <p className="text-sm text-muted-foreground">Editá la información que ven tus clientes.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <form onSubmit={handleSave}>
            <CardBody className="space-y-5">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="cover">URL de foto de portada</Label>
                <Input
                  id="cover"
                  value={coverPhotoUrl}
                  onChange={(e) => setCoverPhotoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Servicios</Label>
                <div className="flex flex-wrap gap-2">
                  {amenities?.map((a) => {
                    const Icon = amenityIcon(a.name)
                    const active = selectedAmenities.includes(a.idAmenity)
                    return (
                      <button
                        key={a.idAmenity}
                        type="button"
                        onClick={() => toggleAmenity(a.idAmenity)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {a.name}
                        {active && <Check className="h-3.5 w-3.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {feedback && (
                <p
                  className={cn(
                    "text-sm font-medium",
                    feedback.type === "success" ? "text-success" : "text-destructive",
                  )}
                >
                  {feedback.msg}
                </p>
              )}

              <Button type="submit" loading={updateResort.isPending}>
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </CardBody>
          </form>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Vista previa</p>
          <Card className="overflow-hidden">
            <img
              src={resortCover({ idResort: resort.idResort, coverPhotoUrl })}
              alt={name}
              className="h-40 w-full object-cover"
            />
            <CardBody className="space-y-1">
              <h3 className="font-bold text-foreground">{name || "Nombre del balneario"}</h3>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {location || "Ubicación"}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
