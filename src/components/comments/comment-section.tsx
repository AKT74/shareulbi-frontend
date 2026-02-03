"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Comment } from "@/types/comment"

interface Props {
  postId: string
}

export default function CommentSection({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  /* ================= FETCH COMMENTS ================= */
  useEffect(() => {
    if (!postId) return

    console.log("🟡 FETCH COMMENTS:", postId)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments`, {
      credentials: "include", // 🔥 WAJIB (COOKIE)
    })
      .then((r) => r.json())
      .then((data: Comment[]) => {
        console.log("🟢 COMMENTS:", data)
        setComments(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error("🔴 FETCH COMMENTS ERROR:", err)
      })
      .finally(() => setLoading(false))
  }, [postId])

  /* ================= ADD COMMENT ================= */
  const submitComment = async () => {
    if (!content.trim()) return

    setSubmitting(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments`,
        {
          method: "POST",
          credentials: "include", // 🔥 WAJIB
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      )

      if (!res.ok) {
        throw new Error("Failed to post comment")
      }

      // refetch comments (AMAN & KONSISTEN)
      const latest = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments`,
        { credentials: "include" }
      )

      const data = await latest.json()
      setComments(data)
      setContent("")
    } catch (err) {
      console.error("🔴 SUBMIT COMMENT ERROR:", err)
    } finally {
      setSubmitting(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-4">
      <h2 className="font-medium">
        Comments ({comments.length})
      </h2>

      {/* INPUT */}
      <div className="flex gap-2">
        <Avatar>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <textarea
            className="w-full border rounded-md p-2 text-sm"
            placeholder="Tulis komentar..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Button
            size="sm"
            disabled={!content.trim() || submitting}
            onClick={submitComment}
          >
            Kirim
          </Button>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="text-sm text-muted-foreground">
          Memuat komentar...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada komentar
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar>
                {c.avatar_url ? (
                  <AvatarImage src={c.avatar_url} />
                ) : (
                  <AvatarFallback>
                    {c.fullname?.charAt(0) ?? "U"}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <p className="text-sm font-medium">
                  {c.fullname}
                </p>
                <p className="text-sm">{c.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
