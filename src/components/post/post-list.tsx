"use client"

import { useState, useCallback } from "react"
import PostCard from "./post-card"
import InfiniteScrollTrigger from "../shared/infinite-scroll-trigger"
import { Post } from "@/types/post"
import api from "@/services/api"

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const limit = 5

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)

    try {
      const res = await api.get<Post[]>(
        `/posts?limit=${limit}&offset=${offset}`
      )

      const data = res.data

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const filtered = data.filter(
          (p) => !existingIds.has(p.id)
        )
        return [...prev, ...filtered]
      })

      setOffset((prev) => prev + limit)

      if (data.length < limit) {
        setHasMore(false)
      }
    } catch (err) {
      console.error("FETCH POSTS ERROR:", err)
    } finally {
      setLoading(false)
    }
  }, [offset, hasMore, loading])

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasMore && (
        <InfiniteScrollTrigger onVisible={loadPosts} />
      )}
    </div>
  )
}
