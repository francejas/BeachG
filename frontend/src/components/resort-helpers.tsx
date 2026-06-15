import {
  Baby,
  Car,
  GlassWater,
  ShowerHead,
  Sparkles,
  Utensils,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react"
import type { Resort } from "@/lib/types"

const FALLBACK_IMAGES = ["/images/resort-mdp.png", "/images/resort-pinamar.png"]

/** Returns a usable cover image, falling back to a local asset when the
 *  backend stores a placeholder/invalid URL (e.g. seed "imagenes.com" links). */
export function resortCover(resort: Pick<Resort, "idResort" | "coverPhotoUrl">): string {
  const url = resort.coverPhotoUrl
  const isUsable = url && /^https?:\/\//.test(url) && !url.includes("imagenes.com")
  if (isUsable) return url
  return FALLBACK_IMAGES[(resort.idResort - 1) % FALLBACK_IMAGES.length]
}

const AMENITY_ICONS: { test: RegExp; icon: LucideIcon }[] = [
  { test: /wifi/i, icon: Wifi },
  { test: /pileta|piscina|pool/i, icon: Waves },
  { test: /estacion|parking/i, icon: Car },
  { test: /restaurante|comida|food/i, icon: Utensils },
  { test: /infant|niñ|kids|recrea/i, icon: Baby },
  { test: /spa/i, icon: Sparkles },
  { test: /trago|bar|cocktail/i, icon: GlassWater },
  { test: /ducha|shower/i, icon: ShowerHead },
]

export function amenityIcon(name: string): LucideIcon {
  return AMENITY_ICONS.find((a) => a.test.test(name))?.icon ?? Sparkles
}
