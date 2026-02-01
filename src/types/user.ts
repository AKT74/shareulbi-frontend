// types/user.ts
export interface UserDetail {
  id: string
  fullname: string
  email: string
  role_id: string
  department_id: string | null
  avatar_url: string | null
  bio: string | null
  personal_link: string | null
  is_active: boolean
  user_type: "mahasiswa" | "dosen" | "others"
  npm: string | null
  nidn: string | null
  occupation: string | null
}
