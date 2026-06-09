import { TrendingUp, TrendingDown, Minus, Trophy, Users, BarChart2 } from 'lucide-react'
import { useStore } from '../data/store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-amber-900 rank-gold flex-shrink-0">1</div>
  )
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-slate-700 rank-silver flex-shrink-0">2</div>
  )
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-amber-900 rank-bronze flex-shrink-0">3</div>
  )
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 bg-gray-100 flex-shrink-0">{rank}</div>
  )
}

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp className="w-3.5 h-3.5 text-green-500" />
  if (delta < 0) return <TrendingDown className="w-3.5 h-3.5 text-red-500" />
  return <Minus className="w-3.5 h-3.5 text-gray-400" />
}

export default function LeaderboardPage() {
  const { leaderboard, setPage, selectTeam } = useStore()

  const chartData = leaderboard.slice(0, 6).map(r => ({
    name: r.team_name.replace('Team ', ''),
    score: r.composite_score,
    cvr: r.cvr,
  }))

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">Q2 Conversion Sprint · Round 2</p>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((row, i) => {
          const podiumOrder = [1, 0, 2]
          const team = leaderboard[podiumOrder[i]]
          return (
            <div key={team.team_id}
              className={`rounded-2xl p-5 text-center cursor-pointer hover:shadow-md transition-all
                ${team.rank === 1 ? 'bg-gradient-to-b from-amber-50 to-white border-2 border-amber-200' : 'bg-white border border-gray-100 shadow-sm'}`}
              onClick={() => { selectTeam(team.team_id); setPage('team-detail') }}>
              <RankBadge rank={team.rank} />
              <div className="mt-2 text-sm font-bold text-gray-900">{team.team_name}</div>
              <div className="text-2xl font-black text-gray-900 tabular-nums mt-1">{team.composite_score}</div>
              <div className="text-xs text-gray-400 mt-0.5">CVR: {team.cvr}%</div>
              <div className="text-xs text-gray-400">{team.session_count.toLocaleString()} sessions</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Full table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50">
            <div className="text-sm font-bold text-gray-900">All Teams</div>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th className="text-right">Score</th>
                <th className="text-right">CVR</th>
                <th className="text-right">Sessions</th>
                <th className="text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.team_id}
                  className="cursor-pointer"
                  onClick={() => { selectTeam(row.team_id); setPage('team-detail') }}>
                  <td><RankBadge rank={row.rank} /></td>
                  <td>
                    <div className="text-sm font-semibold text-gray-900">{row.team_name}</div>
                    <div className="text-xs text-gray-400 font-mono">{row.team_url}</div>
                  </td>
                  <td className="text-right">
                    <span className="text-sm font-bold text-gray-900 tabular-nums">{row.composite_score}</span>
                  </td>
                  <td className="text-right">
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">{row.cvr}%</span>
                  </td>
                  <td className="text-right">
                    <span className="text-sm text-gray-600 tabular-nums">{row.session_count.toLocaleString()}</span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DeltaIcon delta={row.delta} />
                      {row.delta !== 0 && (
                        <span className={`text-xs font-semibold ${row.delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {Math.abs(row.delta)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Score chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm font-bold text-gray-900 mb-4">Score Distribution</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
              <Bar dataKey="score" fill="#F59E0B" radius={[0, 6, 6, 0]} name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
