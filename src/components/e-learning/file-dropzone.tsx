"use client"

import { useRef, useState } from "react"
import { UploadCloud, FileVideo } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  file: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
}

export default function FileDropzone({
  file,
  onChange,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    onChange(files[0])
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition",
        "cursor-pointer",
        isDragging && "border-primary bg-primary/5",
        disabled &&
          "cursor-not-allowed opacity-50 pointer-events-none"
      )}
      onClick={() => {
        if (!disabled) inputRef.current?.click()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        if (!disabled) handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!file ? (
        <>
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            Drag & drop video di sini
          </p>
          <p className="text-xs text-muted-foreground">
            atau klik untuk memilih file (max 50MB)
          </p>
        </>
      ) : (
        <>
          <FileVideo className="h-8 w-8 text-primary mb-2" />
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </>
      )}
    </div>
  )
}
