"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { AxiosError } from "axios"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import CategoryCombobox from "./category-combobox"
import FileDropzone from "./file-dropzone"
import api from "@/services/api"

type Props = {
  onSuccess?: () => void
}

export default function UploadWorksModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)

    /* ================= VALIDATION ================= */
    if (title.length < 5)
      return setError("Judul minimal 5 karakter")

    if (description.length < 5)
      return setError("Deskripsi minimal 5 karakter")

    if (!categoryId)
      return setError("Kategori wajib dipilih")

    if (!file)
      return setError("PDF wajib diupload")

    if (file.type !== "application/pdf")
      return setError("File harus berupa PDF")

    if (file.size > 30 * 1024 * 1024)
      return setError("Ukuran PDF maksimal 30MB")

    /* ================= FORM DATA ================= */
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category_id", categoryId)
    formData.append("file", file)

    try {
      setLoading(true)

      await api.post("/works", formData, {
        onUploadProgress: (e) => {
          if (!e.total) return
          setProgress(Math.round((e.loaded * 100) / e.total))
        },
      })

      /* ================= RESET ================= */
      setOpen(false)
      setTitle("")
      setDescription("")
      setCategoryId("")
      setFile(null)
      setProgress(0)

      onSuccess?.()
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : "Upload gagal"
        )
      } else {
        setError("Upload gagal")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Upload Works
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Works</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Judul karya"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Deskripsi karya"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <CategoryCombobox
            value={categoryId}
            onChange={setCategoryId}
          />

          <FileDropzone
            file={file}
            onChange={setFile}
          />

          {progress > 0 && (
            <p className="text-sm text-muted-foreground">
              Uploading... {progress}%
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
