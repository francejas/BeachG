import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth"
import { TOKEN_KEY } from "@/lib/api"

function hasValidTokenInStorage(): boolean {
  const t = localStorage.getItem(TOKEN_KEY)
  if (!t) return false
  try {
    const payload = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    return !payload.exp || Date.now() / 1000 < payload.exp
  } catch {
    return false
  }
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated && !hasValidTokenInStorage()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()
  if (!isAuthenticated && !hasValidTokenInStorage()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (role !== "ADMIN") {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
