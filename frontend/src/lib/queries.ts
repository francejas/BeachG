import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./api"
import type {
  Amenity,
  Booking,
  BookingCreatedResponse,
  Client,
  CreateBookingPayload,
  GuestValidationResponse,
  RentalUnit,
  Resort,
} from "./types"

// ---------- Resorts ----------
export function useResorts() {
  return useQuery({
    queryKey: ["resorts"],
    queryFn: async () => (await api.get<Resort[]>("/api/resorts")).data,
  })
}

export function useResort(id: number | string | undefined) {
  return useQuery({
    queryKey: ["resort", id],
    enabled: id !== undefined && id !== null,
    queryFn: async () => (await api.get<Resort>(`/api/resorts/${id}`)).data,
  })
}

export function useMyResort(enabled = true) {
  return useQuery({
    queryKey: ["my-resort"],
    enabled,
    queryFn: async () => (await api.get<Resort>("/api/resorts/my")).data,
  })
}

export function useUpdateMyResort() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; location: string; coverPhotoUrl: string; description: string; amenityIds: number[] }) =>
      (await api.put("/api/resorts/my", payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-resort"] })
      qc.invalidateQueries({ queryKey: ["resorts"] })
    },
  })
}

// ---------- Amenities ----------
export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: async () => (await api.get<Amenity[]>("/api/amenities")).data,
  })
}

// ---------- Rental Units ----------
export function useRentalUnits() {
  return useQuery({
    queryKey: ["rental-units"],
    queryFn: async () => (await api.get<RentalUnit[]>("/api/rental-units")).data,
  })
}

export function useCreateUnit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      identifier: string
      type: "TENT" | "UMBRELLA"
      dailyPrice: number
      isBlocked: boolean
      resortId: number
    }) => (await api.post<RentalUnit>("/api/rental-units", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rental-units"] }),
  })
}

export function useUpdateUnitPrice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, newPrice }: { id: number; newPrice: number }) =>
      (await api.patch<RentalUnit>(`/api/rental-units/${id}/price`, {}, { params: { newPrice } })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rental-units"] }),
  })
}

export function useUpdateUnitBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isBlocked }: { id: number; isBlocked: boolean }) =>
      (await api.patch<RentalUnit>(`/api/rental-units/${id}/block`, {}, { params: { isBlocked } })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rental-units"] }),
  })
}

// ---------- Bookings ----------
export function useAllBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => (await api.get<Booking[]>("/api/bookings")).data,
  })
}

export function useClientBookings(clientId: number | null) {
  return useQuery({
    queryKey: ["bookings", "client", clientId],
    enabled: clientId !== null,
    queryFn: async () => (await api.get<Booking[]>(`/api/bookings/client/${clientId}`)).data,
  })
}

export function useBooking(id: number | string | undefined) {
  return useQuery({
    queryKey: ["booking", id],
    enabled: id !== undefined,
    queryFn: async () => (await api.get<Booking>(`/api/bookings/${id}`)).data,
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) =>
      (await api.post<BookingCreatedResponse>("/api/bookings", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  })
}

export function useRetryPayment() {
  return useMutation({
    mutationFn: async (id: number) =>
      (await api.post<{ paymentUrl: string }>(`/api/bookings/${id}/pay`)).data,
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => (await api.patch<Booking>(`/api/bookings/${id}/cancel`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  })
}

export function useCreateWalkIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) =>
      (await api.post<{ message: string; booking: Booking }>("/api/bookings/walkin", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  })
}

// ---------- Client profile ----------
export function useClient(id: number | null) {
  return useQuery({
    queryKey: ["client", id],
    enabled: id !== null,
    queryFn: async () => (await api.get<Client>(`/api/clients/${id}`)).data,
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      firstName,
      lastName,
      email,
      phone,
      dni,
      password,
    }: {
      id: number
      firstName: string
      lastName: string
      email: string
      phone: string
      dni?: string
      password?: string
    }) => (await api.put<Client>(`/api/clients/${id}`, { firstName, lastName, email, phone, dni: dni ?? null, password: password ?? null })).data,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["client", vars.id] })
    },
  })
}

// ---------- Guest validation ----------
export async function validateGuest(token: string): Promise<GuestValidationResponse> {
  return (await api.post<GuestValidationResponse>(`/api/guests/validate/${encodeURIComponent(token)}`)).data
}

export async function validateGuestByDni(dni: string): Promise<GuestValidationResponse> {
  return (await api.post<GuestValidationResponse>(`/api/guests/validate/dni/${encodeURIComponent(dni)}`)).data
}
