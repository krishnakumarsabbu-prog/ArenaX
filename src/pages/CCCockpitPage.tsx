import React, { useState, useEffect } from 'react'
import { ChevronDown, Play } from 'lucide-react'
import { ccApi, execApi } from '../api/client'
import type { CCExperiment, CCSession } from '../types'
import { useStore } from '../data/store'

const CCCockpitPage: React.FC = () => {
  const { selectedExperimentId, selectSession, selectedSessionId } = useStore()

  const [experiments, setExperiments] = useState<CCExperiment[]>([])
  const [selectedExp, setSelectedExp] = useState<CCExperiment | null>(null)
  const [sessions, setSessions] = useState<CCSession[]>([])
  const [selectedSession, setSelectedSession] = useState<CCSession | null>(null)

  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [showExperimentDropdown, setShowExperimentDropdown] = useState(false)

  const fetchExperiments = async () => {
    try {
      const res = await ccApi.list()
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
      const res = await execApi.ccSessions(expId)
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

  const handleSelectExperiment = (exp: CCExperiment) => {
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
      await execApi.ccExecute({ experiment_id: selectedExp.id })
      fetchSessions(selectedExp.id)
    } catch (error) {
      console.error('Failed to execute:', error)
    } finally {
      setLoading(false)
    }
  }

  const isStatusSuccess = (statusCode: number) => statusCode >= 200 && statusCode < 300

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-8">Champion vs Challenger Cockpit</h1>

        {/* Experiment Selector */}
        <div className="mb-8 relative w-full max-w-sm">
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
            {/* Execute Panel */}
            <div className="mb-8 p-6 bg-[#0D1117] border border-white/8 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-300">Execute Single Comparison</h3>
                  <p className="text-xs text-slate-500 mt-1">Compare champion and challenger with a single request</p>
                </div>
                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 disabled:opacity-50"
                >
                  <Play size={18} />
                  Execute
                </button>
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
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-700 border-t-teal-500" />
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
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                          selectedSession?.id === session.id
                            ? 'bg-teal-600/20 border-teal-500/30'
                            : 'bg-white/5 border-white/8 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-medium">#Session {idx + 1}</div>
                        <div className={`text-xs font-medium ${
                          session.winner === 'champion' ? 'text-blue-400' : 'text-teal-400'
                        }`}>
                          {session.winner === 'champion' ? 'Champion' : 'Challenger'} won
                        </div>
                        <div className="text-xs text-slate-500">Diff: {session.score_diff.toFixed(2)}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Session Details */}
              <div className="lg:col-span-3">
                {selectedSession ? (
                  <div className="space-y-6">
                    {/* Winner Banner */}
                    <div className={`p-6 rounded-lg border ${
                      selectedSession.winner === 'champion'
                        ? 'bg-blue-500/20 border-blue-500/30'
                        : 'bg-teal-500/20 border-teal-500/30'
                    }`}>
                      <div className="text-center">
                        <h2 className={`text-2xl font-bold mb-2 ${
                          selectedSession.winner === 'champion'
                            ? 'text-blue-300'
                            : 'text-teal-300'
                        }`}>
                          WINNER: {selectedSession.winner === 'champion' ? 'Champion' : 'Challenger'}
                        </h2>
                        <p className={`text-sm ${
                          selectedSession.winner === 'champion'
                            ? 'text-blue-300/80'
                            : 'text-teal-300/80'
                        }`}>
                          Score Difference: {selectedSession.score_diff.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Side-by-Side Comparison */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Champion */}
                      <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-400 mb-4">Champion</h3>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Status Code</p>
                            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                              isStatusSuccess(selectedSession.champion.status_code)
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {selectedSession.champion.status_code}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">Latency</p>
                            <p className="text-lg font-semibold text-slate-100">{selectedSession.champion.latency_ms}ms</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">Score</p>
                            <p className="text-lg font-semibold text-slate-100">{selectedSession.champion.score.toFixed(2)}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">URL</p>
                            <p className="text-xs font-mono text-slate-300 break-all">{selectedSession.champion.url}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">Response</p>
                            <div className="p-3 bg-black/40 rounded font-mono text-xs text-slate-300 overflow-auto max-h-40">
                              {JSON.stringify(selectedSession.champion.response_body, null, 2)}
                            </div>
                          </div>

                          {selectedSession.champion.error && (
                            <div>
                              <p className="text-xs text-red-400 mb-1">Error</p>
                              <div className="p-3 bg-red-500/20 rounded font-mono text-xs text-red-300">
                                {selectedSession.champion.error}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Challenger */}
                      <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                        <h3 className="text-lg font-semibold text-teal-400 mb-4">Challenger</h3>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Status Code</p>
                            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                              isStatusSuccess(selectedSession.challenger.status_code)
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {selectedSession.challenger.status_code}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">Latency</p>
                            <p className="text-lg font-semibold text-slate-100">{selectedSession.challenger.latency_ms}ms</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">Score</p>
                            <p className="text-lg font-semibold text-slate-100">{selectedSession.challenger.score.toFixed(2)}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">URL</p>
                            <p className="text-xs font-mono text-slate-300 break-all">{selectedSession.challenger.url}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">Response</p>
                            <div className="p-3 bg-black/40 rounded font-mono text-xs text-slate-300 overflow-auto max-h-40">
                              {JSON.stringify(selectedSession.challenger.response_body, null, 2)}
                            </div>
                          </div>

                          {selectedSession.challenger.error && (
                            <div>
                              <p className="text-xs text-red-400 mb-1">Error</p>
                              <div className="p-3 bg-red-500/20 rounded font-mono text-xs text-red-300">
                                {selectedSession.challenger.error}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Latency Comparison Bar */}
                    <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
                      <h3 className="text-sm font-medium text-slate-300 mb-4">Latency Comparison</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-blue-400">Champion</span>
                            <span className="text-sm font-medium text-slate-100">{selectedSession.champion.latency_ms}ms</span>
                          </div>
                          <div className="h-4 rounded-full overflow-hidden bg-white/5 border border-white/10">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${(selectedSession.champion.latency_ms /
                                  Math.max(selectedSession.champion.latency_ms, selectedSession.challenger.latency_ms)) *
                                  100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-teal-400">Challenger</span>
                            <span className="text-sm font-medium text-slate-100">{selectedSession.challenger.latency_ms}ms</span>
                          </div>
                          <div className="h-4 rounded-full overflow-hidden bg-white/5 border border-white/10">
                            <div
                              className="h-full bg-teal-500"
                              style={{
                                width: `${(selectedSession.challenger.latency_ms /
                                  Math.max(selectedSession.champion.latency_ms, selectedSession.challenger.latency_ms)) *
                                  100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-center">
                    <div>
                      <p className="text-slate-400 mb-2">No session selected</p>
                      <p className="text-sm text-slate-500">Execute a comparison or select a session to view details</p>
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

export default CCCockpitPage
