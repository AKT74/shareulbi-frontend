"use client";

import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2, CheckCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ================= TYPES ================= */

export type PostCardData = {
  id: string;
  title: string;
  type: "e-learning" | "works";

  author_name: string;
  category?: string | null;

  /* e-learning */
  thumbnail_url?: string | null;
  duration?: number | null;

  /* works */
  preview_page?: string | null;
  total_pages?: number | null;

  status: string; // published | validated | not_validatable
  isMine: boolean;
};

/* ================= HELPERS ================= */

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ================= COMPONENT ================= */

export default function PostCard({
  post,
  onEdit,
  onDelete,
}: {
  post: PostCardData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  const openDetail = () => {
    router.push(
      post.type === "e-learning"
        ? `/e-learning/${post.id}`
        : `/works/${post.id}`
    );
  };

  /* ================= WORKS ================= */
  if (post.type === "works") {
    return (
      <Card
        onClick={openDetail}
        className="relative flex gap-4 p-4 h-[310px] cursor-pointer hover:bg-muted/40 transition"
      >
        {/* PREVIEW */}
        <div className="w-32 h-full bg-muted rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
          {post.preview_page ? (
            <img
              src={post.preview_page}
              alt="preview"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-xs text-muted-foreground">
              No Preview
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="flex flex-col justify-between flex-1">
          <div className="space-y-1">
            <h3 className="font-semibold leading-snug line-clamp-2">
              {post.title}
            </h3>

            <p className="text-sm text-muted-foreground">
              {post.category ?? "Uncategorized"}
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>{post.total_pages ?? 0} halaman</p>
            <p>By {post.author_name}</p>
          </div>
        </div>

        {/* VALIDATED BADGE — BOTTOM RIGHT */}
        {post.status === "validated" && (
          <Badge
            variant="outline"
            className="absolute bottom-3 right-3 flex items-center gap-1 text-xs"
          >
            <CheckCircle className="h-3 w-3 text-blue-500" />
            Valid
          </Badge>
        )}

        {/* ELLIPSIS */}
        {post.isMine && (
          <div
            className="absolute top-2 right-2"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreVertical size={18} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(post.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </Card>
    );
  }

  /* ================= E-LEARNING ================= */
  return (
    <Card
      onClick={openDetail}
      className="relative h-[310px] cursor-pointer overflow-hidden transition hover:shadow-md"
    >
      {/* THUMBNAIL */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {post.thumbnail_url ? (
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        {post.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
            {formatDuration(post.duration)}
          </span>
        )}

        {/* ELLIPSIS */}
        {post.isMine && (
          <div
            className="absolute top-2 right-2"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary">
                  <MoreVertical size={18} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(post.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="space-y-2 p-4">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">
          {post.title}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              {post.author_name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <span className="font-medium text-foreground">
            {post.author_name}
          </span>

          <Badge variant="secondary" className="text-xs">
            {post.category ?? "-"}
          </Badge>
        </div>
      </div>

      {/* VALIDATED BADGE — BOTTOM RIGHT */}
      {post.status === "validated" && (
        <Badge
          variant="outline"
          className="absolute bottom-3 right-3 flex items-center gap-1 text-xs"
        >
          <CheckCircle className="h-3 w-3 text-blue-500" />
          Valid
        </Badge>
      )}
    </Card>
  );
}
