"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import AppSidebar from "@/components/layout/app-sidebar"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { MoreHorizontal, Plus, Loader2 } from "lucide-react"

import api from "@/services/api"
import { useAuth } from "@/app/context/auth-context"

/* ================= TYPES ================= */

type ReportStatus = "pending" | "reviewed" | "resolved" | "rejected"

interface ReportItem {
  id: string
  description: string
  status: ReportStatus
  created_at: string
  reporter: string
  topic: string
  post_title: string | null
}

interface Topic {
  id: string
  name: string
  is_active: boolean
}

/* ================= PAGE ================= */

export default function AdminReportsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [reports, setReports] = useState<ReportItem[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  // topic modal state
  const [openTopicModal, setOpenTopicModal] = useState(false)
  const [editTopicId, setEditTopicId] = useState<string | null>(null)
  const [topicName, setTopicName] = useState("")
  const [topicActive, setTopicActive] = useState(true)

  /* ================= AUTH + ROLE GUARD ================= */

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
      api.get<ReportItem[]>("/reports-feedbacks"),
      api.get<Topic[]>("/feedback-topics"),
    ])
      .then(([reportsRes, topicsRes]) => {
        setReports(reportsRes.data)
        setTopics(topicsRes.data)
      })
      .finally(() => setPageLoading(false))
  }, [user])

  /* ================= UPDATE REPORT STATUS ================= */

  async function updateReportStatus(
    id: string,
    status: ReportStatus
  ) {
    try {
      await api.put(`/reports-feedbacks/${id}/status`, {
        status,
      })

      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status } : r
        )
      )
    } catch {
      alert("Gagal update status")
    }
  }

  /* ================= TOPIC SAVE ================= */

  async function saveTopic() {
    const isEdit = editTopicId !== null

    try {
      if (isEdit) {
        await api.put(`/feedback-topics/${editTopicId}`, {
          name: topicName,
          is_active: topicActive,
        })
      } else {
        await api.post("/feedback-topics", {
          name: topicName,
          is_active: topicActive,
        })
      }

      resetTopicForm()
      reloadTopics()
    } catch {
      alert("Gagal menyimpan topic")
    }
  }

  /* ================= DELETE TOPIC ================= */

  async function deleteTopic(id: string) {
    if (!confirm("Yakin ingin menghapus topic ini?")) return

    try {
      await api.delete(`/feedback-topics/${id}`)
      setTopics((prev) => prev.filter((t) => t.id !== id))
    } catch {
      alert("Gagal menghapus topic")
    }
  }

  async function reloadTopics() {
    const res = await api.get<Topic[]>("/feedback-topics")
    setTopics(res.data)
  }

  function resetTopicForm() {
    setOpenTopicModal(false)
    setEditTopicId(null)
    setTopicName("")
    setTopicActive(true)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
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
    <div className="flex min-h-screen">

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Reports & Feedbacks
          </h1>
          <p className="text-muted-foreground">
            Kelola laporan, feedback, dan topic
          </p>
        </div>

        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">
              Reports & Feedbacks
            </TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
          </TabsList>

          {/* ================= REPORTS ================= */}
          <TabsContent value="reports">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-xs truncate">
                      {r.description}
                    </TableCell>
                    <TableCell>{r.topic}</TableCell>
                    <TableCell>{r.reporter}</TableCell>
                    <TableCell className="capitalize">
                      {r.status}
                    </TableCell>
                    <TableCell>
                      {formatDate(r.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(
                            [
                              "pending",
                              "reviewed",
                              "resolved",
                              "rejected",
                            ] as ReportStatus[]
                          )
                            .filter((s) => s !== r.status)
                            .map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() =>
                                  updateReportStatus(r.id, s)
                                }
                              >
                                Set {s}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {reports.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Tidak ada laporan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* ================= TOPICS ================= */}
          <TabsContent value="topics">
            <div className="flex justify-end mb-3">
              <Button
                onClick={() => {
                  resetTopicForm()
                  setOpenTopicModal(true)
                }}
              >
                <Plus size={16} /> Tambah Topic
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {topics.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>
                      {t.is_active ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditTopicId(t.id)
                              setTopicName(t.name)
                              setTopicActive(t.is_active)
                              setOpenTopicModal(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteTopic(t.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {topics.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      Tidak ada topic
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </main>

      {/* ================= TOPIC MODAL ================= */}
      <Dialog open={openTopicModal} onOpenChange={setOpenTopicModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTopicId ? "Edit" : "Tambah"} Topic
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nama Topic</Label>
              <Input
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Aktif</Label>
              <Switch
                checked={topicActive}
                onCheckedChange={setTopicActive}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpenTopicModal(false)}
              >
                Batal
              </Button>
              <Button onClick={saveTopic}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
