import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Zap, ChevronRight, Clock } from 'lucide-react'
import { useStore } from '../data/store'
import { AIInsight } from '../types'

const CONF_STYLES = {
  high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

function InsightCard({ insight, onViewExperiment }: { insight: AIInsight; onViewExperiment: () => void }) {
  return (
    <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-200 truncate">{insight.experiment_name}</div>
            <div className="flex items-center gap-2 mt-1.5">
              {insight.winner_variant && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-emerald-400 font-medium">Winner: {insight.winner_variant}</span>
                </div>
              )}
              <span className="text-[10px] text-slate-600">
                {new Date(insight.generated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${CONF_STYLES[insight.confidence]}`}>
              {insight.confidence} confidence
            </span>
          </div>
        </div>
      </div>

      {/* Winner reason */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap className="w-3 h-3 text-blue-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{insight.winner_reason}</p>
        </div>
      </div>

      {/* Risk warnings */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Warnings</div>
        <div className="space-y-1.5">
          {insight.risk_warnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-2 text-xs ${
              w.includes('No significant') ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {w.includes('No significant') ? (
                <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              )}
              <span>{w}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance summary */}
      <div className="px-5 py-3 border-b border-white/5 bg-white/[0.01]">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Performance Summary</div>
        <p className="text-xs text-slate-400 leading-relaxed">{insight.performance_summary}</p>
      </div>

      {/* Recommendation */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Recommendation</div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">{insight.recommendation}</p>
      </div>

      {/* Next experiments */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Suggested Next Experiments</div>
        <ul className="space-y-1.5">
          {insight.suggested_next_experiments.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <Clock className="w-3 h-3" />
          Generated {new Date(insight.generated_at).toLocaleString()}
        </div>
        <button
          onClick={onViewExperiment}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          View experiment <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default function AIInsightsPage() {
  const { aiInsights, selectExperiment, setPage } = useStore()

  const highConf = aiInsights.filter((i) => i.confidence === 'high')
  const medConf = aiInsights.filter((i) => i.confidence === 'medium')
  const winners = aiInsights.filter((i) => i.winner_variant !== null)

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">AI Insights</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            AI-driven winner detection, risk analysis, and strategic recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">{winners.length} winners declared</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-blue-400 font-semibold">{highConf.length} high confidence</span>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Insights', value: aiInsights.length, color: 'text-blue-400' },
          { label: 'High Confidence', value: highConf.length, color: 'text-emerald-400' },
          { label: 'Medium Confidence', value: medConf.length, color: 'text-amber-400' },
          { label: 'Winners Found', value: winners.length, color: 'text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0D1117] border border-white/5 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Insights grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {aiInsights.map((insight) => (
          <InsightCard
            key={insight.experiment_id}
            insight={insight}
            onViewExperiment={() => {
              selectExperiment(insight.experiment_id)
              setPage('cockpit')
            }}
          />
        ))}
      </div>

      {aiInsights.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Zap className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No AI insights yet</p>
            <p className="text-slate-600 text-sm mt-1">Run experiments to generate AI-powered analysis</p>
          </div>
        </div>
      )}
    </div>
  )
}
