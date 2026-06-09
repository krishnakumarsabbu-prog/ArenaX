import { Crown, TrendingUp, TrendingDown, Minus, Medal, Target } from 'lucide-react'
import { useLeaderboard } from '@/api/hooks/useLeaderboard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

interface Props {
  challengeId: string
}

const RANK_CONFIG = [
  { gradient: 'from-amber-400 to-yellow-300', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', medal: Crown, glow: 'shadow-amber-100' },
  { gradient: 'from-slate-400 to-gray-300',   text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', medal: Medal, glow: '' },
  { gradient: 'from-orange-400 to-amber-300', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', medal: Medal, glow: '' },
]

export default function Leaderboard({ challengeId }: Props) {
  const { data: rows = [], isLoading } = useLeaderboard(challengeId)

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card h-40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          <div className="text-sm text-gray-400">Loading leaderboard…</div>
        </div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-10 text-center">
        <Target className="w-8 h-8 text-gray-200 mx-auto mb-2" />
        <div className="text-sm font-medium text-gray-500">No scores yet</div>
        <div className="text-xs text-gray-400 mt-1">Advance a round to generate rankings</div>
      </div>
    )
  }

  const maxScore = Math.max(...rows.map((r) => r.composite_score), 1)

  // Chart data
  const cvrChartData = rows.map(r => ({
    name: r.team_name.length > 10 ? r.team_name.slice(0, 10) + '…' : r.team_name,
    cvr: r.cvr,
    score: r.composite_score,
  }))

  const cvrColors = ['#14B8A6', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-400 via-teal-500 to-cyan-400" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Overall leaderboard
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{rows.length} teams · Updated live</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Rankings list */}
        <div className="lg:col-span-2 px-6 py-4 space-y-0">
          {rows.map((row, i) => {
            const rankConf = RANK_CONFIG[i]
            const RankIcon = rankConf?.medal
            const isTop3 = i < 3

            return (
              <div
                key={row.team_id}
                className={`flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0 transition-all ${
                  isTop3 ? 'hover:bg-gray-50/50' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  rankConf ? `bg-gradient-to-br ${rankConf.gradient} text-white shadow-sm ${rankConf.glow}` : 'bg-gray-100 text-gray-500 font-bold'
                }`}>
                  {i + 1}
                </div>

                {/* Team info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-gray-900 truncate">{row.team_name}</div>
                    {i === 0 && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{row.team_url.replace(/^https?:\/\//, '')}</div>
                </div>

                {/* CVR */}
                <div className="hidden sm:flex flex-col items-end shrink-0">
                  <div className="text-xs text-gray-400">CVR</div>
                  <div className="text-sm font-bold text-gray-700 tabular-nums">{row.cvr.toFixed(2)}%</div>
                </div>

                {/* Score bar + value */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        i === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                        : i === 1 ? 'bg-gradient-to-r from-slate-400 to-gray-300'
                        : i === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-300'
                        : 'bg-teal-400'
                      }`}
                      style={{ width: `${(row.composite_score / maxScore) * 100}%` }}
                    />
                  </div>
                  <div className="text-base font-black text-gray-900 w-12 text-right tabular-nums">
                    {row.composite_score.toFixed(1)}
                  </div>
                </div>

                {/* Delta */}
                <div className="w-5 shrink-0">
                  {row.delta > 2 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : row.delta < -2 ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-300" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* CVR chart */}
        <div className="px-5 py-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">CVR by Team</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cvrChartData} barSize={28} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={30}
                tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E8F0' }}
                formatter={(v: number) => [`${v.toFixed(2)}%`, 'CVR']}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar dataKey="cvr" radius={[4,4,0,0]}>
                {cvrChartData.map((_, i) => (
                  <Cell key={i} fill={cvrColors[i % cvrColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top performers</div>
            {rows.slice(0, 3).map((row, i) => (
              <div key={row.team_id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white
                    bg-gradient-to-br ${RANK_CONFIG[i]?.gradient ?? 'bg-teal-500'}`}>
                    {i + 1}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{row.team_name}</span>
                </div>
                <span className="text-xs font-bold text-gray-900 tabular-nums">{row.composite_score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
