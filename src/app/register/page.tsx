"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Swal from "sweetalert2"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { register } from "@/services/auth.service";
import { getDepartments, Department } from "@/services/department.service";

import type { RegisterPayload, UserType } from "@/types/register";

export default function RegisterPage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<RegisterPayload>({
    user_type: "mahasiswa",
    fullname: "",
    email: "",
    password: "",
    confirm_password: "",
    npm: "",
    department_id: "",
  });

  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  const validateForm = (): string | null => {
    // password match
    if (form.password !== form.confirm_password) {
      return "Password dan konfirmasi password tidak sama";
    }

    // email domain validation
    if (form.user_type === "mahasiswa") {
      if (!form.email.endsWith("@std.ulbi.ac.id")) {
        return "Email mahasiswa harus menggunakan @std.ulbi.ac.id";
      }
    }

    if (form.user_type === "dosen") {
      if (!form.email.endsWith("@ulbi.ac.id")) {
        return "Email dosen harus menggunakan @ulbi.ac.id";
      }
    }

    return null;
  };

  const handleSubmit = async () => {
  const validationError = validateForm()
  if (validationError) {
    Swal.fire({
      icon: "warning",
      title: "Validasi gagal",
      text: validationError,
    })
    return
  }

  if (loading) return
  setLoading(true)

  Swal.fire({
    title: "Mendaftarkan akun...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  try {
    await register(form)

    Swal.close()

    await Swal.fire({
      icon: "success",
      title: "Registrasi berhasil",
      text: "Silakan menunggu proses verifikasi",
      confirmButtonText: "OK",
    })

    router.push("/onboarding")
  } catch (err: unknown) {
    Swal.close()

    let message = "Registrasi gagal"

    if (typeof err === "object" && err !== null && "response" in err) {
      const res = (
        err as { response?: { data?: { message?: string } } }
      ).response
      message = res?.data?.message ?? message
    }

    Swal.fire({
      icon: "error",
      title: "Registrasi gagal",
      text: message,
    })
  } finally {
    setLoading(false)
  }
}



  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Register to access ShareULBI</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
        
          <Input
            placeholder="Full Name"
            value={form.fullname}
            onChange={(e) =>
              setForm((p) => ({ ...p, fullname: e.target.value }))
            }
          />

          {/* USER TYPE */}
          <div className="space-y-2">
            <Label>User Type</Label>
            <RadioGroup
              value={form.user_type}
              onValueChange={(val: UserType) => {
                if (val === "mahasiswa") {
                  setForm({
                    user_type: "mahasiswa",
                    fullname: form.fullname,
                    email: "",
                    password: form.password,
                    confirm_password: form.confirm_password,
                    npm: "",
                    department_id: "",
                  });
                } else if (val === "dosen") {
                  setForm({
                    user_type: "dosen",
                    fullname: form.fullname,
                    email: "",
                    password: form.password,
                    confirm_password: form.confirm_password,
                    nidn: "",
                    department_id: "",
                  });
                } else {
                  setForm({
                    user_type: "others",
                    fullname: form.fullname,
                    email: "",
                    password: form.password,
                    confirm_password: form.confirm_password,
                    occupation: "",
                  });
                }
              }}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="mahasiswa" id="mahasiswa" />
                <Label htmlFor="mahasiswa">Mahasiswa</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="dosen" id="dosen" />
                <Label htmlFor="dosen">Dosen</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="others" id="others" />
                <Label htmlFor="others">Others</Label>
              </div>
            </RadioGroup>
          </div>

          {/* MAHASISWA */}
          {form.user_type === "mahasiswa" && (
            <>
              <Input
                placeholder="NPM"
                inputMode="numeric"
                value={form.npm}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    npm: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />

              <Input
                placeholder="Email (@std.ulbi.ac.id)"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />

              <Select
                onValueChange={(val: string) =>
                  setForm((p) => ({
                    ...p,
                    department_id: val,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jurusan" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {/* DOSEN */}
          {form.user_type === "dosen" && (
            <>
              <Input
                placeholder="NIDN"
                inputMode="numeric"
                value={form.nidn}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    nidn: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />

              <Input
                placeholder="Email (@ulbi.ac.id)"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />

              <Select
                onValueChange={(val: string) =>
                  setForm((p) => ({
                    ...p,
                    department_id: val,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jurusan" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {/* OTHERS */}
          {form.user_type === "others" && (
            <>
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />

              <Input
                placeholder="Occupation"
                value={form.occupation}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    occupation: e.target.value,
                  }))
                }
              />
            </>
          )}

          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
          />

          <Input
            type="password"
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                confirm_password: e.target.value,
              }))
            }
          />

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => router.push("/login")} className="underline">
              Login
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
