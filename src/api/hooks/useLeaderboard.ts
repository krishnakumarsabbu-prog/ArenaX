import { useQuery } from '@tanstack/react-query'
import { api } from '../client'
import type { LeaderboardRow } from '@/types'

export const useLeaderboard = (challengeId: string | null) =>
  useQuery<LeaderboardRow[]>({
    queryKey: ['leaderboard', challengeId],
    queryFn: () => api.get(`/leaderboard/${challengeId}`).then((r) => r.data),
    enabled: !!challengeId,
    refetchInterval: 10_000
  })
