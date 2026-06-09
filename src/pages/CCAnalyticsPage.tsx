import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { ccApi, analyticsApi } from '../api/client'
import type { CCExperiment, CCAnalytics } from '../types'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'

const CCAnalyticsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<CCExperiment[]>([])
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<CCAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const fetchExperiments = async () => {
    try {
      const res = await ccApi.list()
      const exps = res.data || []
      setExperiments(exps)
      if (exps.length > 0 && !selectedExpId) {
        setSelectedExpId(exps[0].id)
        fetchAnalytics(exps[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch experiments:', error)
    }
  }

  const fetchAnalytics = async (expId: string) => {
    setLoading(true)
    try {
      const res = await analyticsApi.cc(expId)
      setAnalytics(res.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiments()
  }, [])

  const handleSelectExperiment = (expId: string) => {
    setSelectedExpId(expId)
    fetchAnalytics(expId)
    setShowDropdown(false)
  }

  const selectedExp = experiments.find((e) => e.id === selectedExpId)

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-8">Champion vs Challenger Analytics</h1>

        {/* Experiment Selector */}
        <div className="mb-8 relative w-full max-w-sm">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Experiment</label>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 text-left flex items-center justify-between hover:border-white/12"
          >
            <span>{selectedExp?.name || 'Choose an experiment...'}</span>
            <ChevronDown size={18} />
          </button>
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0D1117] border border-white/8 rounded-lg overflow-hidden z-10">
              {experiments.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => handleSelectExperiment(exp.id)}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 border-b border-white/5 last:border-b-0 transition-colors"
                >
                  <div className="font-medium">{exp.name}</div>
                  <div className="text-xs text-slate-500">{exp.status}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700 border-t-teal-500" />
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Win Rate Display */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Win Rate Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                  <p className="text-sm text-slate-500 mb-2">Champion Win Rate</p>
                  <p className="text-3xl font-bold text-blue-400">{(analytics.champion_win_rate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-slate-500 mt-2">{analytics.champion_wins} wins</p>
                </div>
                <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                  <p className="text-sm text-slate-500 mb-2">Total Sessions</p>
                  <p className="text-3xl font-bold text-slate-100">{analytics.total_sessions}</p>
                </div>
                <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                  <p className="text-sm text-slate-500 mb-2">Challenger Win Rate</p>
                  <p className="text-3xl font-bold text-teal-400">{(analytics.challenger_win_rate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-slate-500 mt-2">{analytics.challenger_wins} wins</p>
                </div>
              </div>
            </div>

            {/* Win Rate Bar Chart */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Win Rate Distribution</h2>
              <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      {
                        name: 'Win Rate',
                        Champion: analytics.champion_win_rate * 100,
                        Challenger: analytics.challenger_win_rate * 100,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0D1117',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)' }} />
                    <Bar dataKey="Champion" fill="#3b82f6" />
                    <Bar dataKey="Challenger" fill="#14b8a6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-400 mb-4">Champion Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-slate-500">Requests:</span> <span className="text-slate-100 font-medium">{analytics.champion_stats.count}</span></div>
                    <div><span className="text-slate-500">Avg Latency:</span> <span className="text-slate-100 font-medium">{Math.round(analytics.champion_stats.avg_latency_ms)}ms</span></div>
                    <div><span className="text-slate-500">P50 Latency:</span> <span className="text-slate-100 font-medium">{Math.round(analytics.champion_stats.p50_latency_ms)}ms</span></div>
                    <div><span className="text-slate-500">P95 Latency:</span> <span className="text-slate-100 font-medium">{Math.round(analytics.champion_stats.p95_latency_ms)}ms</span></div>
                    <div><span className="text-slate-500">P99 Latency:</span> <span className="text-slate-100 font-medium">{Math.round(analytics.champion_stats.p99_latency_ms)}ms</span></div>
                    <div><span className="text-slate-500">Error Rate:</span> <span className="text-slate-100 font-medium">{(analytics.champion_stats.error_rate * 100).toFixed(2)}%</span></div>
                    <div><span className="text-slate-500">Avg Payload:</span> <span className="text-slate-100 font-medium">{(analytics.champion_stats.avg_payload_bytes / 1024).toFixed(2)}KB</span></div>
                  </div>
                </div>
                <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                  <h3 className="text-sm font-medium text-teal-400 mb-4">Challenger Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-slate-500">Requests:</span> <span className="text-slate-100 font-medium">{analytics.challenger_stats.count}</span></div>
                    <div><span className="text-slate-500">Avg Latency:</span> <span className="text-slate-100 font-medium">{Math.round(analytics.challenger_stats.avg_latency_ms)}ms</span></div>
                    <div><span className="text-slate-500">P50 Latency:</span> <span className="text-slate-100 font-medium">{Math.round(analytics.challenger_stats.p50_latency_ms)}ms</span></div>
                    <div><span className="text-slate-500">P95 Latency:</span> <span className="text-slate-100 font-medium">{Math.round(analytics.challenger_stats.p95_latency_ms)}ms</span></div>
                    <div><span className="text-slate-500">P99 Latency:</span> <span className="text-slate-100 font-medium">{Math.round(analytics.challenger_stats.p99_latency_ms)}ms</span></div>
                    <div><span className="text-slate-500">Error Rate:</span> <span className="text-slate-100 font-medium">{(analytics.challenger_stats.error_rate * 100).toFixed(2)}%</span></div>
                    <div><span className="text-slate-500">Avg Payload:</span> <span className="text-slate-100 font-medium">{(analytics.challenger_stats.avg_payload_bytes / 1024).toFixed(2)}KB</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Metric Comparison</h2>
              <div className="overflow-x-auto bg-[#0D1117] border border-white/8 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/8">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Metric</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Champion</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Challenger</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-100">Avg Latency</td>
                      <td className="px-4 py-3 text-slate-400">{Math.round(analytics.champion_stats.avg_latency_ms)}ms</td>
                      <td className="px-4 py-3 text-slate-400">{Math.round(analytics.challenger_stats.avg_latency_ms)}ms</td>
                      <td className={`px-4 py-3 font-medium ${
                        analytics.champion_stats.avg_latency_ms < analytics.challenger_stats.avg_latency_ms
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {Math.round(Math.abs(analytics.champion_stats.avg_latency_ms - analytics.challenger_stats.avg_latency_ms))}ms
                      </td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-100">P50 Latency</td>
                      <td className="px-4 py-3 text-slate-400">{Math.round(analytics.champion_stats.p50_latency_ms)}ms</td>
                      <td className="px-4 py-3 text-slate-400">{Math.round(analytics.challenger_stats.p50_latency_ms)}ms</td>
                      <td className={`px-4 py-3 font-medium ${
                        analytics.champion_stats.p50_latency_ms < analytics.challenger_stats.p50_latency_ms
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {Math.round(Math.abs(analytics.champion_stats.p50_latency_ms - analytics.challenger_stats.p50_latency_ms))}ms
                      </td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-100">P95 Latency</td>
                      <td className="px-4 py-3 text-slate-400">{Math.round(analytics.champion_stats.p95_latency_ms)}ms</td>
                      <td className="px-4 py-3 text-slate-400">{Math.round(analytics.challenger_stats.p95_latency_ms)}ms</td>
                      <td className={`px-4 py-3 font-medium ${
                        analytics.champion_stats.p95_latency_ms < analytics.challenger_stats.p95_latency_ms
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {Math.round(Math.abs(analytics.champion_stats.p95_latency_ms - analytics.challenger_stats.p95_latency_ms))}ms
                      </td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-100">P99 Latency</td>
                      <td className="px-4 py-3 text-slate-400">{Math.round(analytics.champion_stats.p99_latency_ms)}ms</td>
                      <td className="px-4 py-3 text-slate-400">{Math.round(analytics.challenger_stats.p99_latency_ms)}ms</td>
                      <td className={`px-4 py-3 font-medium ${
                        analytics.champion_stats.p99_latency_ms < analytics.challenger_stats.p99_latency_ms
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {Math.round(Math.abs(analytics.champion_stats.p99_latency_ms - analytics.challenger_stats.p99_latency_ms))}ms
                      </td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-100">Error Rate</td>
                      <td className="px-4 py-3 text-slate-400">{(analytics.champion_stats.error_rate * 100).toFixed(2)}%</td>
                      <td className="px-4 py-3 text-slate-400">{(analytics.challenger_stats.error_rate * 100).toFixed(2)}%</td>
                      <td className={`px-4 py-3 font-medium ${
                        analytics.champion_stats.error_rate < analytics.challenger_stats.error_rate
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {Math.abs((analytics.champion_stats.error_rate - analytics.challenger_stats.error_rate) * 100).toFixed(2)}%
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-100">Avg Payload</td>
                      <td className="px-4 py-3 text-slate-400">{(analytics.champion_stats.avg_payload_bytes / 1024).toFixed(2)}KB</td>
                      <td className="px-4 py-3 text-slate-400">{(analytics.challenger_stats.avg_payload_bytes / 1024).toFixed(2)}KB</td>
                      <td className={`px-4 py-3 font-medium ${
                        analytics.champion_stats.avg_payload_bytes < analytics.challenger_stats.avg_payload_bytes
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}>
                        {Math.abs((analytics.champion_stats.avg_payload_bytes - analytics.challenger_stats.avg_payload_bytes) / 1024).toFixed(2)}KB
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latency Trend Chart */}
            {analytics.latency_trend.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Latency Trend</h2>
                <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.latency_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="session" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0D1117',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#e2e8f0',
                        }}
                      />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)' }} />
                      <Line
                        type="monotone"
                        dataKey="champion_latency"
                        stroke="#3b82f6"
                        dot={false}
                        strokeWidth={2}
                        name="Champion"
                      />
                      <Line
                        type="monotone"
                        dataKey="challenger_latency"
                        stroke="#14b8a6"
                        dot={false}
                        strokeWidth={2}
                        name="Challenger"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Session Trend - Stacked Bar Chart */}
            {analytics.latency_trend.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Session Win Distribution</h2>
                <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={analytics.latency_trend.map((d) => ({
                      session: d.session,
                      champion: d.winner === 'champion' ? 1 : 0,
                      challenger: d.winner === 'challenger' ? 1 : 0,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="session" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0D1117',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#e2e8f0',
                        }}
                      />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)' }} />
                      <Bar dataKey="champion" fill="#3b82f6" name="Champion" />
                      <Bar dataKey="challenger" fill="#14b8a6" name="Challenger" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-400">Select an experiment to view analytics</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CCAnalyticsPage
