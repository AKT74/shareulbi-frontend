import api from "./api"
import type { RegisterPayload } from "@/types/register"

export type UserRole = {
  id?: number
  name: "mahasiswa" | "dosen" | "admin"
}

export interface User {
  id: string
  fullname: string
  email: string
  onboarding_status: string
  role: UserRole
  department?: {
    id: string
    name: string
  } | null
}

/**
 * =====================
 * LOGIN RESPONSE
 * =====================
 * ❗ TIDAK ADA TOKEN
 * token disimpan di cookie (httpOnly)
 */
export interface LoginResponse {
  user: User
}

/**
 * =====================
 * LOGIN
 * =====================
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/login",
    { email, password },
    {
      withCredentials: true, // 🔥 WAJIB
    }
  )

  return response.data
}

/**
 * =====================
 * REGISTER
 * =====================
 */
export const register = async (payload: RegisterPayload) => {
  const response = await api.post("/register", payload)
  return response.data
}

/**
 * =====================
 * LOGOUT
 * =====================
 */
export const logout = async () => {
  return api.post("/logout", {}, { withCredentials: true })
}

/**
 * =====================
 * GET CURRENT USER
 * =====================
 */
export const getMe = async (): Promise<User> => {
  const response = await api.get<User>("/me", {
    withCredentials: true,
  })
  return response.data
}
