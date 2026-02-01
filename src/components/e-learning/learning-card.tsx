"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/* ================= TYPE ================= */
interface LearningCardProps {
  id: string;
  title: string;
  owner?: string;
  category?: string;
  duration?: number | null;
  thumbnailUrl?: string | null;
  validated?: boolean;
}

/* ================= HELPER ================= */
function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "00:00";

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ================= COMPONENT ================= */
export default function LearningCard({
  id,
  title,
  owner = "Unknown",
  category = "-",
  duration,
  thumbnailUrl,
  validated = false,
}: LearningCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/e-learning/${id}`)}
      className="cursor-pointer overflow-hidden transition hover:shadow-md"
    >
      {/* THUMBNAIL */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        {/* DURATION */}
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
          {formatDuration(duration)}
        </span>
      </div>

      {/* INFO */}
      <div className="space-y-2 p-3">
        {/* TITLE */}
        <p className="line-clamp-2 text-sm font-semibold leading-snug">
          {title}
        </p>

        {/* META */}
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {owner.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <span className="font-medium text-foreground">
              {owner}
            </span>

            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>

          {/* RIGHT */}
          {validated && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs"
            >
              <CheckCircle className="h-3 w-3 text-blue-500" />
              Valid
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
