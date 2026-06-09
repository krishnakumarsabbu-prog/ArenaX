import { useState } from 'react'
import { Plus, FlaskConical, TrendingUp, Activity, Target, CircleCheck as CheckCircle, BarChart3 } from 'lucide-react'
import MetricCard from '@/components/shared/MetricCard'
import ExperimentTable from './ExperimentTable'
import ExperimentDetail from './ExperimentDetail'
import NewExperimentModal from './NewExperimentModal'
import AiInsightBox from '@/components/shared/AiInsightBox'
import EmptyState from '@/components/shared/EmptyState'
import { useExperiments, useAISynthesize } from '@/api/hooks/useExperiments'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

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

  // Chart data: sessions per experiment
  const sessionChartData = experiments
    .filter(e => e.total_sessions > 0)
    .map(e => ({
      name: e.name.length > 18 ? e.name.slice(0, 18) + '…' : e.name,
      sessions: e.total_sessions,
      status: e.status,
    }))

  // Lift distribution chart
  const liftChartData = experiments
    .filter(e => e.leading_lift != null)
    .map(e => ({
      name: e.name.length > 14 ? e.name.slice(0, 14) + '…' : e.name,
      lift: e.leading_lift ?? 0,
    }))

  const statusColors: Record<string, string> = {
    running: '#3B82F6',
    concluded: '#F59E0B',
    paused: '#F97316',
    draft: '#94A3B8',
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">A/B Testing</h1>
          <p className="text-sm text-gray-400 mt-0.5">Bayesian adaptive experiments · AI-powered hypothesis auditing</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary shadow-md">
          <Plus className="w-4 h-4" />
          New experiment
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active tests"
          value={running}
          color="blue"
          trend={[2, 3, 2, 4, running]}
          icon={<Activity className="w-4 h-4 text-white" />}
          sub={running > 0 ? `${running} collecting data` : 'No active tests'}
        />
        <MetricCard
          label="Avg conversion lift"
          value={`${avgLift > 0 ? '+' : ''}${avgLift.toFixed(1)}%`}
          color={avgLift >= 0 ? 'green' : 'red'}
          delta={avgLift > 0 ? 'up' : avgLift < 0 ? 'down' : undefined}
          trend={[3.1, 4.2, 5.8, 4.9, avgLift]}
          icon={<TrendingUp className="w-4 h-4 text-white" />}
        />
        <MetricCard
          label="Sessions captured"
          value={sessions > 1000 ? `${(sessions / 1000).toFixed(1)}K` : sessions.toString()}
          color="teal"
          trend={[120, 280, 450, 620, sessions / 100]}
          icon={<Target className="w-4 h-4 text-white" />}
          sub="across all experiments"
        />
        <MetricCard
          label="Concluded"
          value={concluded}
          color="amber"
          trend={[1, 1, 2, 2, concluded]}
          icon={<CheckCircle className="w-4 h-4 text-white" />}
          sub="experiments completed"
        />
      </div>

      {/* Charts row */}
      {sessionChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sessions per experiment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-bold text-gray-900">Sessions by experiment</div>
                <div className="text-xs text-gray-400 mt-0.5">Total impressions collected</div>
              </div>
              <BarChart3 className="w-4 h-4 text-gray-300" />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={sessionChartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#F1F5F9' }}
                />
                <Bar dataKey="sessions" radius={[4,4,0,0]}>
                  {sessionChartData.map((entry, i) => (
                    <Cell key={i} fill={statusColors[entry.status] ?? '#94A3B8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {Object.entries(statusColors).map(([s, c]) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                  <span className="text-xs text-gray-400 capitalize">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion lift */}
          {liftChartData.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-bold text-gray-900">Conversion lift</div>
                  <div className="text-xs text-gray-400 mt-0.5">% vs control per experiment</div>
                </div>
                <TrendingUp className="w-4 h-4 text-gray-300" />
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={liftChartData} barSize={28}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={36}
                    tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                    formatter={(v: number) => [`${v > 0 ? '+' : ''}${v.toFixed(1)}%`, 'Lift']}
                    cursor={{ fill: '#F1F5F9' }}
                  />
                  <Bar dataKey="lift" radius={[4,4,0,0]}>
                    {liftChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.lift >= 0 ? '#22C55E' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <div className="text-xs text-gray-400">Lift data will appear once experiments run</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Experiments table or empty */}
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

      {/* Detail panel */}
      {selected && (
        <ExperimentDetail experiment={selected} onClose={() => setSelectedId(null)} />
      )}

      {/* AI insight */}
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
