import { create } from 'zustand'

interface PortalState {
  activeTab: 'ab' | 'champion'
  selectedExperimentId: string | null
  selectedChallengeId: string | null
  liveEvents: Record<string, number>

  setTab: (tab: 'ab' | 'champion') => void
  selectExperiment: (id: string | null) => void
  selectChallenge: (id: string | null) => void
  incrementLiveEvent: (experimentId: string) => void
}

export const usePortalStore = create<PortalState>((set) => ({
  activeTab: 'ab',
  selectedExperimentId: null,
  selectedChallengeId: null,
  liveEvents: {},

  setTab: (tab) => set({ activeTab: tab }),
  selectExperiment: (id) => set({ selectedExperimentId: id }),
  selectChallenge: (id) => set({ selectedChallengeId: id }),
  incrementLiveEvent: (experimentId) =>
    set((state) => ({
      liveEvents: {
        ...state.liveEvents,
        [experimentId]: (state.liveEvents[experimentId] ?? 0) + 1
      }
    }))
}))
