import { useState } from 'react'
import { useStore } from '../data/store'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'

export default function AnalyticsPage() {
  const { experiments, analyticsMap, selectExperiment, setPage } = useStore()
  const [selectedExpId, setSelectedExpId] = useState(
    experiments.find((e) => e.status === 'running')?.id ?? experiments[0]?.id ?? ''
  )

  const exp = experiments.find((e) => e.id === selectedExpId)
  const analytics = analyticsMap[selectedExpId]

  const latencyChartData = analytics?.latency_trend.filter((_, i) => i % 2 === 0) ?? []

  const variantBarData = analytics?.variant_metrics.map((m) => ({
    name: m.variant_name.length > 18 ? m.variant_name.slice(0, 18) + '…' : m.variant_name,
    'Avg (ms)': m.avg_latency_ms,
    'p50 (ms)': m.p50_latency_ms,
    'p95 (ms)': m.p95_latency_ms,
    'p99 (ms)': m.p99_latency_ms,
  })) ?? []

  const errorBarData = analytics?.variant_metrics.map((m) => ({
    name: m.variant_name.length > 18 ? m.variant_name.slice(0, 18) + '…' : m.variant_name,
    'Error Rate %': m.error_rate,
    'Success Rate %': m.success_rate,
    'Score': m.score,
  })) ?? []

  const radarData = analytics?.variant_metrics.map((m) => ({
    subject: m.variant_name.length > 14 ? m.variant_name.slice(0, 14) + '…' : m.variant_name,
    latency: Math.round(100 - (m.avg_latency_ms / 500) * 100),
    errorRate: Math.round(100 - m.error_rate * 10),
    throughput: Math.round((m.request_count / (analytics?.total_requests || 1)) * 100),
    score: Math.round(m.score),
    payloadSize: Math.round(100 - (m.avg_payload_size / 3000) * 100),
  })) ?? []

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Analytics Hub</h2>
          <p className="text-sm text-slate-500 mt-0.5">Latency, error rates, throughput, and variant performance analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedExpId}
            onChange={(e) => setSelectedExpId(e.target.value)}
            className="bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
          >
            {experiments.filter((e) => e.total_requests > 0).map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <button
            onClick={() => { selectExperiment(selectedExpId); setPage('cockpit') }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
          >
            View Cockpit →
          </button>
        </div>
      </div>

      {!analytics ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-slate-500">No analytics data available for this experiment.</p>
            <p className="text-slate-600 text-sm mt-1">Select a running or concluded experiment with execution data.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: (analytics.total_requests / 1000).toFixed(1) + 'k', color: 'text-blue-400' },
              { label: 'Avg Latency', value: analytics.avg_latency_ms.toFixed(0) + 'ms', color: analytics.avg_latency_ms < 100 ? 'text-emerald-400' : analytics.avg_latency_ms < 300 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Error Rate', value: analytics.error_rate.toFixed(2) + '%', color: analytics.error_rate < 1 ? 'text-emerald-400' : analytics.error_rate < 3 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Variants', value: analytics.variant_metrics.length, color: 'text-cyan-400' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-[#0D1117] border border-white/5 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Latency trend */}
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Latency Trend (24h)</h3>
              <p className="text-xs text-slate-500 mt-0.5">p50 / p95 / p99 percentiles over time</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={latencyChartData}>
                <defs>
                  {[
                    { id: 'g50', color: '#3B82F6' },
                    { id: 'g95', color: '#0EA5E9' },
                    { id: 'g99', color: '#06B6D4' },
                  ].map((g) => (
                    <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={g.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} unit="ms" />
                <Tooltip
                  contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: unknown) => [`${v}ms`]}
                />
                <Legend formatter={(v) => <span className="text-slate-400 text-xs">{v}</span>} />
                <Area type="monotone" dataKey="p50" name="p50" stroke="#3B82F6" fill="url(#g50)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="p95" name="p95" stroke="#0EA5E9" fill="url(#g95)" strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="p99" name="p99" stroke="#06B6D4" fill="url(#g99)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Variant latency comparison */}
            <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-200">Variant Latency Breakdown</h3>
                <p className="text-xs text-slate-500 mt-0.5">Avg, p50, p95, p99 per variant</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={variantBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} unit="ms" />
                  <Tooltip
                    contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  />
                  <Bar dataKey="Avg (ms)" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="p95 (ms)" fill="#0EA5E9" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="p99 (ms)" fill="#06B6D4" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Error rate + score */}
            <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-200">Success Rate & Score</h3>
                <p className="text-xs text-slate-500 mt-0.5">Error rate, success rate, and composite score per variant</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={errorBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  />
                  <Bar dataKey="Success Rate %" fill="#10B981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Score" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Error Rate %" fill="#EF4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed variant metrics table */}
          <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-slate-200">Variant Metrics Detail</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Variant', 'Requests', 'Avg Latency', 'p50', 'p95', 'p99', 'Error Rate', 'Success Rate', 'Avg Payload', 'Score'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.variant_metrics.map((m) => {
                    const isWinner = m.variant_id === analytics.winner_variant_id
                    return (
                      <tr key={m.variant_id} className={`border-b border-white/5 ${isWinner ? 'bg-emerald-500/5' : 'hover:bg-white/[0.02]'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isWinner && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex-shrink-0">WIN</span>}
                            <span className="text-xs font-medium text-slate-200">{m.variant_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-300">{(m.request_count / 1000).toFixed(1)}k</td>
                        <td className="px-4 py-3 text-xs font-semibold text-cyan-400">{m.avg_latency_ms}ms</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{m.p50_latency_ms}ms</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{m.p95_latency_ms}ms</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{m.p99_latency_ms}ms</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${m.error_rate < 1 ? 'text-emerald-400' : m.error_rate < 3 ? 'text-amber-400' : 'text-red-400'}`}>
                            {m.error_rate.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-emerald-400">{m.success_rate.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{(m.avg_payload_size / 1024).toFixed(1)}KB</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-16">
                              <div
                                className={`h-full rounded-full ${isWinner ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${m.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-100">{m.score.toFixed(1)}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
