"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import api from "@/services/api"

type Category = {
  id: string
  name: string
  is_related_to_campus: boolean
}

type Props = {
  postId: string | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditPostDialog({
  postId,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!open || !postId) return

    Promise.all([
      api.get(`/posts/${postId}`),
      api.get(`/categories`),
    ]).then(([postRes, catRes]) => {
      const post = postRes.data
      const cats = catRes.data

      setTitle(post.title)
      setDescription(post.description)
      setCategoryId(post.categories?.[0]?.id ?? "")
      setStatus(post.status)
      setCategories(
        Array.isArray(cats) ? cats : cats.data || []
      )
    })
  }, [open, postId])

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!postId) return

    try {
      setLoading(true)

      await api.put(`/posts/${postId}`, {
        title,
        description,
        category_id: categoryId,
      })

      onClose()
      onSuccess()
    } catch (err) {
      console.error("UPDATE POST ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />

          <select
            disabled={status === "validated"}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-9 rounded-md border px-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {status === "validated" && (
            <p className="text-xs text-muted-foreground">
              Kategori tidak dapat diubah karena konten sudah tervalidasi
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
