import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Post } from "@/types/post";
import {Category} from "@/types/post";

interface Props {
  post: Post;
}



export default function PostCard({ post }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row gap-3 items-center">
        <Avatar>
          <AvatarFallback>{post.author_name?.[0] ?? "U"}</AvatarFallback>
        </Avatar>

        <div>
          <p className="text-sm font-medium">{post.author_name}</p>
          <p className="text-xs text-muted-foreground">
            {post.author_role}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* MEDIA SLOT */}
        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
          {post.media_url ? (
            post.media_url.endsWith(".pdf") ? (
              <iframe src={post.media_url} className="w-full h-full rounded" />
            ) : (
              <video controls className="w-full h-full rounded">
                <source src={post.media_url} />
              </video>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              Media belum tersedia
            </p>
          )}
        </div>

        {/* CATEGORY */}
        <span className="inline-block text-xs px-2 py-1 rounded bg-secondary">
          {post.categories.map(category => category.name).join(", ")}
        </span>

        {/* TITLE & DESC */}
        <div>
          <h2 className="font-semibold">{post.title}</h2>
          <p className="text-sm text-muted-foreground">{post.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
