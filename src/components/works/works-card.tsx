"use client"

import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/* ================= TYPES ================= */

type Props = {
  id: string
  title: string
  author: string
  category: string | null
  totalPages: number
  preview: string | null
  status: "published" | "validated" | "rejected" | "not_validatable"
}

/* ================= COMPONENT ================= */

export default function WorksCard({
  id,
  title,
  author,
  category,
  totalPages,
  preview,
  status,
}: Props) {
  const router = useRouter()

  // 🔥 SESUAI DATA BACKEND
  const isValidated = status === "validated"

  return (
    <Card
      onClick={() => router.push(`/works/${id}`)}
      className="relative flex gap-4 p-4 h-full cursor-pointer hover:bg-muted/40 transition"
    >
      {/* LEFT – PREVIEW */}
      <div className="w-28 h-36 sm:w-32 sm:h-40 bg-muted rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-xs text-muted-foreground">
            No Preview
          </div>
        )}
      </div>

      {/* RIGHT – INFO */}
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-medium leading-snug line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground mt-1">
            {category ?? "Uncategorized"}
          </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>{totalPages} halaman</p>
          <p>By {author}</p>
        </div>
      </div>

      {/* ✅ VALIDATION BADGE (SAMA DENGAN PROFILE & E-LEARNING) */}
      {isValidated && (
        <Badge
          variant="outline"
          className="absolute bottom-3 right-3 flex items-center gap-1 text-xs"
        >
          <CheckCircle className="h-3 w-3 text-blue-500" />
          Valid
        </Badge>
      )}
    </Card>
  )
}
