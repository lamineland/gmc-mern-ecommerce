import axios, { isAxiosError } from 'axios'

export const TOKEN_KEY = 'token'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function errorMessage(err: unknown): string {
  if (isAxiosError(err)) return err.response?.data?.message ?? err.message
  return err instanceof Error ? err.message : 'Something went wrong'
}

export default api
