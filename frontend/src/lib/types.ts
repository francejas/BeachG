export type UnitType = "TENT" | "UMBRELLA"
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELED"

export interface Amenity {
  idAmenity: number
  name: string
}

export interface RentalUnit {
  idRentalUnit: number
  type: UnitType
  identifier: string
  dailyPrice: number
  isBlocked: boolean
}

export interface Resort {
  idResort: number
  name: string
  location: string
  adminEmail: string
  coverPhotoUrl: string
  amenities: Amenity[]
  rentalUnits: RentalUnit[]
}

export interface GuestSummary {
  idGuest: number
  fullName: string
  isEntryValidated: boolean
  qrToken: string
}

export interface Booking {
  id: number
  startDate: string
  endDate: string
  totalPrice: number
  status: BookingStatus
  createdAt: string
  idClient: number
  rentalUnitId: number
  guests: GuestSummary[]
  walkInName?: string | null
  walkInDni?: string | null
}

export interface BookingSummary {
  idBooking: number
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  rentalUnitIdentifier: string
}

export interface Client {
  idClient: number
  firstName: string
  lastName: string
  email: string
  phone: string
  bookings: BookingSummary[]
}

export interface AuthResponse {
  token: string
  clientId: number
}

export interface GuestValidationResponse {
  idGuest: number
  fullName: string
  rentalUnitIdentifier: string
  message: string
}

export interface CreateBookingPayload {
  startDate: string
  endDate: string
  clientId: number
  rentalUnitId: number
  guestNames: string[]
  walkInName?: string
  walkInDni?: string
  isWalkIn?: boolean
}

export interface BookingCreatedResponse {
  booking: Booking
  paymentUrl: string
}
