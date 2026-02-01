"use client"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import api from "@/services/api"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function LogoutDialog({ open, onOpenChange }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true })
    } catch (err) {
      console.error("LOGOUT ERROR:", err)
    } finally {
      onOpenChange(false)
      router.replace("/login")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Logout</DialogTitle>
        </DialogHeader>

        <p>Apakah kamu yakin ingin logout?</p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>

          <Button
            variant="destructive"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
