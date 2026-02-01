"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import CategoryCombobox from "./category-combobox";
import FileDropzone from "./file-dropzone";
import api from "@/services/api";

type Props = {
  onSuccess?: () => void;
};

export default function UploadELearningModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /* ================= RESET SAAT MODAL DITUTUP ================= */
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setCategoryId("");
      setFile(null);
      setProgress(0);
      setError(null);
      setLoading(false);
    }
  }, [open]);
console.log(file instanceof File) // HARUS true
console.log(file?.name)           // nama.mp4

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    setError(null);

    if (title.length < 5) return setError("Judul minimal 5 karakter");
    if (description.length < 5) return setError("Deskripsi minimal 5 karakter");
    if (!categoryId) return setError("Kategori wajib dipilih");
    if (!file) return setError("Video wajib diupload");
    if (file.size > 50 * 1024 * 1024)
      return setError("Ukuran video maksimal 50MB");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category_id", categoryId);
    formData.append("file", file); // 🔥 INI YANG PENTING

    let isMounted = true;

    try {
      setLoading(true);

      await api.post("/e-learning", formData, {
        onUploadProgress: (e) => {
          if (!isMounted || !e.total) return;
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      if (!isMounted) return;

      setOpen(false);
      onSuccess?.();
    } catch (err) {
      if (!isMounted) return;

      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Upload gagal");
      } else {
        setError("Upload gagal");
      }
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Upload E-Learning
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload E-Learning</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Judul materi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />

          <Textarea
            placeholder="Deskripsi materi"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          <CategoryCombobox
            value={categoryId}
            onChange={setCategoryId}
            disabled={loading}
          />

          <FileDropzone file={file} onChange={setFile} disabled={loading} />

          {loading && progress > 0 && (
            <p className="text-sm text-muted-foreground">
              Uploading... {progress}%
            </p>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

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
  );
}
