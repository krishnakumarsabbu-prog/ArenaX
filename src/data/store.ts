import { create } from 'zustand'

export type NavPage =
  | 'dashboard'
  | 'ab-experiments'
  | 'ab-builder'
  | 'ab-cockpit'
  | 'ab-analytics'
  | 'cc-experiments'
  | 'cc-builder'
  | 'cc-cockpit'
  | 'cc-analytics'
  | 'settings'

interface AppState {
  activePage: NavPage
  activeModule: 'AB' | 'CC'
  selectedExperimentId: string | null
  selectedSessionId: string | null
  liveRequestCount: number
  liveErrorCount: number

  setPage: (page: NavPage) => void
  setModule: (m: 'AB' | 'CC') => void
  selectExperiment: (id: string | null) => void
  selectSession: (id: string | null) => void
  tickLive: () => void
}

export const useStore = create<AppState>((set) => ({
  activePage: 'dashboard',
  activeModule: 'AB',
  selectedExperimentId: null,
  selectedSessionId: null,
  liveRequestCount: 0,
  liveErrorCount: 0,

  setPage: (page) => set({ activePage: page }),
  setModule: (m) => set({ activeModule: m }),
  selectExperiment: (id) => set({ selectedExperimentId: id }),
  selectSession: (id) => set({ selectedSessionId: id }),
  tickLive: () =>
    set((s) => ({
      liveRequestCount: s.liveRequestCount + Math.floor(Math.random() * 8 + 2),
      liveErrorCount: s.liveErrorCount + (Math.random() > 0.9 ? 1 : 0),
    })),
}))
