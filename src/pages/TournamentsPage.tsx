import { useState } from 'react'
import { Search, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Filter, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { useStore } from '../data/store'
import { ExecutionLog, VariantResult } from '../types'

function StatusBadge({ code }: { code: number }) {
  const color = code < 300 ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
    : code < 500 ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    : 'text-red-400 bg-red-500/15 border-red-500/30'
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${color}`}>
      {code}
    </span>
  )
}

function LatencyBadge({ ms }: { ms: number }) {
  const color = ms < 100 ? 'text-emerald-400' : ms < 300 ? 'text-amber-400' : 'text-red-400'
  return <span className={`text-xs font-semibold font-mono ${color}`}>{ms}ms</span>
}

function ExpandedRow({ log }: { log: ExecutionLog }) {
  return (
    <tr className="border-b border-white/5">
      <td colSpan={7} className="px-5 py-4 bg-white/[0.01]">
        {/* Request info */}
        <div className="mb-4">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Request</div>
          <div className="font-mono text-xs text-slate-300 bg-black/20 rounded-lg px-3 py-2">
            <span className={`font-bold mr-2 ${log.request.method === 'GET' ? 'text-emerald-400' : log.request.method === 'POST' ? 'text-blue-400' : 'text-amber-400'}`}>
              {log.request.method}
            </span>
            {log.request.url}
          </div>
          {log.request.body && (
            <div className="mt-2 font-mono text-xs text-slate-400 bg-black/20 rounded-lg px-3 py-2 overflow-auto max-h-24">
              {log.request.body}
            </div>
          )}
        </div>

        {/* Variant results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {log.variant_results.map((r) => (
            <div
              key={r.variant_id}
              className={`rounded-xl border overflow-hidden ${r.variant_id === log.winner_variant_id ? 'border-emerald-500/30' : 'border-white/10'}`}
            >
              <div className={`px-3 py-2 flex items-center justify-between border-b ${r.variant_id === log.winner_variant_id ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">{r.variant_name}</span>
                  {r.variant_id === log.winner_variant_id && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">WIN</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge code={r.status_code} />
                  <LatencyBadge ms={r.latency_ms} />
                </div>
              </div>
              {r.error && (
                <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/20">
                  <span className="text-xs text-red-400">{r.error}</span>
                </div>
              )}
              <div className="p-3">
                <pre className="text-[10px] text-slate-300 font-mono overflow-auto max-h-32 bg-black/20 rounded p-2">
                  {JSON.stringify(r.response_body, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
}

export default function ExecutionLogsPage() {
  const { executionLogs, experiments, selectLog, setPage, selectExperiment } = useStore()
  const [query, setQuery] = useState('')
  const [filterExp, setFilterExp] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const filtered = executionLogs.filter((log) => {
    const matchQ = !query ||
      log.request_id.toLowerCase().includes(query.toLowerCase()) ||
      log.request.url.toLowerCase().includes(query.toLowerCase()) ||
      log.experiment_name.toLowerCase().includes(query.toLowerCase())
    const matchExp = filterExp === 'all' || log.experiment_id === filterExp
    const hasError = log.variant_results.some((r) => r.status_code >= 400 || r.error)
    const matchS =
      filterStatus === 'all' ||
      (filterStatus === 'error' && hasError) ||
      (filterStatus === 'success' && !hasError)
    return matchQ && matchExp && matchS
  })

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Execution Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            All API execution records — {executionLogs.length} total logs
          </p>
        </div>
        <button
          onClick={() => setPage('response-comparator')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
        >
          Response Comparator →
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search request ID, URL, experiment…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
        </div>
        <select
          value={filterExp}
          onChange={(e) => setFilterExp(e.target.value)}
          className="bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
        >
          <option value="all">All Experiments</option>
          {experiments.filter((e) => executionLogs.some((l) => l.experiment_id === e.id)).map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          {(['all', 'success', 'error'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-slate-100">{filtered.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Matching logs</div>
        </div>
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">
            {filtered.filter((l) => !l.variant_results.some((r) => r.status_code >= 400)).length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Successful</div>
        </div>
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-red-400">
            {filtered.filter((l) => l.variant_results.some((r) => r.status_code >= 400 || r.error)).length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">With errors</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['', 'Request ID', 'Experiment', 'Timestamp', 'Method / URL', 'Variant Statuses', 'Winner'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const isOpen = expanded.has(log.id)
                const hasError = log.variant_results.some((r) => r.status_code >= 400 || r.error)
                const winner = log.variant_results.find((r) => r.variant_id === log.winner_variant_id)
                return (
                  <>
                    <tr
                      key={log.id}
                      className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors ${isOpen ? 'bg-blue-600/5' : ''}`}
                      onClick={() => toggleExpand(log.id)}
                    >
                      <td className="px-3 py-3.5 w-8">
                        {hasError ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-slate-400">{log.request_id.slice(0, 12)}…</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors text-left truncate max-w-32"
                          onClick={(e) => {
                            e.stopPropagation()
                            selectExperiment(log.experiment_id)
                            setPage('cockpit')
                          }}
                        >
                          {log.experiment_name}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1 py-0.5 rounded font-mono ${
                            log.request.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400'
                            : log.request.method === 'POST' ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {log.request.method}
                          </span>
                          <span className="text-xs text-slate-400 font-mono truncate max-w-48">
                            {log.request.url}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {log.variant_results.map((r) => (
                            <div key={r.variant_id} className="text-center">
                              <StatusBadge code={r.status_code} />
                              <div className="text-[9px] text-slate-600 mt-0.5">{r.latency_ms}ms</div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-between gap-2">
                          {winner ? (
                            <span className="text-xs text-emerald-400 font-medium truncate max-w-28">{winner.variant_name}</span>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                        </div>
                      </td>
                    </tr>
                    {isOpen && <ExpandedRow key={log.id + '-expanded'} log={log} />}
                  </>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="text-slate-500">No execution logs match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
