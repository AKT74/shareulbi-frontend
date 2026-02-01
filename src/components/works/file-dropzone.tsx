"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";

type Props = {
  file: File | null;
  onChange: (file: File) => void;
};

export default function FileDropzone({ file, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      onChange(dropped);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center hover:bg-muted"
    >
      <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-medium">
        {file ? file.name : "Drag & drop PDF atau klik untuk memilih"}
      </p>
      <p className="text-xs text-muted-foreground">
        PDF • maksimal 30MB
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
    </div>
  );
}
