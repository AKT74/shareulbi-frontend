export type UserType = "mahasiswa" | "dosen" | "others"

interface BaseRegisterPayload {
  fullname: string
  email: string
  password: string
  confirm_password: string
  user_type: UserType
}

export interface MahasiswaRegisterPayload extends BaseRegisterPayload {
  user_type: "mahasiswa"
  npm: string
  department_id: string
}

export interface DosenRegisterPayload extends BaseRegisterPayload {
  user_type: "dosen"
  nidn: string
  department_id: string
}

export interface OthersRegisterPayload extends BaseRegisterPayload {
  user_type: "others"
  occupation: string
}

export type RegisterPayload =
  | MahasiswaRegisterPayload
  | DosenRegisterPayload
  | OthersRegisterPayload
