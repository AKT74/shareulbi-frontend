"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import api from "@/services/api"

interface Topic {
  id: number
  name: string
  is_active?: boolean
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function ReportFeedbackDialog({
  open,
  onOpenChange,
}: Props) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicId, setTopicId] = useState<number | "">("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  /* ================= FETCH TOPICS ================= */
  useEffect(() => {
    if (!open) return

    let isMounted = true

    const fetchTopics = async () => {
      try {
        setLoading(true)

        const res = await api.get<Topic[]>("/feedback-topics")

        if (!isMounted) return

        setTopics(
          Array.isArray(res.data)
            ? res.data.filter((t) => t.is_active !== false)
            : []
        )
      } catch (err) {
        if (isMounted) {
          console.error("FETCH FEEDBACK TOPICS ERROR:", err)
          setTopics([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchTopics()

    return () => {
      isMounted = false
    }
  }, [open])

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!topicId || !message.trim()) return

    try {
      await api.post("/reports-feedbacks", {
        topic_id: topicId,
        description: message,
        post_id: null,
      })

      setMessage("")
      setTopicId("")
      onOpenChange(false)
    } catch (err) {
      console.error("SUBMIT FEEDBACK ERROR:", err)
    }
  }

  /* ================= UI ================= */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reports & Feedback</DialogTitle>
          <DialogDescription>
            Form untuk mengirim laporan atau feedback kepada admin
          </DialogDescription>
        </DialogHeader>

        {/* TOPIC */}
        <select
          className="border rounded px-2 py-1 text-sm"
          value={topicId}
          disabled={loading}
          onChange={(e) =>
            setTopicId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">
            {loading ? "Memuat topik..." : "Pilih Topik"}
          </option>

          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* MESSAGE */}
        <textarea
          className="border rounded px-2 py-1 text-sm min-h-[100px]"
          placeholder="Tulis pesan..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <DialogFooter>
          <Button
            disabled={!topicId || !message.trim() || loading}
            onClick={handleSubmit}
          >
            Kirim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
