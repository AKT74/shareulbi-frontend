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
import { Checkbox } from "@/components/ui/checkbox"

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

interface Department {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
  is_related_to_campus: boolean
  departments: Department[]
}

/* ================= PAGE ================= */

export default function AdminCategoryDepartmentPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  // modal state
  const [openModal, setOpenModal] = useState(false)
  const [mode, setMode] = useState<"category" | "department">("category")
  const [editId, setEditId] = useState<number | null>(null)

  // form fields
  const [name, setName] = useState("")
  const [isRelated, setIsRelated] = useState(true)
  const [departmentIds, setDepartmentIds] = useState<number[]>([])

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

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!user || user.role.name !== "admin") return

    Promise.all([
      api.get<Category[]>("/categories"),
      api.get<Department[]>("/departments"),
    ])
      .then(([catRes, depRes]) => {
        setCategories(catRes.data)
        setDepartments(depRes.data)
      })
      .finally(() => setPageLoading(false))
  }, [user])

  /* ================= SAVE ================= */

  async function handleSave() {
    const isEdit = editId !== null

    const url =
      mode === "category"
        ? `/categories${isEdit ? `/${editId}` : ""}`
        : `/departments${isEdit ? `/${editId}` : ""}`

    const body =
      mode === "category"
        ? {
            name,
            is_related_to_campus: isRelated,
            department_ids: isRelated ? departmentIds : [],
          }
        : { name }

    await api.request({
      url,
      method: isEdit ? "PUT" : "POST",
      data: body,
    })

    resetForm()
    reloadData()
  }

  /* ================= DELETE ================= */

  async function handleDelete(id: number, type: "category" | "department") {
    if (!confirm("Yakin ingin menghapus data ini?")) return

    const url =
      type === "category"
        ? `/categories/${id}`
        : `/departments/${id}`

    await api.delete(url)
    reloadData()
  }

  async function reloadData() {
    const [catRes, depRes] = await Promise.all([
      api.get<Category[]>("/categories"),
      api.get<Department[]>("/departments"),
    ])

    setCategories(catRes.data)
    setDepartments(depRes.data)
  }

  function resetForm() {
    setOpenModal(false)
    setEditId(null)
    setName("")
    setIsRelated(true)
    setDepartmentIds([])
  }

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
    <div className="flex min-h-screen">
      <AppSidebar active="admin-categories" />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Kelola Kategori & Jurusan
          </h1>
          <p className="text-muted-foreground">
            Manajemen kategori konten dan jurusan kampus
          </p>
        </div>

        <Tabs defaultValue="categories">
          <TabsList>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
            <TabsTrigger value="departments">Jurusan</TabsTrigger>
          </TabsList>

          {/* ================= KATEGORI ================= */}
          <TabsContent value="categories">
            <div className="flex justify-end mb-3">
              <Button
                onClick={() => {
                  setMode("category")
                  resetForm()
                  setOpenModal(true)
                }}
              >
                <Plus size={16} /> Tambah Kategori
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jurusan</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>
                      {c.is_related_to_campus
                        ? c.departments.map((d) => d.name).join(", ")
                        : "-"}
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
                              setMode("category")
                              setEditId(c.id)
                              setName(c.name)
                              setIsRelated(c.is_related_to_campus)
                              setDepartmentIds(
                                c.departments.map((d) => d.id)
                              )
                              setOpenModal(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleDelete(c.id, "category")
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* ================= JURUSAN ================= */}
          <TabsContent value="departments">
            <div className="flex justify-end mb-3">
              <Button
                onClick={() => {
                  setMode("department")
                  resetForm()
                  setOpenModal(true)
                }}
              >
                <Plus size={16} /> Tambah Jurusan
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Jurusan</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {departments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.name}</TableCell>
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
                              setMode("department")
                              setEditId(d.id)
                              setName(d.name)
                              setOpenModal(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleDelete(d.id, "department")
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </main>

      {/* ================= MODAL ================= */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit" : "Tambah"}{" "}
              {mode === "category" ? "Kategori" : "Jurusan"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nama</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {mode === "category" && (
              <>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isRelated}
                    onCheckedChange={(v) =>
                      setIsRelated(Boolean(v))
                    }
                  />
                  <Label>Terkait Jurusan Kampus</Label>
                </div>

                {isRelated && (
                  <div>
                    <Label>Jurusan</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {departments.map((d) => (
                        <label
                          key={d.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={departmentIds.includes(d.id)}
                            onCheckedChange={(checked) => {
                              setDepartmentIds((prev) =>
                                checked
                                  ? [...prev, d.id]
                                  : prev.filter(
                                      (id) => id !== d.id
                                    )
                              )
                            }}
                          />
                          {d.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setOpenModal(false)}
              >
                Batal
              </Button>
              <Button onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
