import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { api, TOKEN_KEY, CLIENT_ID_KEY } from "./api"
import type { AuthResponse } from "./types"

export type Role = "ADMIN" | "USER" | null

interface JwtPayload {
  sub?: string
  roles?: Array<{ authority?: string } | string>
  exp?: number
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1]
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload?.exp) return false
  return Date.now() / 1000 > payload.exp
}

function roleFromToken(token: string | null): Role {
  if (!token) return null
  const payload = decodeJwt(token)
  if (!payload?.roles) return null
  const authorities = payload.roles.map((r) => (typeof r === "string" ? r : r.authority))
  if (authorities.includes("ROLE_ADMIN")) return "ADMIN"
  if (authorities.includes("ROLE_USER")) return "USER"
  return null
}

function emailFromToken(token: string | null): string | null {
  if (!token) return null
  return decodeJwt(token)?.sub ?? null
}

interface AuthContextValue {
  token: string | null
  clientId: number | null
  role: Role
  email: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<Role>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (t && isTokenExpired(t)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(CLIENT_ID_KEY)
      return null
    }
    return t
  })
  const [clientId, setClientId] = useState<number | null>(() => {
    const v = localStorage.getItem(CLIENT_ID_KEY)
    return v ? Number(v) : null
  })

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(CLIENT_ID_KEY, String(data.clientId))
    setToken(data.token)
    setClientId(data.clientId)
    return roleFromToken(data.token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(CLIENT_ID_KEY)
    setToken(null)
    setClientId(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      clientId,
      role: roleFromToken(token),
      email: emailFromToken(token),
      isAuthenticated: Boolean(token) && !isTokenExpired(token!),
      login,
      logout,
    }),
    [token, clientId, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
