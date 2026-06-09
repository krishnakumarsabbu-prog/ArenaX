import { X, ExternalLink, BarChart2, Layers, Sparkles, Clock, Target } from 'lucide-react'
import { useState } from 'react'
import Badge from '@/components/shared/Badge'
import VariantPerformance from './VariantPerformance'
import SegmentBreakdown from './SegmentBreakdown'
import AiInsightBox from '@/components/shared/AiInsightBox'
import { useExperimentAnalytics, useAISynthesize } from '@/api/hooks/useExperiments'
import type { Experiment } from '@/types'

interface Props {
  experiment: Experiment
  onClose: () => void
}

type DetailTab = 'variants' | 'segments'

export default function ExperimentDetail({ experiment, onClose }: Props) {
  const { data: analytics, isLoading } = useExperimentAnalytics(experiment.id)
  const { mutate: synthesize, isPending: aiLoading } = useAISynthesize()
  const [tab, setTab] = useState<DetailTab>('variants')

  const createdDate = new Date(experiment.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden animate-slide-up">
      {/* Header with gradient accent */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-500" />
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge status={experiment.status} />
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                {experiment.goal_metric}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {createdDate}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{experiment.name}</h2>
            <a
              href={experiment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              {experiment.url}
            </a>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        <KpiCell label="Variants" value={experiment.variant_count.toString()} />
        <KpiCell label="Sessions" value={experiment.total_sessions.toLocaleString()} />
        <KpiCell
          label="Leading lift"
          value={experiment.leading_lift != null ? `${experiment.leading_lift > 0 ? '+' : ''}${experiment.leading_lift.toFixed(1)}%` : '—'}
          positive={experiment.leading_lift != null && experiment.leading_lift > 0}
        />
        <KpiCell
          label="Target progress"
          value={`${Math.min(100, Math.round(experiment.total_sessions / experiment.min_sessions * 100))}%`}
        />
      </div>

      {/* Hypothesis */}
      {experiment.hypothesis && (
        <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-100/60">
          <div className="flex items-start gap-2">
            <Target className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-blue-700 mb-0.5">Hypothesis</div>
              <p className="text-xs text-blue-600 leading-relaxed">{experiment.hypothesis}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="px-6 pt-4 flex gap-5 border-b border-gray-100">
        {([['variants', BarChart2, 'Variant Performance'], ['segments', Layers, 'Segment Breakdown']] as const).map(
          ([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 pb-3.5 text-xs font-bold border-b-2 transition-all duration-150 uppercase tracking-wider ${
                tab === id
                  ? 'text-blue-700 border-blue-600'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          )
        )}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {isLoading ? (
          <div className="h-40 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <div className="text-sm text-gray-400">Loading analytics data…</div>
          </div>
        ) : analytics ? (
          <>
            {tab === 'variants' && <VariantPerformance analytics={analytics} />}
            {tab === 'segments' && <SegmentBreakdown analytics={analytics} />}
          </>
        ) : (
          <div className="text-sm text-gray-400 py-10 text-center">
            <BarChart2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            No data yet — start the experiment to begin collecting sessions.
          </div>
        )}
      </div>

      {/* AI Verdict */}
      <div className="px-6 pb-6">
        {experiment.ai_verdict ? (
          <div className="space-y-4">
            <AiInsightBox
              color="blue"
              title="AI verdict"
              body={experiment.ai_verdict.verdict_summary}
              ctaLabel="Regenerate analysis"
              onCta={() => synthesize(experiment.id)}
              loading={aiLoading}
            />
            {experiment.ai_verdict.next_tests?.length > 0 && (
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Next test ideas
                </div>
                <div className="space-y-2">
                  {experiment.ai_verdict.next_tests.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs text-blue-700 leading-relaxed">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <AiInsightBox
            color="blue"
            title="Generate AI analysis"
            body="Get a data-driven hypothesis verdict, key segment insights, and a next-test backlog generated by AI."
            ctaLabel="Run AI synthesis"
            onCta={() => synthesize(experiment.id)}
            loading={aiLoading}
          />
        )}
      </div>
    </div>
  )
}

function KpiCell({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="px-5 py-3.5 text-center">
      <div className="text-xs text-gray-400 font-medium mb-1">{label}</div>
      <div className={`text-base font-bold tabular-nums ${
        positive === true ? 'text-green-600' : positive === false ? 'text-red-500' : 'text-gray-900'
      }`}>
        {value}
      </div>
    </div>
  )
}
