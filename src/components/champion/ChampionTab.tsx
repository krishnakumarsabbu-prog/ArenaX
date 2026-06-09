import { useState, useEffect } from 'react'
import { Plus, Trophy } from 'lucide-react'
import MetricCard from '@/components/shared/MetricCard'
import BracketView from './BracketView'
import Leaderboard from './Leaderboard'
import NewChallengeModal from './NewChallengeModal'
import AiInsightBox from '@/components/shared/AiInsightBox'
import EmptyState from '@/components/shared/EmptyState'
import Badge from '@/components/shared/Badge'
import { useChallenges, useAIChampion } from '@/api/hooks/useChallenges'
import { useLeaderboard } from '@/api/hooks/useLeaderboard'

export default function ChampionTab() {
  const { data: challenges = [], isLoading } = useChallenges()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const { mutate: aiChampion, isPending: aiLoading } = useAIChampion()

  const { data: leaderboard = [] } = useLeaderboard(selectedId)

  useEffect(() => {
    if (!selectedId && challenges.length > 0) {
      setSelectedId(challenges[0].id)
    }
  }, [challenges, selectedId])

  const active    = challenges.find((c) => c.id === selectedId)
  const running   = challenges.filter((c) => c.status === 'running').length
  const totalTeams= challenges.reduce((a, c) => a + c.team_count, 0)
  const crowned   = challenges.filter((c) => c.status === 'concluded').length
  const topScore  = Math.max(...challenges.map((c) => c.top_score ?? 0), 0)

  const topTeam = leaderboard[0]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Active challenges</h1>
          <p className="text-xs text-gray-400 mt-0.5">Tournament-style A/B competition with live scoring</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
          <Plus className="w-4 h-4" /> New challenge
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Active challenges" value={running}                            />
        <MetricCard label="Participants"      value={totalTeams}                         />
        <MetricCard label="Champions crowned" value={crowned}                            />
        <MetricCard label="Top score"         value={topScore > 0 ? topScore.toFixed(1) : '—'} delta={topScore > 0 ? 'up' : undefined} />
      </div>

      {challenges.length === 0 && !isLoading ? (
        <EmptyState
          icon={Trophy}
          title="No challenges yet"
          description="Create a Challenge Champion tournament to pit teams against each other using real A/B test performance metrics."
          action={{ label: 'New challenge', onClick: () => setShowNew(true) }}
        />
      ) : (
        <>
          {/* Challenge selector */}
          <div className="flex gap-2 flex-wrap">
            {challenges.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedId === c.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700'
                }`}
              >
                {c.name}
                <Badge status={c.status} />
              </button>
            ))}
          </div>

          {active && (
            <>
              {/* Challenge meta */}
              <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between shadow-card">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{active.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Round {active.current_round} of {active.total_rounds} · {active.team_count} teams
                    {active.top_team && <> · <span className="text-amber-600">Leading: {active.top_team}</span></>}
                  </div>
                </div>
                <Badge status={active.status} />
              </div>

              <BracketView challengeId={active.id} />
              <Leaderboard challengeId={active.id} />

              <AiInsightBox
                color="teal"
                title="AI competitive analysis"
                body={
                  active.ai_analysis?.gap_analysis ??
                  "Get an AI-powered competitive playbook for any team — gap analysis, quick wins, and strategic test ideas."
                }
                ctaLabel="Generate strategy for leader"
                onCta={() => {
                  if (topTeam) {
                    aiChampion({ challenge_id: active.id, team_id: topTeam.team_id })
                  }
                }}
                loading={aiLoading}
              />
            </>
          )}
        </>
      )}

      {showNew && <NewChallengeModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
