"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import AppSidebar from "@/components/layout/app-sidebar"
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

interface Category {
  name: string
}

interface Author {
  fullname: string
}

interface ContentItem {
  id: string
  title: string
  type: "e-learning" | "works"
  status: string
  created_at: string

  author_name?: string
  author?: Author

  category_name?: string
  categories?: Category[]
}

/* ================= PAGE ================= */

export default function AdminContentsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [contents, setContents] = useState<ContentItem[]>([])
  const [pageLoading, setPageLoading] = useState(true)

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

  /* ================= FETCH CONTENTS ================= */

  useEffect(() => {
    if (!user || user.role.name !== "admin") return

    api
      .get<ContentItem[]>("/posts")
      .then((res) => setContents(res.data))
      .finally(() => setPageLoading(false))
  }, [user])

  /* ================= DELETE CONTENT ================= */

  async function deleteContent(id: string) {
    if (!confirm("Yakin ingin menghapus konten ini?")) return

    try {
      await api.delete(`/posts/${id}`)
      setContents((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert("Gagal menghapus konten")
    }
  }

  /* ================= UTILS ================= */

  function renderStatus(status: string) {
    switch (status) {
      case "validated":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      case "published":
        return "bg-gray-100 text-gray-700"
      case "not_validatable":
        return "bg-transparent border text-muted-foreground"
      default:
        return "bg-gray-50 text-gray-500"
    }
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
          <h1 className="text-2xl font-semibold">Kelola Konten</h1>
          <p className="text-muted-foreground">
            Manajemen konten E-Learning dan Works
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {contents.map((content) => (
              <TableRow key={content.id}>
                <TableCell className="font-medium">
                  {content.title}
                </TableCell>

                <TableCell className="capitalize">
                  {content.type}
                </TableCell>

                <TableCell>
                  {content.author_name ??
                    content.author?.fullname ??
                    "-"}
                </TableCell>

                <TableCell>
                  {content.category_name
                    ? content.category_name
                    : content.categories?.length
                    ? content.categories.map((c) => c.name).join(", ")
                    : "-"}
                </TableCell>

                <TableCell>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${renderStatus(
                      content.status
                    )}`}
                  >
                    {content.status.replace("_", " ")}
                  </span>
                </TableCell>

                <TableCell>
                  {formatDate(content.created_at)}
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
                        className="text-destructive"
                        onClick={() =>
                          deleteContent(content.id)
                        }
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {contents.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Tidak ada konten
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </main>
    </div>
  )
}
