import { Activity, FlaskConical, TrendingDown, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Zap, Clock } from 'lucide-react'
import { useStore } from '../data/store'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

const MODE_LABELS: Record<string, string> = {
  ab: 'A/B',
  champion_challenger: 'C/C',
  shadow: 'Shadow',
}

const MODE_COLORS: Record<string, string> = {
  ab: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  champion_challenger: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  shadow: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  concluded: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  draft: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

const ENV_DOT: Record<string, string> = {
  prod: 'bg-red-400',
  staging: 'bg-amber-400',
  dev: 'bg-slate-400',
}

export default function DashboardPage() {
  const { experiments, throughputData, analyticsMap, aiInsights, setPage, selectExperiment } = useStore()

  const running = experiments.filter((e) => e.status === 'running')
  const concluded = experiments.filter((e) => e.status === 'concluded')
  const totalRequests = experiments.reduce((s, e) => s + e.total_requests, 0)
  const avgErrorRate = experiments.filter((e) => e.total_requests > 0)
    .reduce((s, e, _, arr) => s + e.error_rate / arr.length, 0)
  const allLatencies = Object.values(analyticsMap).map((a) => a.avg_latency_ms).filter(Boolean)
  const globalAvgLatency = allLatencies.length
    ? Math.round(allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length)
    : 0

  const kpis = [
    {
      label: 'Total Requests',
      value: (totalRequests / 1000).toFixed(1) + 'k',
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      trend: '+12.4% vs last week',
      up: true,
    },
    {
      label: 'Running Experiments',
      value: running.length,
      icon: FlaskConical,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      trend: `${concluded.length} concluded`,
      up: true,
    },
    {
      label: 'Avg Latency',
      value: globalAvgLatency + 'ms',
      icon: Clock,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      trend: '-18ms vs last week',
      up: true,
    },
    {
      label: 'Error Rate',
      value: avgErrorRate.toFixed(1) + '%',
      icon: AlertTriangle,
      color: avgErrorRate > 2 ? 'text-red-400' : 'text-emerald-400',
      bg: avgErrorRate > 2 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      trend: avgErrorRate > 2 ? 'Above threshold' : 'Within SLO',
      up: avgErrorRate <= 2,
    },
    {
      label: 'Winners Declared',
      value: experiments.filter((e) => e.winner_variant_id).length,
      icon: CheckCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      trend: 'Ready for rollout',
      up: true,
    },
    {
      label: 'AI Insights',
      value: aiInsights.length,
      icon: Zap,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      trend: `${aiInsights.filter((i) => i.confidence === 'high').length} high confidence`,
      up: true,
    },
  ]

  const variantChartData = Object.values(analyticsMap)
    .flatMap((a) =>
      a.variant_metrics.map((m) => ({
        name: m.variant_name.length > 16 ? m.variant_name.slice(0, 16) + '…' : m.variant_name,
        latency: m.avg_latency_ms,
        score: m.score,
      }))
    )
    .slice(0, 6)

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">API Lab Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time API experimentation — traffic splitting, response comparison, winner detection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">Gateway Operational</span>
          </div>
          <button
            onClick={() => setPage('api-builder')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            <FlaskConical className="w-4 h-4" />
            New Experiment
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-[#0D1117] border border-white/5 rounded-xl p-4 flex flex-col gap-2 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <TrendingDown
                  className={`w-3.5 h-3.5 transition-transform ${kpi.up ? 'text-emerald-500 rotate-180' : 'text-red-500'}`}
                />
              </div>
              <div className="text-2xl font-bold text-slate-100">{kpi.value}</div>
              <div className="text-[11px] text-slate-500 leading-tight">{kpi.label}</div>
              <div className={`text-[10px] font-medium ${kpi.up ? 'text-emerald-500' : 'text-red-500'}`}>
                {kpi.trend}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Throughput */}
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Request Throughput (24h)</h3>
              <p className="text-xs text-slate-500 mt-0.5">All experiments combined</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />Requests
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />Errors
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={throughputData}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="requests" stroke="#3B82F6" fill="url(#reqGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="errors" stroke="#EF4444" fill="url(#errGrad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Variant scores */}
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Variant Performance Scores</h3>
              <p className="text-xs text-slate-500 mt-0.5">Composite score (latency + error weighted)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={variantChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
              <Tooltip
                contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="score" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Experiments table */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">All Experiments</h3>
            <p className="text-xs text-slate-500 mt-0.5">{running.length} running · {experiments.length} total</p>
          </div>
          <button
            onClick={() => setPage('experiments')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Experiment', 'Mode', 'Env', 'Requests', 'Avg Latency', 'Error Rate', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  onClick={() => { selectExperiment(exp.id); setPage('cockpit') }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ENV_DOT[exp.environment] || 'bg-slate-400'}`} />
                      <div>
                        <div className="text-[13px] font-medium text-slate-200">{exp.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {exp.request_config.method} {exp.request_config.path}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] px-2 py-1 rounded-full border font-semibold ${MODE_COLORS[exp.execution_mode]}`}>
                      {MODE_LABELS[exp.execution_mode]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-400 font-medium capitalize">{exp.environment}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-slate-200">
                      {exp.total_requests > 0 ? (exp.total_requests / 1000).toFixed(1) + 'k' : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[13px] font-semibold ${
                      exp.avg_latency_ms < 100 ? 'text-emerald-400'
                      : exp.avg_latency_ms < 300 ? 'text-amber-400'
                      : 'text-red-400'
                    }`}>
                      {exp.avg_latency_ms > 0 ? exp.avg_latency_ms + 'ms' : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[13px] font-semibold ${
                      exp.error_rate > 3 ? 'text-red-400'
                      : exp.error_rate > 1 ? 'text-amber-400'
                      : 'text-emerald-400'
                    }`}>
                      {exp.total_requests > 0 ? exp.error_rate.toFixed(1) + '%' : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] px-2 py-1 rounded-full border font-semibold capitalize ${STATUS_COLORS[exp.status]}`}>
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights strip */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">AI Insights</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest recommendations</p>
          </div>
          <button
            onClick={() => setPage('ai-insights')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y divide-white/5 md:divide-y-0 md:divide-x md:divide-white/5">
          {aiInsights.slice(0, 2).map((insight) => (
            <div key={insight.experiment_id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="text-[12px] font-semibold text-slate-300">{insight.experiment_name}</div>
                  {insight.winner_variant && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Winner: {insight.winner_variant}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${
                  insight.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : insight.confidence === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                }`}>
                  {insight.confidence}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                {insight.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
