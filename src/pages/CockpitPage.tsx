import { useState } from 'react'
import { ChevronLeft, Activity, Users, TrendingUp, Zap, Target, Clock, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle } from 'lucide-react'
import { useStore } from '../data/store'
import {
  RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'

const confidenceHistory = [
  { day: 1, conf: 52 }, { day: 3, conf: 58 }, { day: 5, conf: 63 },
  { day: 7, conf: 71 }, { day: 10, conf: 78 }, { day: 14, conf: 82 },
  { day: 17, conf: 85 }, { day: 20, conf: 87 },
]

export default function CockpitPage() {
  const { experiments, analyticsMap, selectedExperimentId, selectExperiment, setPage } = useStore()
  const [localSel, setLocalSel] = useState<string | null>(selectedExperimentId)

  const running = experiments.filter((e) => e.status === 'running')
  const exp = localSel ? experiments.find((e) => e.id === localSel) : running[0]
  const analytics = exp ? analyticsMap[exp.id] : null

  const handleSelect = (id: string) => {
    setLocalSel(id)
    selectExperiment(id)
  }

  if (!exp) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">No running experiments. Start one from the Experiments page.</p>
      </div>
    )
  }

  const confidence = analytics?.overall_confidence ?? 0
  const confColor = confidence >= 95 ? '#10B981' : confidence >= 80 ? '#F59E0B' : '#3B82F6'

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Experiment selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {running.map((e) => (
          <button key={e.id} onClick={() => handleSelect(e.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all
              ${(localSel ?? running[0]?.id) === e.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'}`}>
            <span className={`w-2 h-2 rounded-full ${(localSel ?? running[0]?.id) === e.id ? 'bg-white' : 'bg-green-500'} animate-pulse`} />
            {e.name}
          </button>
        ))}
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: exp.total_sessions.toLocaleString(), icon: Users, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Traffic Allocated', value: `${exp.traffic_pct}%`, icon: Target, color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Days Running', value: String(analytics?.days_running ?? '—'), icon: Clock, color: '#0891B2', bg: '#ECFEFF' },
          { label: 'Est. Days Left', value: analytics?.estimated_days_remaining ? String(analytics.estimated_days_remaining) : '—', icon: Activity, color: '#059669', bg: '#F0FDF4' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: m.bg }}>
              <m.icon className="w-4.5 h-4.5" style={{ color: m.color }} />
            </div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{m.value}</div>
            <div className="text-xs text-gray-400 font-medium mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Confidence gauge */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="text-sm font-bold text-gray-900 mb-1 self-start">Statistical Confidence</div>
          <div className="text-xs text-gray-400 mb-3 self-start">Required: {exp.confidence_threshold}%</div>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: confidence }]} startAngle={180} endAngle={-180}>
                <RadialBar dataKey="value" cornerRadius={8} fill={confColor} background={{ fill: '#F1F5F9' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums" style={{ color: confColor }}>{confidence.toFixed(0)}%</span>
              <span className="text-xs text-gray-400 mt-0.5">confidence</span>
            </div>
          </div>
          <div className="mt-3 w-full">
            {confidence >= 95 ? (
              <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Ready to declare winner!</span>
              </div>
            ) : confidence >= 80 ? (
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Approaching significance</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Collecting data…</span>
              </div>
            )}
          </div>
        </div>

        {/* Confidence over time */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm font-bold text-gray-900 mb-1">Confidence Over Time</div>
          <div className="text-xs text-gray-400 mb-4">Days since launch</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={confidenceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} formatter={(v) => [`${v}%`, 'Confidence']} />
              <Line type="monotone" dataKey="conf" stroke={confColor} strokeWidth={2.5} dot={false} />
              {/* threshold line is implicit — just visual */}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Verdict */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-sm font-bold text-gray-900">AI Verdict</div>
          </div>
          {exp.ai_verdict ? (
            <div className="space-y-3">
              <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg inline-block
                ${exp.ai_verdict.hypothesis_confirmed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {exp.ai_verdict.hypothesis_confirmed ? '✓ Hypothesis confirmed' : '✗ Hypothesis not confirmed'}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{exp.ai_verdict.verdict_summary}</p>
              {exp.ai_verdict.winner_variant && (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-blue-700">Winner: {exp.ai_verdict.winner_variant}</span>
                </div>
              )}
              <div className="space-y-1">
                {exp.ai_verdict.key_insights.map((ins, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                    {ins}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 leading-relaxed">
              AI analysis will be available once the experiment reaches {exp.confidence_threshold}% confidence.
              Currently at {confidence.toFixed(0)}%.
            </div>
          )}
        </div>
      </div>

      {/* Variant performance */}
      {analytics && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm font-bold text-gray-900 mb-4">Variant Performance</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.variant_stats.map((v) => {
              const isControl = v.variant_key === 'control'
              const isLeading = v.variant_name === analytics.leading_variant
              return (
                <div key={v.variant_id}
                  className={`rounded-xl p-4 border-2 transition-all
                    ${isLeading ? 'border-blue-400 bg-blue-50/50' : 'border-gray-100 bg-gray-50/50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-700">{v.variant_name}</span>
                    <div className="flex gap-1">
                      {isControl && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 font-semibold">Control</span>
                      )}
                      {isLeading && !isControl && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Leading</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-lg font-bold text-gray-900 tabular-nums">{v.cvr.toFixed(1)}%</div>
                      <div className="text-[10px] text-gray-400">CVR</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 tabular-nums">{v.impressions.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400">Sessions</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold tabular-nums ${v.lift_vs_control !== null && v.lift_vs_control > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                        {v.lift_vs_control !== null ? `+${v.lift_vs_control}%` : '—'}
                      </div>
                      <div className="text-[10px] text-gray-400">Lift</div>
                    </div>
                  </div>
                  {!isControl && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Confidence</span>
                        <span>{v.confidence.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${v.confidence}%`,
                            background: v.confidence >= 95 ? '#10B981' : v.confidence >= 80 ? '#F59E0B' : '#3B82F6'
                          }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Segment breakdown */}
      {analytics && Object.keys(analytics.segment_breakdown).length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm font-bold text-gray-900 mb-4">Segment Breakdown</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(analytics.segment_breakdown).map(([seg, rows]) => (
              <div key={seg}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 capitalize">{seg}</div>
                <div className="space-y-2">
                  {rows.map((row) => (
                    <div key={row.value} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-20 capitalize flex-shrink-0">{row.value}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.abs(row.lift) * 4)}%`,
                            background: row.lift > 0 ? '#10B981' : '#EF4444'
                          }} />
                      </div>
                      <span className={`text-xs font-bold w-14 text-right tabular-nums ${row.lift > 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {row.lift > 0 ? '+' : ''}{row.lift}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
