"use client"

import { useEffect } from "react"
import { useAdminStore } from "@/store/admin.store"
import Sidebar from "@/components/layout/app-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fetchPendingUserCount = useAdminStore(
    (state) => state.fetchPendingUserCount
  )

  useEffect(() => {
    fetchPendingUserCount()
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
