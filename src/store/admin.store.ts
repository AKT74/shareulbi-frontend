import { create } from "zustand"
import { getPendingUserCount } from "@/services/admin.service"

interface AdminState {
  pendingUserCount: number
  fetchPendingUserCount: () => Promise<void>
}

export const useAdminStore = create<AdminState>((set) => ({
  pendingUserCount: 0,

  fetchPendingUserCount: async () => {
    try {
      const data = await getPendingUserCount()
      set({ pendingUserCount: data.count })
    } catch (err) {
      set({ pendingUserCount: 0 })
    }
  }
}))
