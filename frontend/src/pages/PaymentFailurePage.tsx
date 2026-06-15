import { Link } from "react-router-dom"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui"

export function PaymentFailurePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
        <XCircle className="h-10 w-10" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">Pago rechazado</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        El pago no pudo procesarse. Por favor, intentá nuevamente con otro método de pago.
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
