import axios from "axios"

export const TOKEN_KEY = "beachg_token"
export const CLIENT_ID_KEY = "beachg_client_id"

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:8080").trim().replace(/\/$/, "")

export const api = axios.create({
  baseURL,
  headers: {
    // Evita la pantalla de advertencia de ngrok que devuelve HTML en vez de JSON
    "ngrok-skip-browser-warning": "true",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(CLIENT_ID_KEY)
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = "Algo salió mal. Intentá de nuevo."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | string | undefined
    if (typeof data === "string" && data.trim()) return data
    if (data && typeof data === "object") {
      if (data.message) return data.message
      if (data.error) return data.error
    }
    if (error.message) return error.message
  }
  return fallback
}
