import { Routes, Route, Navigate } from "react-router-dom"
import { PublicLayout } from "@/components/Layout"
import { AdminLayout } from "@/components/AdminLayout"
import { RequireAuth, RequireAdmin } from "@/components/guards"

import { LandingPage } from "@/pages/LandingPage"
import { ResortDetailPage } from "@/pages/ResortDetailPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { BookingPage } from "@/pages/BookingPage"
import { MyBookingsPage } from "@/pages/MyBookingsPage"
import { BookingDetailPage } from "@/pages/BookingDetailPage"
import { PaymentSuccessPage } from "@/pages/PaymentSuccessPage"
import AdminValidatePage from "@/pages/admin/AdminValidatePage"

import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage"
import AdminResortPage from "@/pages/admin/AdminResortPage"
import AdminUnitsPage from "@/pages/admin/AdminUnitsPage"
import AdminWalkInPage from "@/pages/admin/AdminWalkInPage"
import AdminBookingsPage from "@/pages/admin/AdminBookingsPage"

export default function App() {
  return (
    <Routes>
      {/* Standalone full-screen routes */}
      <Route
        path="/validate"
        element={
          <RequireAdmin>
            <AdminValidatePage />
          </RequireAdmin>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public + client routes with shared chrome */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/resorts/:id" element={<ResortDetailPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route
          path="/book/:resortId"
          element={
            <RequireAuth>
              <BookingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <RequireAuth>
              <MyBookingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <RequireAuth>
              <BookingDetailPage />
            </RequireAuth>
          }
        />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/resort" element={<AdminResortPage />} />
        <Route path="/admin/units" element={<AdminUnitsPage />} />
        <Route path="/admin/walkin" element={<AdminWalkInPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
