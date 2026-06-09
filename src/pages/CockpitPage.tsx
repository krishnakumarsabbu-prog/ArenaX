import { useState } from 'react'
import { ChevronLeft, Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../data/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ExecutionLog, VariantResult } from '../types'

const STATUS_COLOR = (code: number) =>
  code < 300 ? 'text-emerald-400' : code < 500 ? 'text-amber-400' : 'text-red-400'

const STATUS_BG = (code: number) =>
  code < 300 ? 'bg-emerald-500/15 border-emerald-500/30'
  : code < 500 ? 'bg-amber-500/15 border-amber-500/30'
  : 'bg-red-500/15 border-red-500/30'

function JsonDiff({ a, b }: { a: Record<string, unknown>; b: Record<string, unknown> }) {
  const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]))
  return (
    <div className="font-mono text-xs leading-relaxed">
      {allKeys.map((key) => {
        const valA = JSON.stringify(a[key], null, 2)
        const valB = JSON.stringify(b[key], null, 2)
        const differs = valA !== valB
        const onlyA = !(key in b)
        const onlyB = !(key in a)
        return (
          <div key={key} className={`mb-1 ${differs ? 'bg-amber-500/5 border-l-2 border-amber-500/40 pl-2' : ''}`}>
            <span className="text-slate-500">"{key}": </span>
            {differs || onlyA || onlyB ? (
              <span>
                {!onlyB && <span className={`${onlyA ? 'text-blue-400' : 'text-red-400 line-through'} mr-2`}>{valA}</span>}
                {!onlyA && <span className="text-emerald-400">{valB}</span>}
              </span>
            ) : (
              <span className="text-slate-400">{valA}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function VariantPanel({ result, isWinner }: { result: VariantResult; isWinner: boolean }) {
  return (
    <div className={`flex-1 rounded-xl border overflow-hidden ${isWinner ? 'border-emerald-500/30' : 'border-white/10'}`}>
      {/* Panel header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isWinner ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.02] border-white/5'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isWinner ? 'bg-emerald-400' : 'bg-slate-400'}`} />
          <span className="text-sm font-semibold text-slate-200">{result.variant_name}</span>
        </div>
        {isWinner && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold">
            WINNER
          </span>
        )}
      </div>

      {/* Metrics row */}
      <div className={`grid grid-cols-3 border-b ${isWinner ? 'border-emerald-500/15' : 'border-white/5'}`}>
        <div className="px-4 py-3 text-center">
          <div className={`text-lg font-bold ${STATUS_COLOR(result.status_code)}`}>{result.status_code}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">status</div>
        </div>
        <div className={`px-4 py-3 text-center border-x ${isWinner ? 'border-emerald-500/15' : 'border-white/5'}`}>
          <div className={`text-lg font-bold ${result.latency_ms < 100 ? 'text-emerald-400' : result.latency_ms < 300 ? 'text-amber-400' : 'text-red-400'}`}>
            {result.latency_ms}ms
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">latency</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-lg font-bold text-slate-300">{(result.payload_size_bytes / 1024).toFixed(1)}KB</div>
          <div className="text-[10px] text-slate-500 mt-0.5">size</div>
        </div>
      </div>

      {/* Error */}
      {result.error && (
        <div className="px-4 py-2.5 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-400">{result.error}</span>
          </div>
        </div>
      )}

      {/* Response headers */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Response Headers</div>
        <div className="space-y-1">
          {Object.entries(result.response_headers).map(([k, v]) => (
            <div key={k} className="flex gap-2 text-[11px]">
              <span className="text-slate-500 font-mono flex-shrink-0">{k}:</span>
              <span className="text-slate-300 font-mono truncate">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Response body */}
      <div className="px-4 py-3">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Response Body</div>
        <div className="bg-black/30 rounded-lg p-3 overflow-auto max-h-56">
          <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap">
            {JSON.stringify(result.response_body, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

function LogRow({
  log,
  isSelected,
  onClick,
}: {
  log: ExecutionLog
  isSelected: boolean
  onClick: () => void
}) {
  const winner = log.variant_results.find((r) => r.variant_id === log.winner_variant_id)
  const hasError = log.variant_results.some((r) => r.error || r.status_code >= 400)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 text-left border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
        isSelected ? 'bg-blue-600/10 border-blue-500/20' : ''
      }`}
    >
      <div className="flex-shrink-0 w-5">
        {hasError ? (
          <AlertTriangle className="w-4 h-4 text-red-400" />
        ) : (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono text-slate-400 truncate">{log.request_id}</div>
        <div className="text-[10px] text-slate-600 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</div>
      </div>
      <div className="flex items-center gap-3">
        {log.variant_results.map((r) => (
          <div key={r.variant_id} className="text-right">
            <div className={`text-xs font-bold ${STATUS_COLOR(r.status_code)}`}>{r.status_code}</div>
            <div className="text-[10px] text-slate-500">{r.latency_ms}ms</div>
          </div>
        ))}
      </div>
      {isSelected ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
    </button>
  )
}

export default function CockpitPage() {
  const { experiments, selectedExperimentId, selectExperiment, getVariantsForExperiment, getLogsForExperiment, analyticsMap, setPage } = useStore()
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  const exp = experiments.find((e) => e.id === selectedExperimentId) ?? experiments.find((e) => e.status === 'running') ?? experiments[0]

  if (!exp) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity className="w-10 h-10 text-slate-600 mb-3 mx-auto" />
          <p className="text-slate-400">No experiments found. Create one first.</p>
        </div>
      </div>
    )
  }

  const variants = getVariantsForExperiment(exp.id)
  const logs = getLogsForExperiment(exp.id)
  const analytics = analyticsMap[exp.id]
  const selectedLog = logs.find((l) => l.id === selectedLogId) ?? logs[0] ?? null

  const latencyChartData = variants.map((v) => ({
    name: v.name.length > 14 ? v.name.slice(0, 14) + '…' : v.name,
    p50: v.p50_latency_ms,
    p95: v.p95_latency_ms,
    avg: v.avg_latency_ms,
  }))

  const MODE_LABEL: Record<string, string> = {
    ab: 'A/B Test',
    champion_challenger: 'Champion/Challenger',
    shadow: 'Shadow Mode',
  }

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#0D1117] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPage('experiments')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Experiments
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-200">{exp.name}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                exp.status === 'running' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : exp.status === 'concluded' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {exp.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              {exp.request_config.method} {exp.request_config.base_url}{exp.request_config.path}
            </div>
          </div>
        </div>

        {/* Experiment selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Switch:</span>
          <select
            value={exp.id}
            onChange={(e) => selectExperiment(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
          >
            {experiments.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Logs list */}
        <div className="w-72 flex-shrink-0 border-r border-white/5 bg-[#0D1117] flex flex-col">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="text-xs font-semibold text-slate-400">Execution Logs</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{logs.length} records</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {logs.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No execution logs yet</p>
              </div>
            )}
            {logs.map((log) => (
              <LogRow
                key={log.id}
                log={log}
                isSelected={selectedLog?.id === log.id}
                onClick={() => setSelectedLogId(log.id === selectedLogId ? null : log.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: Main content */}
        <div className="flex-1 overflow-auto p-5 space-y-5">
          {/* Variant metrics overview */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Latency comparison */}
              <div className="bg-[#0D1117] border border-white/5 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Latency Comparison</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={latencyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} unit="ms" />
                    <Tooltip
                      contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                    />
                    <Bar dataKey="p50" name="p50" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="p95" name="p95" fill="#0EA5E9" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Variant score cards */}
              <div className="bg-[#0D1117] border border-white/5 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Variant Scores</h3>
                <div className="space-y-3">
                  {analytics.variant_metrics.map((m) => {
                    const isWinner = m.variant_id === exp.winner_variant_id
                    return (
                      <div key={m.variant_id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-300 font-medium">{m.variant_name}</span>
                            {isWinner && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">WINNER</span>}
                          </div>
                          <span className="text-sm font-bold text-slate-100">{m.score.toFixed(1)}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isWinner ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${m.score}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                          <span>{m.avg_latency_ms}ms avg</span>
                          <span>{m.error_rate.toFixed(1)}% errors</span>
                          <span>{(m.request_count / 1000).toFixed(1)}k req</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Side-by-side response comparison */}
          {selectedLog && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Response Comparison</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    {selectedLog.request.method} {selectedLog.request.url}
                    <span className="text-slate-600 ml-2">• {new Date(selectedLog.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                {selectedLog.request.body && (
                  <div className="text-[10px] text-slate-600 bg-white/5 border border-white/10 rounded px-2 py-1 font-mono">
                    Body: {selectedLog.request.body.slice(0, 40)}…
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                {selectedLog.variant_results.map((result) => (
                  <VariantPanel
                    key={result.variant_id}
                    result={result}
                    isWinner={result.variant_id === selectedLog.winner_variant_id}
                  />
                ))}
              </div>

              {/* JSON diff */}
              {selectedLog.variant_results.length >= 2 && (
                <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-amber-500/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-semibold text-amber-400">Response Diff</span>
                      <span className="text-[10px] text-slate-600 ml-1">
                        {selectedLog.variant_results[0].variant_name} vs {selectedLog.variant_results[1].variant_name}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 overflow-auto max-h-48">
                    <JsonDiff
                      a={selectedLog.variant_results[0].response_body}
                      b={selectedLog.variant_results[1].response_body}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedLog && logs.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Activity className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No execution logs for this experiment</p>
                <p className="text-slate-600 text-xs mt-1">Start the experiment to begin capturing API responses</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
