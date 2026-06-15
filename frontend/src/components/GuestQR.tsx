import { QRCodeSVG } from "qrcode.react"
import { CheckCircle2 } from "lucide-react"
import type { GuestSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

export function GuestQR({ guest, size = 160, className }: { guest: GuestSummary; size?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center", className)}>
      <div className="flex items-center gap-2">
        <p className="font-bold">{guest.fullName}</p>
        {guest.isEntryValidated && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
            <CheckCircle2 className="h-3 w-3" /> Ingresó
          </span>
        )}
      </div>
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG value={guest.qrToken} size={size} level="M" />
      </div>
      <code className="block w-full break-all rounded-md bg-muted px-2 py-1.5 text-[11px] text-muted-foreground">
        {guest.qrToken}
      </code>
    </div>
  )
}
