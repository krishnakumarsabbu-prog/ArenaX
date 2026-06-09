import { Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useLeaderboard } from '@/api/hooks/useLeaderboard'

interface Props {
  challengeId: string
}

export default function Leaderboard({ challengeId }: Props) {
  const { data: rows = [], isLoading } = useLeaderboard(challengeId)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 h-32 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          Loading leaderboard…
        </div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
        No scores yet — advance a round to generate rankings.
      </div>
    )
  }

  const maxScore = Math.max(...rows.map((r) => r.composite_score), 1)

  const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700']
  const rankBg     = ['bg-amber-50 border-amber-200', 'bg-gray-50 border-gray-200', 'bg-orange-50 border-orange-200']

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Overall leaderboard</h2>
        <div className="text-xs text-gray-400">{rows.length} teams</div>
      </div>

      <div className="px-5 py-2">
        {rows.map((row, i) => (
          <div
            key={row.team_id}
            className={`flex items-center gap-3 py-3 border-b border-gray-50 last:border-0`}
          >
            {/* Rank */}
            <div className={`w-6 text-sm font-bold ${rankColors[i] ?? 'text-gray-400'}`}>
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold ${rankBg[i] ?? 'bg-gray-100 border-gray-200'} ${rankColors[i] ?? 'text-gray-500'}`}>
              {row.team_name.slice(0, 2).toUpperCase()}
            </div>

            {/* Name & URL */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{row.team_name}</div>
              <div className="text-xs text-gray-400 truncate">{row.team_url}</div>
            </div>

            {/* CVR */}
            <div className="hidden sm:block text-xs text-gray-500 w-16 text-right">
              <div className="text-gray-400">CVR</div>
              <div className="font-medium text-gray-700">{row.cvr}%</div>
            </div>

            {/* Score bar + number */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-700"
                  style={{ width: `${(row.composite_score / maxScore) * 100}%` }}
                />
              </div>
              <div className="text-sm font-semibold text-gray-900 w-10 text-right">
                {row.composite_score.toFixed(1)}
              </div>
            </div>

            {/* Delta icon */}
            {i === 0 ? (
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
            ) : row.delta > 0.5 ? (
              <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
            ) : row.delta < -0.5 ? (
              <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <Minus className="w-4 h-4 text-gray-300 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
