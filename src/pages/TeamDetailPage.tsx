import { useState } from 'react'
import { Users, BarChart2, TrendingUp, Globe, ChevronLeft } from 'lucide-react'
import { useStore } from '../data/store'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const teamHistory = Array.from({ length: 7 }, (_, i) => ({
  day: `Day ${i * 3 + 1}`,
  score: 70 + i * 3.5 + Math.random() * 2,
  sessions: 3000 + i * 700,
}))

export default function TeamDetailPage() {
  const { teams, leaderboard, selectedTeamId, setPage } = useStore()

  const team = selectedTeamId
    ? teams.find(t => t.id === selectedTeamId)
    : teams[0]

  const lb = leaderboard.find(r => r.team_id === (team?.id ?? ''))

  if (!team) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Select a team from the leaderboard</p>
          <button onClick={() => setPage('leaderboard')} className="btn-secondary mt-3">
            Go to Leaderboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <button onClick={() => setPage('leaderboard')}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to Leaderboard
      </button>

      {/* Team header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white"
          style={{ background: 'linear-gradient(135deg,#0D9488,#14B8A6)' }}>
          {team.name.split(' ')[1]?.[0] ?? 'T'}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-gray-900">{team.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-sm text-gray-500 font-mono">{team.url}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {team.members.map(m => (
              <div key={m} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700">
                  {m.split(' ').map(p => p[0]).join('')}
                </div>
                <span className="text-xs text-gray-600 font-medium">{m}</span>
              </div>
            ))}
          </div>
        </div>
        {lb && (
          <div className="text-right">
            <div className="text-3xl font-black text-gray-900 tabular-nums">{lb.composite_score}</div>
            <div className="text-xs text-gray-400">Composite Score</div>
            <div className="text-sm font-bold text-amber-600 mt-0.5">Rank #{lb.rank}</div>
          </div>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CVR', value: lb ? `${lb.cvr}%` : '—', icon: TrendingUp, color: '#059669' },
          { label: 'Total Sessions', value: lb ? lb.session_count.toLocaleString() : '—', icon: Users, color: '#2563EB' },
          { label: 'Latest Score', value: team.latest_score?.toFixed(1) ?? '—', icon: BarChart2, color: '#D97706' },
          { label: 'Team Size', value: String(team.members.length), icon: Users, color: '#7C3AED' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <m.icon className="w-5 h-5 mb-2" style={{ color: m.color }} />
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{m.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Score over time */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="text-sm font-bold text-gray-900 mb-4">Score Progression</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={teamHistory}>
            <defs>
              <linearGradient id="teamScoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} formatter={(v: number) => [v.toFixed(1), 'Score']} />
            <Area type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={2.5} fill="url(#teamScoreGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Strengths / areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <div className="text-xs font-bold text-green-800 uppercase tracking-wide mb-3">Strengths</div>
          <div className="space-y-2">
            {['High mobile conversion rate', 'Strong CTA click-through', 'Low bounce rate on landing page'].map(s => (
              <div key={s} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-xs text-green-800">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-3">Improvement Areas</div>
          <div className="space-y-2">
            {['Desktop checkout completion', 'Return visitor engagement', 'Form completion rate'].map(s => (
              <div key={s} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-xs text-amber-800">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
