import { useAdvanceRound, useBracket } from '@/api/hooks/useChallenges'
import Badge from '@/components/shared/Badge'
import { ChevronRight, Loader2 } from 'lucide-react'
import type { BracketTeam } from '@/types'

interface Props {
  challengeId: string
}

export default function BracketView({ challengeId }: Props) {
  const { data: bracket, isLoading } = useBracket(challengeId)
  const { mutate: advance, isPending: advancing } = useAdvanceRound()

  if (isLoading || !bracket) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 h-40 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          Loading bracket…
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Live bracket — {bracket.name}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Round {bracket.current_round} of {bracket.total_rounds}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status="live" label={`Round ${bracket.current_round}`} />
          <button
            onClick={() => advance(challengeId)}
            disabled={advancing || bracket.current_round >= bracket.total_rounds}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {advancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronRight className="w-3 h-3" />}
            {advancing ? 'Processing…' : 'Advance round'}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {bracket.bracket.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-6">
            No teams registered yet. Add teams to begin the bracket.
          </div>
        ) : (
          bracket.bracket.map((pair, i) => (
            <div key={i} className="grid grid-cols-[1fr_40px_1fr] items-center gap-3">
              <TeamCard team={pair.team_a} leading={
                (pair.team_a?.score ?? 0) >= (pair.team_b?.score ?? 0) && pair.team_a != null
              } />
              <div className="text-center text-xs font-semibold text-gray-300">VS</div>
              <TeamCard team={pair.team_b} leading={
                (pair.team_b?.score ?? 0) > (pair.team_a?.score ?? 0)
              } />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function TeamCard({ team, leading }: { team?: BracketTeam; leading: boolean }) {
  if (!team) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-4 text-xs text-gray-400 text-center">
        TBD
      </div>
    )
  }

  return (
    <div className={`border rounded-xl p-4 transition-all ${
      leading ? 'border-teal-300 bg-teal-50/40 shadow-sm' : 'border-gray-100 bg-gray-50/40'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-900">{team.name}</span>
        {leading && (
          <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">
            Leading
          </span>
        )}
      </div>
      <div className="text-xs text-gray-400 mb-3 truncate">{team.url}</div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <StatMini label="CVR" value={team.cvr != null ? `${(team.cvr * 100).toFixed(2)}%` : '—'} highlight={leading} />
        <StatMini label="Sessions" value={team.sessions != null ? `${(team.sessions / 1000).toFixed(1)}K` : '—'} highlight={false} />
        <StatMini label="Score" value={team.score != null ? team.score.toFixed(1) : '—'} highlight={leading} />
      </div>
    </div>
  )
}

function StatMini({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-sm font-semibold ${highlight ? 'text-teal-700' : 'text-gray-700'}`}>{value}</div>
    </div>
  )
}
