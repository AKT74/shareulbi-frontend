"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import {
  X,
  Heart,
  Bookmark,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CommentSection from "@/components/comments/comment-section"
import { Loader2 } from "lucide-react"

import type { PostDetail } from "@/types/post"
import api from "@/services/api"
import { useAuth } from "@/app/context/auth-context"

/* ================= PAGE ================= */

export default function WorksDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const postId = params.id

  const { user, loading } = useAuth()

  const [post, setPost] = useState<PostDetail | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)

  /* ================= UTILS ================= */

  function formatDateTime(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!user || !postId) return

    api
      .get<PostDetail>(`/posts/${postId}`)
      .then((res) => {
        const data = res.data

        // 🔐 GUARD: KHUSUS WORKS
        if (data.type !== "works") {
          router.replace("/works")
          return
        }

        setPost({
          ...data,
          likes_count: Number(data.likes_count) || 0,
          is_liked: Boolean(data.is_liked),
          is_bookmarked: Boolean(data.is_bookmarked),
        })
      })
      .catch(console.error)
      .finally(() => setPageLoading(false))
  }, [user, postId, router])

  /* ================= LOADING ================= */

  if (loading || pageLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <Loader2 className="animate-spin text-white" />
      </div>
    )
  }

  if (!post) return null

  const file = post.files?.[0]
  const pages = file?.meta?.pages || []

  /* ================= INTERACTIONS ================= */

  const toggleLike = async () => {
    const prev = post

    setPost({
      ...post,
      is_liked: !post.is_liked,
      likes_count: post.is_liked
        ? post.likes_count - 1
        : post.likes_count + 1,
    })

    try {
      await api.post(`/posts/${post.id}/like`)
    } catch {
      setPost(prev)
    }
  }

  const toggleBookmark = async () => {
    const prev = post

    setPost({
      ...post,
      is_bookmarked: !post.is_bookmarked,
    })

    try {
      await api.post(`/posts/${post.id}/bookmark`)
    } catch {
      setPost(prev)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="absolute inset-0 bg-background flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>
                {post.author.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-medium">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {post.author.role}
              </p>
            </div>

            {post.categories.map((c) => (
              <Badge key={c.id} variant="secondary">
                {c.name}
              </Badge>
            ))}
            {post.status === "validated" && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-500" />
                Validated
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <X />
          </Button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-8 gap-6 h-full">
            {/* LEFT */}
            <div className="col-span-6 flex flex-col gap-4 overflow-y-auto pr-2">
              {/* PDF PREVIEW */}
              <div className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center h-[65vh]">
                {pages.length > 0 ? (
                  <>
                    <img
                      src={pages[currentPage]}
                      alt={`Page ${currentPage + 1}`}
                      className="max-h-full object-contain"
                    />

                    {/* NAV */}
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentPage === 0}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 0))
                        }
                      >
                        <ChevronLeft />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={currentPage === pages.length - 1}
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(p + 1, pages.length - 1)
                          )
                        }
                      >
                        <ChevronRight />
                      </Button>
                    </div>

                    {/* PAGE INFO */}
                    <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                      {currentPage + 1} / {pages.length}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">
                    Preview PDF tidak tersedia
                  </div>
                )}
              </div>

              {/* TITLE + ACTIONS */}
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-xl font-semibold">
                    {post.title}
                  </h1>

                  <p className="text-sm text-muted-foreground mt-2">
                    {post.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={toggleLike}
                    >
                      <Heart
                        size={18}
                        className={
                          post.is_liked
                            ? "fill-red-500 text-red-500"
                            : ""
                        }
                      />
                      <span className="text-sm">
                        {post.likes_count}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleBookmark}
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

                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <aside className="col-span-2 border-l pl-4 flex flex-col overflow-y-auto">
              <CommentSection postId={String(post.id)} />
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
