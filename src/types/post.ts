export interface Post {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  created_at: string;

  author_name: string;
  author_role: string;
  media_url?: string | null;

  categories: Category[];

  duration?: number | null;
  thumbnail_url?: string | null;   // ⬅️ WAJIB
  is_validated?: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  is_related_to_campus?: boolean;
}

export type PostFile = {
  file_url: string
  file_type: string
  duration?: number | null
  thumbnail_url?: string | null
  meta?: {
    total_pages?: number
    pages?: string[]
  } | null
}

export type PostDetail = {
  id: string
  title: string
  description: string
  type: "e-learning" | "works"
  status: string
  created_at: string

  author: {
    id: string
    name: string
    role: string
    department?: string
  }

  categories: { id: string; name: string }[]

  files: PostFile[]

  likes_count: number
  comments_count: number
  is_liked: boolean
  is_bookmarked: boolean
}

