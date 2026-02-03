import api from "./api"

export const getPendingUserCount = async () => {
  const res = await api.get("/admin/users/pending/count")
  return res.data // { count: number }
}
