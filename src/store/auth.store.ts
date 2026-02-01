import { create } from "zustand"
import { login as loginService } from "@/services/auth.service"
import type { User } from "@/services/auth.service"

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  login: (
    email: string,
    password: string
  ) => Promise<{
    role: string
    onboarding_status: string
  }>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  /* ================= SET USER ================= */
  setUser: (user) => {
    set({ user })

    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  },

  /* ================= LOGIN ================= */
  login: async (email, password) => {
    /**
     * 🔐 LOGIN VIA COOKIE
     * token disimpan di httpOnly cookie (backend)
     */
    const data = await loginService(email, password)

    // simpan user saja (BUKAN TOKEN)
    localStorage.setItem("user", JSON.stringify(data.user))
    set({ user: data.user })

    return {
      role: data.user.role.name,
      onboarding_status: data.user.onboarding_status,
    }
  },

  /* ================= LOGOUT ================= */
  logout: () => {
    localStorage.removeItem("user")
    set({ user: null })
  },
}))
