import { useCallback, useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { CheckCircle2, Keyboard, QrCode, RotateCcw, ScanLine, XCircle } from "lucide-react"
import { validateGuest } from "@/lib/queries"
import { getApiErrorMessage } from "@/lib/api"
import type { GuestValidationResponse } from "@/lib/types"
import { Button, Card, CardBody, Input, Label } from "@/components/ui"
import { cn } from "@/lib/utils"

type Result =
  | { type: "success"; data: GuestValidationResponse }
  | { type: "error"; message: string }

const SCANNER_ID = "qr-scanner-region"

export default function AdminValidatePage() {
  const [mode, setMode] = useState<"scan" | "manual">("scan")
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualToken, setManualToken] = useState("")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const busyRef = useRef(false)

  const submitToken = useCallback(async (token: string) => {
    if (!token.trim()) return
    setLoading(true)
    try {
      const data = await validateGuest(token.trim())
      setResult({ type: "success", data })
    } catch (err) {
      setResult({ type: "error", message: getApiErrorMessage(err, "Token inválido o ya utilizado.") })
    } finally {
      setLoading(false)
    }
  }, [])

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current
    if (scanner) {
      try {
        if (scanner.isScanning) await scanner.stop()
        scanner.clear()
      } catch {
        /* ignore */
      }
      scannerRef.current = null
    }
    setScanning(false)
  }, [])

  const startScanner = useCallback(async () => {
    setResult(null)
    setScanning(true)
    busyRef.current = false
    // wait for the DOM node to mount
    await new Promise((r) => setTimeout(r, 50))
    try {
      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded) => {
          if (busyRef.current) return
          busyRef.current = true
          await stopScanner()
          // decoded may be a URL containing the token or the raw token
          const token = decoded.includes("/") ? decoded.split("/").filter(Boolean).pop()! : decoded
          await submitToken(token)
        },
        () => {
          /* per-frame decode errors ignored */
        },
      )
    } catch (err) {
      setResult({ type: "error", message: getApiErrorMessage(err, "No pudimos acceder a la cámara.") })
      setScanning(false)
    }
  }, [stopScanner, submitToken])

  useEffect(() => {
    return () => {
      void stopScanner()
    }
  }, [stopScanner])

  function reset() {
    setResult(null)
    setManualToken("")
    if (mode === "scan") void startScanner()
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Validar ingreso</h1>
        <p className="text-sm text-muted-foreground">Escaneá el QR del huésped para confirmar su entrada.</p>
      </div>

      <div className="flex rounded-lg border border-border bg-card p-1">
        <button
          onClick={() => {
            setMode("scan")
            setResult(null)
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-colors",
            mode === "scan" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
          )}
        >
          <QrCode className="h-4 w-4" />
          Escanear
        </button>
        <button
          onClick={() => {
            setMode("manual")
            void stopScanner()
            setResult(null)
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-colors",
            mode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
          )}
        >
          <Keyboard className="h-4 w-4" />
          Manual
        </button>
      </div>

      {result ? (
        <ResultCard result={result} onReset={reset} />
      ) : mode === "scan" ? (
        <Card className="overflow-hidden">
          <CardBody className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-foreground/5">
              <div id={SCANNER_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <ScanLine className="h-10 w-10" />
                  <p className="text-sm">Presioná para activar la cámara</p>
                </div>
              )}
            </div>
            {scanning ? (
              <Button variant="outline" className="w-full" onClick={() => void stopScanner()}>
                Detener
              </Button>
            ) : (
              <Button className="w-full" onClick={() => void startScanner()} loading={loading}>
                <ScanLine className="h-4 w-4" />
                Activar cámara
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="token">Token del QR</Label>
              <Input
                id="token"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Pegá o escribí el token"
              />
            </div>
            <Button className="w-full" loading={loading} onClick={() => void submitToken(manualToken)}>
              Validar
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function ResultCard({ result, onReset }: { result: Result; onReset: () => void }) {
  const success = result.type === "success"
  return (
    <Card className={cn("border-2", success ? "border-success" : "border-destructive")}>
      <CardBody className="flex flex-col items-center gap-4 py-8 text-center">
        {success ? (
          <CheckCircle2 className="h-16 w-16 text-success" />
        ) : (
          <XCircle className="h-16 w-16 text-destructive" />
        )}
        {success ? (
          <div className="space-y-1">
            <p className="text-lg font-bold text-foreground">{result.data.fullName}</p>
            <p className="text-sm text-muted-foreground">Unidad {result.data.rentalUnitIdentifier}</p>
            <p className="pt-2 font-semibold text-success">{result.data.message}</p>
          </div>
        ) : (
          <p className="font-semibold text-destructive">{result.message}</p>
        )}
        <Button variant="outline" className="w-full" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Escanear otro
        </Button>
      </CardBody>
    </Card>
  )
}
