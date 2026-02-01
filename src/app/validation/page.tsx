"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import AppSidebar from "@/components/layout/app-sidebar"
import { Button } from "@/components/ui/button"
import ValidationConfirmDialog from "@/components/validation/validation-confirm-dialog"
import { Loader2 } from "lucide-react"

import api from "@/services/api"
import { useAuth } from "@/app/context/auth-context"

/* ================= TYPES ================= */

type ValidatablePost = {
  id: string
  title: string
  type: "e-learning" | "works"
  category: string
  author_name: string
  created_at: string
}

type ValidationAction = "validated" | "rejected"

/* ================= PAGE ================= */

export default function ValidationPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [posts, setPosts] = useState<ValidatablePost[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  const [openConfirm, setOpenConfirm] = useState(false)
  const [action, setAction] = useState<ValidationAction>("validated")
  const [selectedPost, setSelectedPost] =
    useState<ValidatablePost | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
      return
    }
  }, [loading, user, router])

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!user) return

    api
      .get<ValidatablePost[]>("/validation/posts")
      .then((res) => {
        setPosts(Array.isArray(res.data) ? res.data : [])
      })
      .catch(console.error)
      .finally(() => setPageLoading(false))
  }, [user])

  /* ================= CONFIRM HANDLER ================= */

  const handleConfirm = async () => {
    if (!selectedPost) return

    try {
      setSubmitting(true)

      await api.post(
        `/validation/posts/${selectedPost.id}/validate`,
        { status: action }
      )

      setPosts((prev) =>
        prev.filter((p) => p.id !== selectedPost.id)
      )

      setOpenConfirm(false)
      setSelectedPost(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  /* ================= UI ================= */

  if (loading || pageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar active="validation" />

      <main className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b px-6 flex items-center">
          <h1 className="text-xl font-semibold">
            Validasi Konten Jurusan
          </h1>
        </header>

        {/* CONTENT */}
        <section className="flex-1 overflow-y-auto p-6">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada konten yang perlu divalidasi
            </p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Judul</th>
                    <th className="text-left p-3">Kategori</th>
                    <th className="text-left p-3">Tipe</th>
                    <th className="text-left p-3">Author</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">{p.title}</td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3 capitalize">
                        {p.type === "e-learning"
                          ? "E-Learning"
                          : "Works"}
                      </td>
                      <td className="p-3">{p.author_name}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPost(p)
                              setAction("validated")
                              setOpenConfirm(true)
                            }}
                          >
                            Validasi
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedPost(p)
                              setAction("rejected")
                              setOpenConfirm(true)
                            }}
                          >
                            Tolak
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* CONFIRM MODAL */}
      {selectedPost && (
        <ValidationConfirmDialog
          open={openConfirm}
          onOpenChange={setOpenConfirm}
          action={action}
          postTitle={selectedPost.title}
          loading={submitting}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
