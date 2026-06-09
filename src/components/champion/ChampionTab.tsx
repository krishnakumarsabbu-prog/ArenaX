import { useState, useEffect } from 'react'
import { Plus, Trophy, Swords, Star, Users, Award } from 'lucide-react'
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
  const topTeam   = leaderboard[0]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Challenge Champion</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tournament-style A/B competition · Live bracket scoring</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 active:bg-teal-800 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New challenge
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active challenges"
          value={running}
          color="teal"
          icon={<Swords className="w-4 h-4 text-white" />}
          trend={[1, 1, 2, running]}
          sub={running > 0 ? 'In progress' : 'None running'}
        />
        <MetricCard
          label="Participants"
          value={totalTeams}
          color="blue"
          icon={<Users className="w-4 h-4 text-white" />}
          trend={[2, 4, 6, totalTeams]}
          sub="teams competing"
        />
        <MetricCard
          label="Champions crowned"
          value={crowned}
          color="amber"
          icon={<Trophy className="w-4 h-4 text-white" />}
          trend={[0, 0, 1, crowned]}
          sub="challenges concluded"
        />
        <MetricCard
          label="Top score"
          value={topScore > 0 ? topScore.toFixed(1) : '—'}
          color="green"
          delta={topScore > 0 ? 'up' : undefined}
          icon={<Star className="w-4 h-4 text-white" />}
          sub={active?.top_team ? `by ${active.top_team}` : 'no scores yet'}
        />
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedId === c.id
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700 shadow-sm'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${selectedId === c.id ? 'text-white' : 'text-gray-400'}`} />
                {c.name}
                <Badge status={c.status} />
              </button>
            ))}
          </div>

          {active && (
            <>
              {/* Challenge info banner */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-500" />
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-bold text-gray-900">{active.name}</h2>
                      <Badge status={active.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Round {active.current_round} of {active.total_rounds}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {active.team_count} teams competing
                      </span>
                      {active.top_team && (
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Trophy className="w-3 h-3" />
                          Leading: {active.top_team}
                          {active.top_score != null && (
                            <span className="text-amber-500"> ({active.top_score.toFixed(1)} pts)</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Round progress */}
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1.5">Tournament progress</div>
                    <div className="flex gap-1.5">
                      {Array.from({ length: active.total_rounds }, (_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-2 rounded-full transition-all ${
                            i + 1 < active.current_round
                              ? 'bg-teal-500'
                              : i + 1 === active.current_round
                              ? 'bg-teal-300 animate-pulse'
                              : 'bg-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Round {active.current_round}/{active.total_rounds}</div>
                  </div>
                </div>
              </div>

              <BracketView challengeId={active.id} />
              <Leaderboard challengeId={active.id} />

              <AiInsightBox
                color="teal"
                title="AI competitive analysis"
                body={
                  active.ai_analysis?.gap_analysis ??
                  "Get an AI-powered competitive playbook for any team — gap analysis, quick wins, and strategic test ideas to close the performance gap."
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
