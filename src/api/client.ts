import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('_xt_api_token') : null
  if (token) {
    config.headers['X-API-Token'] = token
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (e) => {
    console.error('[XTest API]', e.response?.data ?? e.message)
    return Promise.reject(e)
  }
)

// ── Security API helpers ──────────────────────────────────────────────────────

export const securityApi = {
  listPermissions: () => api.get('/security/permissions'),
  listRoles: () => api.get('/security/roles'),
  getRole: (id: string) => api.get(`/security/roles/${id}`),
  createRole: (data: object) => api.post('/security/roles', data),
  deleteRole: (id: string) => api.delete(`/security/roles/${id}`),

  assignRole: (userId: string, data: object) => api.post(`/security/users/${userId}/roles`, data),
  removeRole: (userId: string, roleId: string) => api.delete(`/security/users/${userId}/roles/${roleId}`),
  getUserPermissions: (userId: string) => api.get(`/security/users/${userId}/permissions`),

  listTokens: () => api.get('/security/tokens'),
  createToken: (data: object) => api.post('/security/tokens', data),
  revokeToken: (id: string) => api.delete(`/security/tokens/${id}`),

  listAuditLogs: (params?: { resource?: string; user_id?: string; limit?: number; offset?: number }) =>
    api.get('/security/audit-logs', { params }),

  checkRateLimit: (data: object) => api.post('/security/rate-limit/check', data),
  getRateLimitStatus: (key: string) => api.get('/security/rate-limit/status', { params: { key } }),
}
