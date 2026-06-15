import { Link } from "react-router-dom"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui"

export function PaymentPendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
        <Clock className="h-10 w-10" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">Pago pendiente</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Tu pago está siendo procesado. Te avisaremos cuando se acredite. Podés verificar el estado desde tus reservas.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/my-bookings">
          <Button size="lg">Ver mis reservas</Button>
        </Link>
        <Link to="/">
          <Button size="lg" variant="outline">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  )
}
