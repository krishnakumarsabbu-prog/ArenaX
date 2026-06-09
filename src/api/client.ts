import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  (r) => r,
  (e) => {
    console.error('[XTest API]', e.response?.data ?? e.message)
    return Promise.reject(e)
  }
)
