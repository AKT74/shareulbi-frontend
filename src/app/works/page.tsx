"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppSidebar from "@/components/layout/app-sidebar";
import WorksCard from "@/components/works/works-card";
import UploadWorksModal from "@/components/works/upload-works-modal";

import { Category } from "@/types/post";
import { Loader2 } from "lucide-react";

import api from "@/services/api";
import { useAuth } from "@/app/context/auth-context";

/* ================= TYPES ================= */

type WorksPost = {
  id: string;
  title: string;
  status: "published" | "validated" | "rejected" | "not_validatable";
  author_name: string;
  category: string | null;
  total_pages: number;
  preview_page: string | null;
  created_at: string;
};

/* ================= PAGE ================= */

export default function WorksPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  /* ================= STATE ================= */
  const [posts, setPosts] = useState<WorksPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [pageLoading, setPageLoading] = useState(true);

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!user) return;

    Promise.all([
      api.get<WorksPost[]>("/works"),
      api.get<Category[]>("/categories"),
    ])
      .then(([worksRes, categoriesRes]) => {
        setPosts(Array.isArray(worksRes.data) ? worksRes.data : []);
        setCategories(
          Array.isArray(categoriesRes.data) ? categoriesRes.data : [],
        );
      })
      .catch(console.error)
      .finally(() => setPageLoading(false));
  }, [user]);

  /* ================= FILTER + SORT ================= */

  const filteredPosts = posts
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => (category === "all" ? true : p.category === category))
    .sort((a, b) => {
      if (sort === "title-asc") return a.title.localeCompare(b.title);

      if (sort === "title-desc") return b.title.localeCompare(a.title);

      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();

      if (sort === "oldest") return timeA - timeB;
      return timeB - timeA; // newest
    });

  /* ================= UI ================= */

  if (loading || pageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar active="works" />

      <main className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b px-6 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold whitespace-nowrap">Works</h1>

          {/* SEARCH + FILTER + SORT */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border px-3 text-sm"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-md border px-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-md border px-2 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* ACTION */}
          <UploadWorksModal onSuccess={() => location.reload()} />
        </header>

        {/* CONTENT */}
        <section className="flex-1 overflow-y-auto p-6">
          {filteredPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada karya</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((p) => (
                <WorksCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  author={p.author_name}
                  category={p.category}
                  totalPages={p.total_pages}
                  preview={p.preview_page}
                  status={p.status}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
