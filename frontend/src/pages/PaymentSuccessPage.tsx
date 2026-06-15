import { Link } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { Button, Card } from "@/components/ui"

export function PaymentSuccessPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <Card className="w-full p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-extrabold">¡Pago confirmado!</h1>
        <p className="mt-2 text-muted-foreground">
          Tu reserva quedó confirmada. Ya podés ver tus códigos QR de ingreso desde tu lista de reservas.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/my-bookings">
            <Button size="lg" className="w-full sm:w-auto">
              Ver mis reservas
            </Button>
          </Link>
          <Link to="/">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
