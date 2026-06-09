import React, { useState, useEffect } from 'react'
import { ChevronDown, Play, RotateCcw, ChevronUp } from 'lucide-react'
import { abApi, execApi } from '../api/client'
import type { ABExperiment, ABSession, ABCall } from '../types'
import { useStore } from '../data/store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ABCockpitPage: React.FC = () => {
  const { selectedExperimentId, selectSession, selectedSessionId } = useStore()

  const [experiments, setExperiments] = useState<ABExperiment[]>([])
  const [selectedExp, setSelectedExp] = useState<ABExperiment | null>(null)
  const [sessions, setSessions] = useState<ABSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ABSession | null>(null)
  const [expandedCall, setExpandedCall] = useState<string | null>(null)

  const [numCalls, setNumCalls] = useState(10)
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [showExperimentDropdown, setShowExperimentDropdown] = useState(false)

  const fetchExperiments = async () => {
    try {
      const res = await abApi.list()
      const exps = res.data || []
      setExperiments(exps)
      if (selectedExperimentId) {
        const exp = exps.find((e) => e.id === selectedExperimentId)
        if (exp) {
          setSelectedExp(exp)
          fetchSessions(exp.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch experiments:', error)
    }
  }

  const fetchSessions = async (expId: string) => {
    setLoadingSessions(true)
    try {
      const res = await execApi.abSessions(expId)
      const data = res.data || []
      setSessions(data)
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0])
        selectSession(data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    fetchExperiments()
  }, [])

  const handleSelectExperiment = (exp: ABExperiment) => {
    setSelectedExp(exp)
    setSelectedSession(null)
    selectSession(null)
    fetchSessions(exp.id)
    setShowExperimentDropdown(false)
  }

  const handleExecute = async () => {
    if (!selectedExp) return
    setLoading(true)
    try {
      await execApi.abExecute({ experiment_id: selectedExp.id, n: numCalls })
      fetchSessions(selectedExp.id)
    } catch (error) {
      console.error('Failed to execute:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunMore = async () => {
    if (!selectedSession) return
    setLoading(true)
    try {
      await execApi.abRunMore(selectedSession.id, numCalls)
      fetchSessions(selectedExp!.id)
    } catch (error) {
      console.error('Failed to run more:', error)
    } finally {
      setLoading(false)
    }
  }

  const variantStats = selectedSession
    ? selectedSession.calls.reduce(
      (acc, call) => {
        const variant = acc.find((v) => v.name === call.variant_name)
        if (variant) {
          variant.count += 1
        } else {
          acc.push({ name: call.variant_name, count: 1 })
        }
        return acc
      },
      [] as Array<{ name: string; count: number }>
    )
    : []

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-8">A/B Cockpit - Live Execution</h1>

        {/* Experiment Selector */}
        <div className="mb-8 relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Experiment</label>
          <button
            onClick={() => setShowExperimentDropdown(!showExperimentDropdown)}
            className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 text-left flex items-center justify-between hover:border-white/12"
          >
            <span>{selectedExp?.name || 'Choose an experiment...'}</span>
            <ChevronDown size={18} />
          </button>
          {showExperimentDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0D1117] border border-white/8 rounded-lg overflow-hidden z-10">
              {experiments.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => handleSelectExperiment(exp)}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 border-b border-white/5 last:border-b-0 transition-colors"
                >
                  <div className="font-medium">{exp.name}</div>
                  <div className="text-xs text-slate-500">{exp.status}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedExp && (
          <>
            {/* Experiment Info */}
            <div className="mb-8 p-6 bg-[#0D1117] border border-white/8 rounded-lg">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Experiment Details</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Method</p>
                  <p className="text-sm font-semibold text-slate-100">{selectedExp.method}</p>
                </div>
                <div className="col-span-1 lg:col-span-3">
                  <p className="text-xs text-slate-500 mb-1">URL</p>
                  <p className="text-sm font-mono text-slate-100 break-all">{selectedExp.base_url}/{selectedExp.path}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500 mb-3">Variants</p>
                <div className="flex gap-3 text-xs">
                  {selectedExp.variants.map((v, idx) => (
                    <div key={v.id}>
                      <span className="text-slate-400">{v.name}</span>
                      <span className="text-slate-500 ml-2">{v.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Execute Panel */}
            <div className="mb-8 p-6 bg-[#0D1117] border border-white/8 rounded-lg">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Execute</h3>
              <div className="flex gap-4">
                <div className="w-24">
                  <label className="block text-xs text-slate-500 mb-2">Number of Calls</label>
                  <input
                    type="number"
                    value={numCalls}
                    onChange={(e) => setNumCalls(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-slate-100 text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <button
                    onClick={handleExecute}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play size={16} />
                    Execute
                  </button>
                  {selectedSession && (
                    <button
                      onClick={handleRunMore}
                      disabled={loading}
                      className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-slate-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      <RotateCcw size={16} />
                      Run More
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sessions List */}
              <div className="lg:col-span-1">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Sessions</h3>
                <div className="space-y-2">
                  {loadingSessions ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-700 border-t-blue-500" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No sessions yet</p>
                  ) : (
                    sessions.map((session, idx) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setSelectedSession(session)
                          selectSession(session.id)
                          setExpandedCall(null)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                          selectedSession?.id === session.id
                            ? 'bg-blue-600/20 border-blue-500/30'
                            : 'bg-white/5 border-white/8 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-medium">#Session {idx + 1}</div>
                        <div className="text-xs text-slate-500">{session.calls.length} calls</div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Session Details */}
              <div className="lg:col-span-3">
                {selectedSession ? (
                  <div className="space-y-6">
                    {/* Calls List */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-300 mb-3">Calls</h3>
                      <div className="space-y-2">
                        {selectedSession.calls.map((call: ABCall, idx: number) => {
                          const isExpanded = expandedCall === call.call_id
                          return (
                            <div key={call.call_id} className="bg-[#0D1117] border border-white/8 rounded-lg">
                              <button
                                onClick={() => setExpandedCall(isExpanded ? null : call.call_id)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <span className="text-xs text-slate-500">#{idx + 1}</span>
                                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300">{call.variant_name}</span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      call.status_code >= 200 && call.status_code < 300
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-red-500/20 text-red-300'
                                    }`}
                                  >
                                    {call.status_code}
                                  </span>
                                  <span className="text-xs text-slate-400">{call.latency_ms}ms</span>
                                  <span className="text-xs text-slate-500">{new Date(call.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <ChevronUp
                                  size={18}
                                  className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>
                              {isExpanded && (
                                <div className="px-4 py-3 border-t border-white/8 bg-white/5">
                                  <div className="space-y-2 font-mono text-xs text-slate-300">
                                    <div>
                                      <span className="text-slate-500">URL:</span>
                                      <div className="mt-1 p-2 bg-black/40 rounded break-all">{call.url}</div>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Response:</span>
                                      <div className="mt-1 p-2 bg-black/40 rounded overflow-auto max-h-40">
                                        {JSON.stringify(call.response_body, null, 2)}
                                      </div>
                                    </div>
                                    {call.error && (
                                      <div>
                                        <span className="text-red-400">Error:</span>
                                        <div className="mt-1 p-2 bg-red-500/20 rounded">{call.error}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Variant Distribution Chart */}
                    {variantStats.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-300 mb-3">Variant Distribution</h3>
                        <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={variantStats}>
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
                              <Bar dataKey="count" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-center">
                    <div>
                      <p className="text-slate-400 mb-2">No session selected</p>
                      <p className="text-sm text-slate-500">Execute calls or select a session to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {!selectedExp && (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-400">Select an experiment to begin</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ABCockpitPage
