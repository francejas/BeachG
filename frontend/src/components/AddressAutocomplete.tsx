import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    road?: string
    neighbourhood?: string
  }
}

function formatAddress(r: NominatimResult): string {
  const a = r.address
  const road = [a.road, (r.address as Record<string, string | undefined>)["house_number"]]
    .filter(Boolean).join(" ")
  const city = a.city ?? a.town ?? a.village ?? ""
  const state = a.state ?? ""
  const parts = [road, city, state].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : r.display_name.split(",").slice(0, 3).join(",").trim()
}

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
}

export function AddressAutocomplete({ value, onChange, placeholder = "Ej: Mar del Plata, Buenos Aires", id }: Props) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // sync external value → input (e.g. on form load)
  useEffect(() => {
    setQuery(value)
  }, [value])

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function handleInput(val: string) {
    setQuery(val)
    onChange(val)
    setOpen(true)
    setFetchError(false)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 3) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=6&addressdetails=1&countrycodes=ar`
        const res = await fetch(url, { headers: { "Accept-Language": "es" } })
        const data: NominatimResult[] = await res.json()
        setResults(data)
      } catch {
        setResults([])
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  function select(r: NominatimResult) {
    // Store formatted label (road + city + state) — usable for Google Maps
    const label = formatAddress(r)
    setQuery(label)
    onChange(label)
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">...</span>
        )}
      </div>

      {fetchError && (
        <p className="mt-1 text-xs text-destructive">No se pudo buscar la dirección.</p>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onMouseDown={() => select(r)}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted",
                )}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium">{formatAddress(r)}</span>
                  <span className="block text-xs text-muted-foreground line-clamp-1">{r.display_name}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
