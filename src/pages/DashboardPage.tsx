import { useEffect, useState } from 'react'
import { BarChart2, Zap, TriangleAlert as AlertTriangle, Activity, FlaskConical, Trophy } from 'lucide-react'
import { analyticsApi, abApi, ccApi } from '../api/client'
import type { DashboardSummary, ABExperiment, CCExperiment } from '../types'
import { useStore } from '../data/store'

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    running: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    concluded: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${cfg[status] ?? cfg.draft}`}>
      {status}
    </span>
  )
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-[#0D1117] border border-white/8 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-[13px] text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { setPage, setModule } = useStore()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [abExps, setAbExps] = useState<ABExperiment[]>([])
  const [ccExps, setCcExps] = useState<CCExperiment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsApi.summary(), abApi.list(), ccApi.list()])
      .then(([s, ab, cc]) => { setSummary(s.data); setAbExps(ab.data); setCcExps(cc.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const runningAB = abExps.filter(e => e.status === 'running').length
  const runningCC = ccExps.filter(e => e.status === 'running').length

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome to XTest API Lab 2.0</h2>
        <p className="text-sm text-slate-500 mt-1">Dual-mode API experimentation — A/B Traffic Split + Champion vs Challenger</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={(summary?.total_requests ?? 0).toLocaleString()} icon={Activity} color="bg-blue-600/20 text-blue-400" />
        <StatCard label="Active Sessions" value={(summary?.total_sessions ?? 0).toLocaleString()} icon={Zap} color="bg-cyan-600/20 text-cyan-400" />
        <StatCard label="Avg Latency" value={`${summary?.avg_latency_ms ?? 0}ms`} icon={BarChart2} color="bg-amber-600/20 text-amber-400" />
        <StatCard label="Error Rate" value={`${summary?.error_rate ?? 0}%`} icon={AlertTriangle} color="bg-red-600/20 text-red-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0D1117] border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white">A/B Testing</div>
              <div className="text-[12px] text-slate-500">Traffic split routing — one variant per request</div>
            </div>
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 font-semibold">
              {summary?.ab_experiments ?? 0} total
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-emerald-400">{runningAB}</div>
              <div className="text-[11px] text-slate-500">Running</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-slate-200">{abExps.length}</div>
              <div className="text-[11px] text-slate-500">Total</div>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 mb-4">
            Route each request to exactly one variant based on configurable traffic weights. Run multiple calls per session to observe distribution.
          </p>
          <div className="flex gap-2">
            <button onClick={() => { setModule('AB'); setPage('ab-experiments') }}
              className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-semibold rounded-lg transition-colors border border-blue-500/20">
              View Experiments
            </button>
            <button onClick={() => { setModule('AB'); setPage('ab-builder') }}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              New Experiment
            </button>
          </div>
        </div>

        <div className="bg-[#0D1117] border border-teal-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white">Champion vs Challenger</div>
              <div className="text-[12px] text-slate-500">Parallel execution — both APIs always run</div>
            </div>
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-teal-600/20 text-teal-400 font-semibold">
              {summary?.cc_experiments ?? 0} total
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-emerald-400">{runningCC}</div>
              <div className="text-[11px] text-slate-500">Running</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-slate-200">{ccExps.length}</div>
              <div className="text-[11px] text-slate-500">Total</div>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 mb-4">
            Execute champion and challenger in parallel on every request. Intelligent configurable scoring engine determines the winner.
          </p>
          <div className="flex gap-2">
            <button onClick={() => { setModule('CC'); setPage('cc-experiments') }}
              className="flex-1 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 text-sm font-semibold rounded-lg transition-colors border border-teal-500/20">
              View Experiments
            </button>
            <button onClick={() => { setModule('CC'); setPage('cc-builder') }}
              className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors">
              New Experiment
            </button>
          </div>
        </div>
      </div>

      {abExps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">A/B Experiments</h3>
            <button onClick={() => { setModule('AB'); setPage('ab-experiments') }} className="text-xs text-blue-400 hover:text-blue-300">View all</button>
          </div>
          <div className="bg-[#0D1117] border border-white/8 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Experiment', 'Status', 'Requests', 'Avg Latency', 'Error %'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {abExps.slice(0, 3).map((exp) => (
                  <tr key={exp.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/3 cursor-pointer transition-colors"
                    onClick={() => { setModule('AB'); useStore.getState().selectExperiment(exp.id); setPage('ab-cockpit') }}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-200">{exp.name}</div>
                      <div className="text-[11px] text-slate-500">{exp.method} {exp.base_url}{exp.path}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={exp.status} /></td>
                    <td className="px-4 py-3 text-sm text-slate-300">{exp.total_requests.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{exp.avg_latency_ms}ms</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${exp.error_rate > 5 ? 'text-red-400' : exp.error_rate > 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {exp.error_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ccExps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">CC Experiments</h3>
            <button onClick={() => { setModule('CC'); setPage('cc-experiments') }} className="text-xs text-teal-400 hover:text-teal-300">View all</button>
          </div>
          <div className="bg-[#0D1117] border border-white/8 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Experiment', 'Status', 'Sessions', 'Champ Wins', 'Chall Wins'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ccExps.slice(0, 3).map((exp) => (
                  <tr key={exp.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/3 cursor-pointer transition-colors"
                    onClick={() => { setModule('CC'); useStore.getState().selectExperiment(exp.id); setPage('cc-cockpit') }}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-200">{exp.name}</div>
                      <div className="text-[11px] text-slate-500">{exp.method} — champion vs challenger</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={exp.status} /></td>
                    <td className="px-4 py-3 text-sm text-slate-300">{exp.total_sessions}</td>
                    <td className="px-4 py-3 text-sm text-blue-400 font-semibold">{exp.champion_wins}</td>
                    <td className="px-4 py-3 text-sm text-teal-400 font-semibold">{exp.challenger_wins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
