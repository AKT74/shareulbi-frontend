"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Heart,
  Bookmark,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"

import AppSidebar from "@/components/layout/app-sidebar"
import AppHeader from "@/components/layout/app-header"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { useAuth } from "@/app/context/auth-context"
import api from "@/services/api"

/* ================= TYPES ================= */

type PostListItem = {
  id: string
  title: string
  description?: string | null
  type: "works" | "e-learning"

  author_name: string
categories?: {
  id: number
  name: string
}[]  
status: string
  created_at?: string

  likes_count: number
  is_liked: boolean
  is_bookmarked: boolean
}

type PostDetail = {
  id: string
  files: {
    file_url?: string
    meta?: {
      pages?: string[]
    }
  }[]
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [posts, setPosts] = useState<PostListItem[]>([])
  const [details, setDetails] = useState<Record<string, PostDetail>>({})
  const [pageIndex, setPageIndex] = useState<Record<string, number>>({})
  const [pageLoading, setPageLoading] = useState(true)

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [loading, user, router])

  /* ================= FETCH POSTS ================= */

  useEffect(() => {
    if (!user) return

    api
      .get<PostListItem[]>("/posts")
      .then((res) =>
        setPosts(
          res.data.map((p) => ({
            ...p,
            likes_count: Number(p.likes_count) || 0,
            is_liked: Boolean(p.is_liked),
            is_bookmarked: Boolean(p.is_bookmarked),
          }))
        )
      )
      .finally(() => setPageLoading(false))
  }, [user])

  /* ================= FETCH DETAIL ================= */

  const fetchDetail = async (postId: string) => {
    if (details[postId]) return
    const res = await api.get<PostDetail>(`/posts/${postId}`)
    setDetails((prev) => ({ ...prev, [postId]: res.data }))
    setPageIndex((prev) => ({ ...prev, [postId]: 0 }))
  }

  /* ================= ACTIONS ================= */

  const toggleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked
                ? p.likes_count - 1
                : p.likes_count + 1,
            }
          : p
      )
    )

    try {
      await api.post(`/posts/${postId}/like`)
    } catch {
      // rollback handled implicitly
    }
  }

  const toggleBookmark = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_bookmarked: !p.is_bookmarked }
          : p
      )
    )

    try {
      await api.post(`/posts/${postId}/bookmark`)
    } catch {
      // rollback handled implicitly
    }
  }

  /* ================= UTILS ================= */

  function formatDateTime(date?: string) {
    if (!date) return ""
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  /* ================= LOADING ================= */

  if (loading || pageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar active="dashboard" />

      <main className="flex-1 flex flex-col">
        <AppHeader title="Home" />

        <section className="flex-1 overflow-y-auto p-6 space-y-10">
          {posts.map((post) => {
            const detail = details[post.id]
            const file = detail?.files?.[0]
            const pages = file?.meta?.pages || []
            const currentPage = pageIndex[post.id] ?? 0

            return (
              <Card
                key={post.id}
                className="p-6 flex flex-col gap-4"
                onMouseEnter={() => fetchDetail(post.id)}
              >
                {/* ================= HEADER ================= */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {post.author_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">
                        {post.author_name}
                      </p>
                    </div>

                      {/* CATEGORY */}
                      {post.categories && post.categories.length > 0 && (
                        <Badge variant="secondary">
                          {post.categories.map((category) => category.name).join(", ")}
                        </Badge>
                      )}

                    {/* STATUS */}
                    {post.status === "validated" && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        Validated
                      </Badge>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(post.created_at)}
                  </span>
                </div>

                {/* ================= MEDIA ================= */}
                <div className="w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  {post.type === "e-learning" && file?.file_url && (
                    <video
                      controls
                      className="w-full max-h-[75vh] object-contain bg-black"
                    >
                      <source src={file.file_url} />
                    </video>
                  )}

                  {post.type === "works" && pages.length > 0 && (
                    <PDFCarousel
                      pages={pages}
                      index={currentPage}
                      onChange={(i) =>
                        setPageIndex((p) => ({
                          ...p,
                          [post.id]: i,
                        }))
                      }
                    />
                  )}
                </div>

                {/* ================= TITLE + ACTIONS ================= */}
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">
                      {post.title}
                    </h2>

                    {post.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {post.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                    >
                      <Heart
                        size={18}
                        className={
                          post.is_liked
                            ? "fill-red-500 text-red-500"
                            : ""
                        }
                      />
                      <span className="ml-1 text-sm">
                        {post.likes_count}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(post.id)}
                    >
                      <Bookmark
                        size={18}
                        className={
                          post.is_bookmarked
                            ? "fill-foreground"
                            : ""
                        }
                      />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </section>
      </main>
    </div>
  )
}

/* ================= PDF CAROUSEL ================= */

function PDFCarousel({
  pages,
  index,
  onChange,
}: {
  pages: string[]
  index: number
  onChange: (i: number) => void
}) {
  return (
    <div className="relative w-full flex items-center justify-center">
      <img
        src={pages[index]}
        className="max-h-[75vh] object-contain"
      />

      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Button
          variant="ghost"
          size="icon"
          disabled={index === 0}
          onClick={() => onChange(index - 1)}
        >
          <ChevronLeft />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={index === pages.length - 1}
          onClick={() => onChange(index + 1)}
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
        {index + 1} / {pages.length}
      </div>
    </div>
  )
}
