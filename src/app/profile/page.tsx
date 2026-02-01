"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import AppSidebar from "@/components/layout/app-sidebar"
import EditBioDialog from "@/components/dialogs/edit-bio-dialog"
import EditPostDialog from "@/components/profile/edit-post-dialog"
import PostCard, { PostCardData } from "@/components/profile/post-card"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

import api from "@/services/api"
import { useAuth } from "@/app/context/auth-context"

/* ================= TYPES ================= */

type Profile = {
  id: string
  fullname: string
  avatar_url: string | null
  bio: string | null
  role: string
  department: string | null
}

type ApiPost = {
  id: string
  title: string
  type: "e-learning" | "works"
  status: string

  user_id: string
  author_name: string
  categories: { name: string }[]

  thumbnail_url?: string | null
  duration?: number | null

  preview_page?: string | null
  total_pages?: number | null

  is_bookmarked: boolean
}

/* ================= PAGE ================= */

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  const [editBioOpen, setEditBioOpen] = useState(false)
  const [bioDraft, setBioDraft] = useState("")
  const [savingBio, setSavingBio] = useState(false)

  const [editPostId, setEditPostId] = useState<string | null>(null)
  const [editPostOpen, setEditPostOpen] = useState(false)

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!user) return

    Promise.all([
      api.get<Profile>("/users/me"),
      api.get<ApiPost[]>("/posts"), // 🔥 SOURCE OF TRUTH
    ])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data)
        setBioDraft(profileRes.data.bio ?? "")
        setPosts(Array.isArray(postsRes.data) ? postsRes.data : [])
      })
      .finally(() => setPageLoading(false))
  }, [user])

  /* ================= ACTIONS ================= */

  const handleSaveBio = async () => {
    if (!profile) return

    setSavingBio(true)
    await api.put("/users/me", { bio: bioDraft })

    setProfile({ ...profile, bio: bioDraft })
    setEditBioOpen(false)
    setSavingBio(false)
  }

  const handleEditPost = (id: string) => {
    setEditPostId(id)
    setEditPostOpen(true)
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm("Yakin ingin menghapus konten ini?")) return

    await api.delete(`/posts/${id}`)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleEditSuccess = async () => {
    setEditPostOpen(false)
    setEditPostId(null)

    const res = await api.get<ApiPost[]>("/posts")
    setPosts(res.data)
  }

  /* ================= DATA MAP ================= */

  const myContents = profile
    ? posts.filter((p) => p.user_id === profile.id)
    : []

  // 🔥 INI KUNCI SAVED TAB
  const savedContents = posts.filter(
    (p) => p.is_bookmarked === true
  )

  const mapToCard = (p: ApiPost): PostCardData => ({
    id: p.id,
    title: p.title,
    type: p.type,
    status: p.status,

    author_name: p.author_name,
    category: p.categories[0]?.name ?? null,

    thumbnail_url: p.thumbnail_url,
    duration: p.duration,

    preview_page: p.preview_page,
    total_pages: p.total_pages,

    isMine: profile ? p.user_id === profile.id : false,
  })

  /* ================= UI ================= */

  if (loading || pageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b px-6 flex items-center">
          <h1 className="text-xl font-semibold">Profile</h1>
        </header>

        <section className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================= PROFILE CARD ================= */}
          <Card>
            <CardContent className="p-6 flex gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback>
                  {profile.fullname.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {profile.fullname}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.department ?? "-"} • {profile.role}
                </p>

                <p className="text-sm pt-2">
                  {profile.bio || "Belum ada bio"}
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setEditBioOpen(true)}
                >
                  Edit Bio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ================= TABS ================= */}
          <Tabs defaultValue="my">
            <TabsList>
              <TabsTrigger value="my">My Contents</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>

            {/* MY CONTENTS */}
            <TabsContent value="my">
              {myContents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada konten
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {myContents.map((p) => (
                    <PostCard
                      key={p.id}
                      post={mapToCard(p)}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* SAVED CONTENTS */}
            <TabsContent value="saved">
              {savedContents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada konten yang disimpan
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {savedContents.map((p) => (
                    <PostCard
                      key={p.id}
                      post={mapToCard(p)}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* ================= DIALOGS ================= */}
      <EditPostDialog
        postId={editPostId}
        open={editPostOpen}
        onClose={() => {
          setEditPostOpen(false)
          setEditPostId(null)
        }}
        onSuccess={handleEditSuccess}
      />

      <EditBioDialog
        open={editBioOpen}
        onOpenChange={setEditBioOpen}
        bio={bioDraft}
        setBio={setBioDraft}
        onSave={handleSaveBio}
        loading={savingBio}
      />
    </div>
  )
}
