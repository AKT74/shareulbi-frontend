"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { useAuthStore } from "@/store/auth.store"
import { useAuth } from "@/app/context/auth-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

type BackendError = {
  message?: string
}

export default function LoginPage() {
  const router = useRouter()

  const login = useAuthStore((s) => s.login)
  const { setUser } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError(null)

    if (!email || !password) {
      setError("Email dan password wajib diisi")
      return
    }

    setLoading(true)

    try {
      /* ================= 1️⃣ LOGIN (SET COOKIE) ================= */
      await login(email, password)

      /* ================= 2️⃣ FETCH /ME ================= */
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/me`,
        {
          credentials: "include",
        }
      )

      if (!res.ok) {
        let data: BackendError | null = null
        try {
          data = await res.json()
        } catch {
          // ignore
        }
        throw new Error(data?.message || "Session tidak valid")
      }

      const user = await res.json()

      /* ================= 3️⃣ SET USER KE CONTEXT ================= */
      setUser(user)

      /* ================= 4️⃣ REDIRECT ================= */
      if (user.onboarding_status !== "approved") {
        router.replace("/onboarding")
        return
      }

      router.replace(
        user.role?.name === "admin"
          ? "/admin"
          : "/dashboard"
      )
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Login gagal")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="underline"
              disabled={loading}
            >
              Sign up
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
