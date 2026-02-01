"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import AppSidebar from "@/components/layout/app-sidebar"
import LearningCard from "@/components/e-learning/learning-card"
import UploadELearningModal from "@/components/e-learning/upload-elearning-modal"

import { Category, Post } from "@/types/post"
import api from "@/services/api"
import { useAuth } from "@/app/context/auth-context"
import { Loader2 } from "lucide-react"

/* ================= PAGE ================= */

export default function ELearningPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  /* ================= STATE ================= */
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")
  const [category, setCategory] = useState("all")

  const [pageLoading, setPageLoading] = useState(true)

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login")
    }
  }, [authLoading, user, router])

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!user) return

    Promise.all([
      api.get<Post[]>("/e-learning"),
      api.get<Category[]>("/categories"),
    ])
      .then(([postsRes, categoriesRes]) => {
        setPosts(postsRes.data)
        setCategories(categoriesRes.data)
      })
      .finally(() => setPageLoading(false))
  }, [user])

  /* ================= FILTER + SORT ================= */
  const filteredPosts = posts
    .filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) =>
      category === "all"
        ? true
        : p.categories?.some((c) => c.name === category)
    )
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime()
      const timeB = new Date(b.created_at).getTime()

      if (sort === "newest") return timeB - timeA
      if (sort === "oldest") return timeA - timeB
      if (sort === "title-asc") return a.title.localeCompare(b.title)
      if (sort === "title-desc") return b.title.localeCompare(a.title)

      return 0
    })

  /* ================= LOADING ================= */
  if (authLoading || pageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!user) return null

  /* ================= UI ================= */
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar active="e-learning" />

      <main className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b px-6 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold whitespace-nowrap">
            E-Learning
          </h1>

          {/* SEARCH + FILTER + SORT */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border px-3 text-sm"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-md border px-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-md border px-2 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <UploadELearningModal
            onSuccess={() => {
              api.get<Post[]>("/e-learning").then((res) =>
                setPosts(res.data)
              )
            }}
          />
        </header>

        {/* CONTENT */}
        <section className="flex-1 overflow-y-auto p-6">
          {filteredPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada e-learning
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredPosts.map((p) => (
                <LearningCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  owner={p.author_name}
                  category={p.categories?.[0]?.name}
                  duration={p.duration}
                  thumbnailUrl={p.thumbnail_url}
                  validated={p.status === "validated"}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
