"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import AppSidebar from "@/components/layout/app-sidebar"

interface StoredUser {
  onboarding_status: string
  role?: {
    name: string
  }
}

function isAdminAllowed() {
  if (typeof window === "undefined") return false

  const token = localStorage.getItem("token")
  const userStr = localStorage.getItem("user")

  if (!token || !userStr) return false

  try {
    const user: StoredUser = JSON.parse(userStr)

    if (user.onboarding_status !== "approved") return false
    if (user.role?.name !== "admin") return false

    return true
  } catch {
    return false
  }
}

export default function AdminPage() {
  const router = useRouter()
  const allowed = isAdminAllowed()

  // 🔐 REDIRECT SIDE EFFECT ONLY
  useEffect(() => {
    if (!allowed) {
      const userStr = localStorage.getItem("user")

      if (!userStr) {
        router.replace("/login")
        return
      }

      try {
        const user: StoredUser = JSON.parse(userStr)

        if (user.onboarding_status !== "approved") {
          router.replace("/onboarding")
        } else {
          router.replace("/dashboard")
        }
      } catch {
        localStorage.clear()
        router.replace("/login")
      }
    }
  }, [allowed, router])

  // ⛔ BLOCK RENDER
  if (!allowed) return null

  // ✅ ADMIN PAGE
  return (
    <div className="flex min-h-screen">
      <AppSidebar active="dashboard" />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Panel kontrol khusus administrator
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-semibold">—</p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Posts</p>
            <p className="text-2xl font-semibold">—</p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Reports & Feedback
            </p>
            <p className="text-2xl font-semibold">—</p>
          </div>
        </div>

        <div className="border rounded-lg p-6 text-muted-foreground">
          Pilih menu di sidebar untuk mulai mengelola sistem.
        </div>
      </main>
    </div>
  )
}
