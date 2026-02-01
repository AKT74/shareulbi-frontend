import api from "./api"

export interface Department {
  id: string
  name: string
}

export const getDepartments = async (): Promise<Department[]> => {
  const res = await api.get("/departments")
  return res.data
}
