"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import AppSidebar from "@/components/layout/app-sidebar"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

import api from "@/services/api"
import { useAuth } from "@/app/context/auth-context"

/* ================= TYPES ================= */

type ActivityLog = {
  id: number
  fullname: string
  action: string
  description: string | null
  created_at: string
}

/* ================= PAGE ================= */

export default function ActivityLogPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ================= AUTH + ROLE GUARD ================= */

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
      return
    }

    if (!loading && user && user.role.name !== "admin") {
      router.replace("/dashboard")
    }
  }, [loading, user, router])

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!user || user.role.name !== "admin") return

    api
      .get<ActivityLog[]>("/users/activity-logs")
      .then((res) => setLogs(res.data))
      .catch(() => setError("Gagal mengambil activity log"))
      .finally(() => setPageLoading(false))
  }, [user])

  /* ================= UI ================= */

  if (loading || pageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!user || user.role.name !== "admin") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">

      <main className="flex-1 p-6">
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {!error && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">No</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        Tidak ada activity
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log, index) => (
                      <TableRow key={log.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {log.fullname}
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          {log.description || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(log.created_at).toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
      </main>
    </div>
  )
}
