import { TrendingUp, TrendingDown, Users, Globe, Trophy, Activity, Minus } from 'lucide-react'
import type { LeaderboardRow } from '@/types'

interface Props {
  row: LeaderboardRow
  rank: number
  maxScore: number
  isSelected?: boolean
  onClick?: () => void
}

const MEDAL_COLORS = [
  { ring: 'ring-amber-300',  badge: 'bg-gradient-to-br from-amber-400 to-yellow-300', text: 'text-white' },
  { ring: 'ring-slate-300',  badge: 'bg-gradient-to-br from-slate-400 to-gray-300',   text: 'text-white' },
  { ring: 'ring-orange-300', badge: 'bg-gradient-to-br from-orange-400 to-amber-300', text: 'text-white' },
]

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 2)  return <TrendingUp  className="w-3.5 h-3.5 text-green-500" />
  if (delta < -2) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />
  return <Minus className="w-3.5 h-3.5 text-gray-300" />
}

export default function ChallengerCard({ row, rank, maxScore, isSelected, onClick }: Props) {
  const medal = MEDAL_COLORS[rank - 1]
  const scorePct = maxScore > 0 ? (row.composite_score / maxScore) * 100 : 0
  const cvrDisplay = row.cvr.toFixed(2)

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-teal-300 shadow-lg ring-2 ring-teal-200'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top accent strip */}
      <div className={`h-1 ${
        rank === 1 ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
        : rank === 2 ? 'bg-gradient-to-r from-slate-400 to-gray-300'
        : rank === 3 ? 'bg-gradient-to-r from-orange-400 to-amber-300'
        : 'bg-gradient-to-r from-teal-400 to-cyan-400'
      }`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Rank badge */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-sm ${
              medal ? `${medal.badge} ${medal.text} ${medal.ring} ring-1` : 'bg-gray-100 text-gray-600'
            }`}>
              {rank === 1 ? <Trophy className="w-4 h-4" /> : rank}
            </div>

            {/* Team name + URL */}
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900 leading-tight truncate">{row.team_name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <Globe className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="text-xs text-gray-400 truncate">{row.team_url.replace(/^https?:\/\//, '')}</span>
              </div>
            </div>
          </div>

          {/* Delta indicator */}
          <div className="flex items-center gap-1 shrink-0 bg-gray-50 rounded-lg px-2 py-1">
            <DeltaIcon delta={row.delta} />
            {row.delta !== 0 && (
              <span className={`text-xs font-bold ${row.delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {row.delta > 0 ? '+' : ''}{row.delta.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <MetricCell
            icon={<Activity className="w-3 h-3" />}
            label="CVR"
            value={`${cvrDisplay}%`}
            highlight
          />
          <MetricCell
            icon={<Users className="w-3 h-3" />}
            label="Sessions"
            value={row.session_count >= 1000 ? `${(row.session_count / 1000).toFixed(1)}K` : String(row.session_count)}
          />
          <MetricCell
            icon={<Trophy className="w-3 h-3" />}
            label="Score"
            value={row.composite_score.toFixed(1)}
            highlight
          />
        </div>

        {/* Score bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Composite score</span>
            <span className="text-xs font-bold text-gray-700 tabular-nums">{row.composite_score.toFixed(1)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                rank === 1 ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                : rank === 2 ? 'bg-gradient-to-r from-slate-400 to-gray-300'
                : rank === 3 ? 'bg-gradient-to-r from-orange-400 to-amber-300'
                : 'bg-gradient-to-r from-teal-400 to-cyan-500'
              }`}
              style={{ width: `${Math.max(scorePct, 4)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCell({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="bg-gray-50 rounded-xl px-2.5 py-2 text-center">
      <div className="flex items-center justify-center gap-1 mb-0.5 text-gray-400">{icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-sm font-bold tabular-nums ${highlight ? 'text-teal-700' : 'text-gray-700'}`}>
        {value}
      </div>
    </div>
  )
}
