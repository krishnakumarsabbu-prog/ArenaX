import axios from 'axios'
import type {
  ABExperiment, CCExperiment, ABSession, CCSession,
  ABAnalytics, CCAnalytics, DashboardSummary,
} from '../types'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (r) => r,
  (e) => {
    console.error('[XTest API]', e.response?.data ?? e.message)
    return Promise.reject(e)
  }
)

// ── A/B Experiments ───────────────────────────────────────────────────────────

export const abApi = {
  list: () => api.get<ABExperiment[]>('/ab/'),
  get: (id: string) => api.get<ABExperiment>(`/ab/${id}`),
  create: (data: object) => api.post<ABExperiment>('/ab/', data),
  update: (id: string, data: object) => api.patch<ABExperiment>(`/ab/${id}`, data),
  delete: (id: string) => api.delete(`/ab/${id}`),
}

// ── CC Experiments ────────────────────────────────────────────────────────────

export const ccApi = {
  list: () => api.get<CCExperiment[]>('/cc/'),
  get: (id: string) => api.get<CCExperiment>(`/cc/${id}`),
  create: (data: object) => api.post<CCExperiment>('/cc/', data),
  update: (id: string, data: object) => api.patch<CCExperiment>(`/cc/${id}`, data),
  delete: (id: string) => api.delete(`/cc/${id}`),
}

// ── Execution ─────────────────────────────────────────────────────────────────

export const execApi = {
  abExecute: (data: { experiment_id: string; n?: number; request_body?: object }) =>
    api.post<ABSession>('/exec/ab/execute', data),
  abRunMore: (sessionId: string, n: number) =>
    api.post<ABSession>(`/exec/ab/sessions/${sessionId}/run`, null, { params: { n } }),
  abSessions: (experimentId: string) =>
    api.get<ABSession[]>('/exec/ab/sessions', { params: { experiment_id: experimentId } }),
  abSession: (sessionId: string) =>
    api.get<ABSession>(`/exec/ab/sessions/${sessionId}`),

  ccExecute: (data: { experiment_id: string; request_body?: object }) =>
    api.post<CCSession>('/exec/cc/execute', data),
  ccSessions: (experimentId: string) =>
    api.get<CCSession[]>('/exec/cc/sessions', { params: { experiment_id: experimentId } }),
  ccSession: (sessionId: string) =>
    api.get<CCSession>(`/exec/cc/sessions/${sessionId}`),

  recent: (limit?: number) =>
    api.get('/exec/recent', { params: { limit } }),
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export const analyticsApi = {
  ab: (expId: string) => api.get<ABAnalytics>(`/analytics/ab/${expId}`),
  cc: (expId: string) => api.get<CCAnalytics>(`/analytics/cc/${expId}`),
  summary: () => api.get<DashboardSummary>('/analytics/summary'),
}
