import { useState } from 'react'
import { Plus, FlaskConical } from 'lucide-react'
import MetricCard from '@/components/shared/MetricCard'
import ExperimentTable from './ExperimentTable'
import ExperimentDetail from './ExperimentDetail'
import NewExperimentModal from './NewExperimentModal'
import AiInsightBox from '@/components/shared/AiInsightBox'
import EmptyState from '@/components/shared/EmptyState'
import { useExperiments, useAISynthesize } from '@/api/hooks/useExperiments'

export default function ABTestingTab() {
  const { data: experiments = [], isLoading } = useExperiments()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const { mutate: synthesize, isPending: aiLoading } = useAISynthesize()

  const running   = experiments.filter((e) => e.status === 'running').length
  const avgLift   = (() => {
    const withLift = experiments.filter((e) => e.leading_lift != null)
    if (!withLift.length) return 0
    return withLift.reduce((acc, e) => acc + (e.leading_lift ?? 0), 0) / withLift.length
  })()
  const sessions  = experiments.reduce((acc, e) => acc + e.total_sessions, 0)
  const concluded = experiments.filter((e) => e.status === 'concluded').length

  const selected = experiments.find((e) => e.id === selectedId) ?? null

  const topWithVerdict = experiments.find((e) => e.status === 'concluded' && e.ai_verdict)
  const topRunning     = experiments.find((e) => e.status === 'running')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Active experiments</h1>
          <p className="text-xs text-gray-400 mt-0.5">Bayesian adaptive testing with AI synthesis</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New experiment
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Active tests"        value={running}                      />
        <MetricCard label="Avg conversion lift" value={`+${avgLift.toFixed(1)}%`}   delta={avgLift > 0 ? 'up' : undefined} />
        <MetricCard label="Sessions captured"   value={sessions > 1000 ? `${(sessions / 1000).toFixed(1)}K` : sessions} />
        <MetricCard label="Concluded"           value={concluded}                    />
      </div>

      {experiments.length === 0 && !isLoading ? (
        <EmptyState
          icon={FlaskConical}
          title="No experiments yet"
          description="Create your first A/B experiment to start optimising conversion rates with Bayesian adaptive traffic allocation."
          action={{ label: 'New experiment', onClick: () => setShowNew(true) }}
        />
      ) : (
        <ExperimentTable
          experiments={experiments}
          loading={isLoading}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
        />
      )}

      {selected && (
        <ExperimentDetail
          experiment={selected}
          onClose={() => setSelectedId(null)}
        />
      )}

      {topWithVerdict?.ai_verdict && (
        <AiInsightBox
          color="blue"
          title="AI hypothesis verdict — concluded experiment"
          body={topWithVerdict.ai_verdict.verdict_summary}
          ctaLabel="View full analysis"
          onCta={() => setSelectedId(topWithVerdict.id)}
        />
      )}

      {topRunning && !topWithVerdict && (
        <AiInsightBox
          color="blue"
          title="Generate AI hypothesis verdict"
          body="Run an AI synthesis to get a data-driven verdict on your hypothesis, identify winning segments, and generate a next-test backlog."
          ctaLabel="Analyse running experiment"
          onCta={() => synthesize(topRunning.id)}
          loading={aiLoading}
        />
      )}

      {showNew && <NewExperimentModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
