import { useAdvanceRound, useBracket } from '@/api/hooks/useChallenges'
import Badge from '@/components/shared/Badge'
import { ChevronRight, Loader, Swords, TrendingUp, Users } from 'lucide-react'
import type { BracketTeam } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

interface Props {
  challengeId: string
}

export default function BracketView({ challengeId }: Props) {
  const { data: bracket, isLoading } = useBracket(challengeId)
  const { mutate: advance, isPending: advancing } = useAdvanceRound()

  if (isLoading || !bracket) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          <div className="text-sm text-gray-400">Loading bracket…</div>
        </div>
      </div>
    )
  }

  // Prepare score comparison data
  const allTeams = bracket.bracket.flatMap(p => [p.team_a, p.team_b].filter(Boolean)) as BracketTeam[]
  const scoreData = allTeams
    .filter(t => t.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map(t => ({
      name: t.name.length > 12 ? t.name.slice(0, 12) + '…' : t.name,
      score: t.score ?? 0,
      cvr: t.cvr != null ? +(t.cvr * 100).toFixed(2) : 0,
    }))

  const teamColors = ['#14B8A6', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-400" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Swords className="w-4 h-4 text-teal-600" />
            Live bracket — {bracket.name}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Round {bracket.current_round} of {bracket.total_rounds}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status="live" label={`Round ${bracket.current_round}`} />
          <button
            onClick={() => advance(challengeId)}
            disabled={advancing || bracket.current_round >= bracket.total_rounds}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
          >
            {advancing ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
            {advancing ? 'Computing scores…' : 'Advance round'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {bracket.bracket.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-500">No teams registered yet</div>
            <div className="text-xs text-gray-400 mt-1">Add teams to begin the bracket</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bracket matchups */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Matchups</div>
              {bracket.bracket.map((pair, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-xs text-gray-400 font-medium mb-2">Match {i + 1}</div>
                  <div className="grid grid-cols-[1fr_36px_1fr] items-center gap-2">
                    <TeamCard team={pair.team_a} leading={
                      (pair.team_a?.score ?? 0) >= (pair.team_b?.score ?? 0) && pair.team_a != null
                    } colorIdx={i * 2} />
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="text-xs font-black text-gray-300">VS</div>
                    </div>
                    <TeamCard team={pair.team_b} leading={
                      (pair.team_b?.score ?? 0) > (pair.team_a?.score ?? 0)
                    } colorIdx={i * 2 + 1} />
                  </div>
                </div>
              ))}
            </div>

            {/* Score comparison chart */}
            {scoreData.length > 0 && (
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Score comparison</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={scoreData} barSize={32} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}
                      formatter={(v: number) => [v.toFixed(1), 'Score']}
                      cursor={{ fill: '#F8FAFC' }}
                    />
                    <Bar dataKey="score" radius={[0,4,4,0]}>
                      {scoreData.map((_, i) => (
                        <Cell key={i} fill={teamColors[i % teamColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TeamCard({ team, leading, colorIdx }: { team?: BracketTeam; leading: boolean; colorIdx: number }) {
  const teamColors = ['#14B8A6', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981']
  const color = teamColors[colorIdx % teamColors.length]

  if (!team) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-3.5 text-xs text-gray-400 text-center bg-gray-50/30">
        TBD
      </div>
    )
  }

  return (
    <div className={`relative border-2 rounded-xl p-3.5 transition-all duration-200 overflow-hidden ${
      leading
        ? 'border-teal-300 bg-teal-50/50 shadow-md'
        : 'border-gray-150 bg-gray-50/30'
    }`}>
      {/* Color accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />

      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ background: color }}>
            {team.name.slice(0, 1)}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 leading-tight">{team.name}</div>
            {leading && (
              <span className="text-xs text-teal-600 font-semibold">Leading ↑</span>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-3 truncate">{team.url.replace(/^https?:\/\//, '')}</div>

      <div className="grid grid-cols-3 gap-1.5">
        <StatMini label="CVR" value={team.cvr != null ? `${(team.cvr * 100).toFixed(1)}%` : '—'} highlight={leading} />
        <StatMini label="Sessions" value={team.sessions != null ? `${team.sessions >= 1000 ? `${(team.sessions / 1000).toFixed(1)}K` : team.sessions}` : '—'} highlight={false} />
        <StatMini label="Score" value={team.score != null ? team.score.toFixed(1) : '—'} highlight={leading} />
      </div>
    </div>
  )
}

function StatMini({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div className="bg-white/60 rounded-lg px-2 py-1.5 text-center">
      <div className="text-xs text-gray-400 leading-tight">{label}</div>
      <div className={`text-sm font-bold tabular-nums leading-tight mt-0.5 ${highlight ? 'text-teal-700' : 'text-gray-700'}`}>
        {value}
      </div>
    </div>
  )
}
