"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import api from "@/services/api"
import type { UserDetail } from "@/types/user"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  onSuccess: () => void
}

interface Department {
  id: string
  name: string
}

interface UpdateUserPayload {
  fullname: string
  email: string
  password?: string
  is_active: boolean
  avatar_url: string | null
  bio: string | null
  personal_link: string | null
  user_type: "mahasiswa" | "dosen" | "others"
  department_id: string | null
  npm: string | null
  nidn: string | null
  occupation: string | null
}

export default function EditUserModal({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserDetail | null>(null)
  const [password, setPassword] = useState("")
  const [departments, setDepartments] = useState<Department[]>([])

  /* ================= FETCH USER ================= */
  useEffect(() => {
    if (!open || !userId) return

    api
      .get<UserDetail>(`/users/${userId}`)
      .then((res) => setUser(res.data))
      .catch(() => onOpenChange(false))
  }, [open, userId, onOpenChange])

  /* ================= FETCH DEPARTMENTS ================= */
  useEffect(() => {
    if (!open) return

    api
      .get<Department[]>("/departments")
      .then((res) => setDepartments(res.data))
  }, [open])

  /* ================= SUBMIT ================= */
  async function handleSubmit() {
    if (!user || !userId) return

    setLoading(true)

    const payload: UpdateUserPayload = {
      fullname: user.fullname,
      email: user.email,
      is_active: user.is_active,
      avatar_url: user.avatar_url ?? null,
      bio: user.bio ?? null,
      personal_link: user.personal_link ?? null,
      user_type: user.user_type,
      department_id: user.department_id ?? null,

      npm: user.user_type === "mahasiswa" ? user.npm ?? null : null,
      nidn: user.user_type === "dosen" ? user.nidn ?? null : null,
      occupation:
        user.user_type === "others"
          ? user.occupation ?? null
          : null,
    }

    if (password.trim()) {
      payload.password = password
    }

    await api.put(`/users/${userId}`, payload)

    setLoading(false)
    onOpenChange(false)
    onSuccess()
  }

  /* ================= UI ================= */
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setUser(null)
          setPassword("")
        }
        onOpenChange(value)
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        {!user ? (
          <p className="text-sm text-muted-foreground">
            Memuat data user...
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Nama Lengkap</Label>
              <Input
                value={user.fullname}
                onChange={(e) =>
                  setUser({ ...user, fullname: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={user.email}
                onChange={(e) =>
                  setUser({ ...user, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Password Baru</Label>
              <Input
                type="password"
                placeholder="Kosongkan jika tidak ingin mengubah"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>User Type</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={user.user_type}
                onChange={(e) =>
                  setUser({
                    ...user,
                    user_type: e.target.value as UserDetail["user_type"],
                  })
                }
              >
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <Label>Jurusan</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={user.department_id ?? ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    department_id: e.target.value || null,
                  })
                }
              >
                <option value="">- Tidak ada jurusan -</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Status Aktif</Label>
              <Switch
                checked={user.is_active}
                onCheckedChange={(checked) =>
                  setUser({ ...user, is_active: checked })
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                Simpan
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
