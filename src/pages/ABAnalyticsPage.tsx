import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { abApi, analyticsApi } from '../api/client'
import type { ABExperiment, ABAnalytics } from '../types'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ABAnalyticsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<ABExperiment[]>([])
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<ABAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const fetchExperiments = async () => {
    try {
      const res = await abApi.list()
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
      const res = await analyticsApi.ab(expId)
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
        <h1 className="text-3xl font-bold text-white mb-8">A/B Analytics</h1>

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
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700 border-t-blue-500" />
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Total Requests</p>
                <p className="text-3xl font-bold text-white">{analytics.total_requests.toLocaleString()}</p>
              </div>
              <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Total Sessions</p>
                <p className="text-3xl font-bold text-white">{analytics.total_sessions.toLocaleString()}</p>
              </div>
              <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Avg Latency</p>
                <p className="text-3xl font-bold text-white">{Math.round(analytics.avg_latency_ms)}ms</p>
              </div>
              <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Error Rate</p>
                <p className="text-3xl font-bold text-white">{(analytics.error_rate * 100).toFixed(2)}%</p>
              </div>
            </div>

            {/* Variant Metrics Table */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Variant Metrics</h2>
              <div className="overflow-x-auto bg-[#0D1117] border border-white/8 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/8">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Variant</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Weight</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Requests</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Avg Latency</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">P50</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">P95</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">P99</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Error Rate</th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.variant_metrics.map((metric) => (
                      <tr key={metric.variant_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-slate-100 font-medium">{metric.variant_name}</td>
                        <td className="px-4 py-3 text-slate-400">{metric.weight}%</td>
                        <td className="px-4 py-3 text-slate-400">{metric.request_count.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-400">{Math.round(metric.avg_latency_ms)}ms</td>
                        <td className="px-4 py-3 text-slate-400">{Math.round(metric.p50_latency_ms)}ms</td>
                        <td className="px-4 py-3 text-slate-400">{Math.round(metric.p95_latency_ms)}ms</td>
                        <td className="px-4 py-3 text-slate-400">{Math.round(metric.p99_latency_ms)}ms</td>
                        <td className="px-4 py-3 text-slate-400">{(metric.error_rate * 100).toFixed(2)}%</td>
                        <td className="px-4 py-3 text-emerald-400 font-medium">{(metric.success_rate * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Variant Latency Comparison */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Latency Comparison</h2>
              <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.variant_metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="variant_name" stroke="rgba(255,255,255,0.5)" />
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
                    <Bar dataKey="avg_latency_ms" fill="#3b82f6" name="Avg" />
                    <Bar dataKey="p50_latency_ms" fill="#60a5fa" name="P50" />
                    <Bar dataKey="p95_latency_ms" fill="#93c5fd" name="P95" />
                  </BarChart>
                </ResponsiveContainer>
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
                      <YAxis stroke="rgba(255,255,255,0.5)" label={{ value: 'Avg Latency (ms)', angle: -90, position: 'insideLeft' }} />
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
                        dataKey="avg_latency"
                        stroke="#3b82f6"
                        dot={false}
                        strokeWidth={2}
                        name="Avg Latency"
                      />
                    </LineChart>
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

export default ABAnalyticsPage
