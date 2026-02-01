import api from "./api"

export const getPosts = async () => {
  const response = await api.get("/posts")
  return response.data
}

export const getPostById = async (id: string) => {
  const response = await api.get(`/posts/${id}`)
  return response.data
}
