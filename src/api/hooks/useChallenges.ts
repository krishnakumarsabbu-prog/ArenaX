import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { Challenge, ChallengeCreate, BracketData, Team } from '@/types'

export const useChallenges = () =>
  useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: () => api.get('/challenges').then((r) => r.data),
    refetchInterval: 15_000
  })

export const useBracket = (challengeId: string | null) =>
  useQuery<BracketData>({
    queryKey: ['bracket', challengeId],
    queryFn: () => api.get(`/challenges/${challengeId}/bracket`).then((r) => r.data),
    enabled: !!challengeId,
    refetchInterval: 10_000
  })

export const useTeams = (challengeId: string | null) =>
  useQuery<Team[]>({
    queryKey: ['teams', challengeId],
    queryFn: () => api.get(`/teams?challenge_id=${challengeId}`).then((r) => r.data),
    enabled: !!challengeId
  })

export const useCreateChallenge = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ChallengeCreate) => api.post('/challenges', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenges'] })
  })
}

export const useAdvanceRound = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (challengeId: string) =>
      api.post(`/challenges/${challengeId}/advance-round`).then((r) => r.data),
    onSuccess: (_d, challengeId) => {
      qc.invalidateQueries({ queryKey: ['bracket', challengeId] })
      qc.invalidateQueries({ queryKey: ['leaderboard', challengeId] })
      qc.invalidateQueries({ queryKey: ['challenges'] })
    }
  })
}

export const useCreateTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { challenge_id: string; name: string; url: string; members: string[] }) =>
      api.post('/teams', data).then((r) => r.data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['teams', vars.challenge_id] })
      qc.invalidateQueries({ queryKey: ['challenges'] })
    }
  })
}

export const useAIChampion = () =>
  useMutation({
    mutationFn: (data: { challenge_id: string; team_id: string }) =>
      api.post('/ai/champion', data).then((r) => r.data)
  })
