"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold">
          Akun Anda Sedang Ditinjau
        </h1>

        <p className="text-muted-foreground">
          Pendaftaran berhasil.
          <br />
          Silakan tunggu admin untuk menyetujui akun Anda.
        </p>

        <Button
          className="w-full"
          onClick={() => router.replace("/login")}
        >
          Kembali ke Login
        </Button>
      </div>
    </div>
  )
}
