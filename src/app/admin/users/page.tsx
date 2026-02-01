"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import AppSidebar from "@/components/layout/app-sidebar"
import EditUserModal from "@/components/admin/edit-user-dialog"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { MoreHorizontal, Loader2 } from "lucide-react"

import api from "@/services/api"
import { useAuth } from "@/app/context/auth-context"

/* ================= TYPES ================= */

interface User {
  id: string
  fullname: string
  email: string
  role: string
  department?: string
  user_type: string
  is_active?: boolean
  onboarding_status: string
}

/* ================= PAGE ================= */

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  const [openEdit, setOpenEdit] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login")
      return
    }

    if (!authLoading && user && user.role.name !== "admin") {
      router.replace("/dashboard")
    }
  }, [authLoading, user, router])

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!user || user.role.name !== "admin") return

    Promise.all([
      api.get<User[]>("/users"),
      api.get<User[]>("/admin/users/pending"),
    ])
      .then(([usersRes, pendingRes]) => {
        setUsers(usersRes.data)
        setPendingUsers(pendingRes.data)
      })
      .finally(() => setPageLoading(false))
  }, [user])

  /* ================= ACTIONS ================= */

  async function approveUser(id: string) {
    await api.patch(`/admin/users/${id}/approve`)
    reload()
  }

  async function rejectUser(id: string) {
    await api.patch(`/admin/users/${id}/reject`)
    reload()
  }

  async function reload() {
    const [usersRes, pendingRes] = await Promise.all([
      api.get<User[]>("/users"),
      api.get<User[]>("/admin/users/pending"),
    ])

    setUsers(usersRes.data)
    setPendingUsers(pendingRes.data)
  }

  /* ================= LOADING ================= */

  if (authLoading || pageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!user || user.role.name !== "admin") return null

  /* ================= UI ================= */

  return (
    <>
      <div className="flex min-h-screen">
        <AppSidebar active="admin-users" />

        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Kelola Users</h1>
            <p className="text-muted-foreground">
              Manajemen akun pengguna sistem
            </p>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Semua User</TabsTrigger>
              <TabsTrigger value="pending">
                Pending Approval
              </TabsTrigger>
            </TabsList>

            {/* ================= ALL USERS ================= */}
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.fullname}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{u.department ?? "-"}</TableCell>
                      <TableCell>
                        {u.is_active ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserId(u.id)
                                setOpenEdit(true)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* ================= PENDING USERS ================= */}
            <TabsContent value="pending">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pendingUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.fullname}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{u.department ?? "-"}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => approveUser(u.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectUser(u.id)}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <EditUserModal
        open={openEdit}
        userId={selectedUserId}
        onOpenChange={setOpenEdit}
        onSuccess={reload}
      />
    </>
  )
}
