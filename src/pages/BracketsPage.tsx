import { useState } from 'react'
import { GitCompare, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../data/store'
import { ExecutionLog, VariantResult } from '../types'

const STATUS_COLOR = (code: number) =>
  code < 300 ? 'text-emerald-400' : code < 500 ? 'text-amber-400' : 'text-red-400'

function flatDiff(a: unknown, b: unknown, path = ''): { path: string; aVal: string; bVal: string; differs: boolean }[] {
  const results: { path: string; aVal: string; bVal: string; differs: boolean }[] = []
  const aIsObj = a !== null && typeof a === 'object' && !Array.isArray(a)
  const bIsObj = b !== null && typeof b === 'object' && !Array.isArray(b)

  if (aIsObj && bIsObj) {
    const keys = Array.from(new Set([...Object.keys(a as object), ...Object.keys(b as object)]))
    for (const key of keys) {
      results.push(...flatDiff((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], path ? `${path}.${key}` : key))
    }
  } else {
    const aStr = JSON.stringify(a) ?? 'undefined'
    const bStr = JSON.stringify(b) ?? 'undefined'
    results.push({ path: path || '(root)', aVal: aStr, bVal: bStr, differs: aStr !== bStr })
  }
  return results
}

function VariantPanel({ result, isWinner }: { result: VariantResult; isWinner: boolean }) {
  return (
    <div className={`flex-1 bg-[#0D1117] border rounded-xl overflow-hidden ${isWinner ? 'border-emerald-500/30' : 'border-white/10'}`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isWinner ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.02] border-white/5'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isWinner ? 'bg-emerald-400' : 'bg-slate-400'}`} />
          <span className="text-sm font-semibold text-slate-200">{result.variant_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${STATUS_COLOR(result.status_code)}`}>{result.status_code}</span>
          <span className={`text-xs font-semibold ${result.latency_ms < 100 ? 'text-emerald-400' : result.latency_ms < 300 ? 'text-amber-400' : 'text-red-400'}`}>
            {result.latency_ms}ms
          </span>
          {isWinner && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              WINNER
            </span>
          )}
        </div>
      </div>

      {/* Response headers */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Headers</div>
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
        <div className="bg-black/30 rounded-lg p-3 overflow-auto max-h-80">
          <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap">
            {JSON.stringify(result.response_body, null, 2)}
          </pre>
        </div>
      </div>

      {/* Payload size */}
      <div className="px-4 py-2.5 border-t border-white/5 flex justify-between text-[10px] text-slate-600">
        <span>Payload: {(result.payload_size_bytes / 1024).toFixed(1)} KB</span>
        {result.error && <span className="text-red-400">{result.error}</span>}
      </div>
    </div>
  )
}

export default function ResponseComparatorPage() {
  const { executionLogs, experiments, selectExperiment, setPage } = useStore()

  const [filterExp, setFilterExp] = useState<string>('all')
  const [currentIdx, setCurrentIdx] = useState(0)

  const filtered = filterExp === 'all'
    ? executionLogs.filter((l) => l.variant_results.length >= 2)
    : executionLogs.filter((l) => l.experiment_id === filterExp && l.variant_results.length >= 2)

  const log: ExecutionLog | undefined = filtered[currentIdx]
  const diffEntries = log && log.variant_results.length >= 2
    ? flatDiff(log.variant_results[0].response_body, log.variant_results[1].response_body)
    : []

  const changed = diffEntries.filter((d) => d.differs)
  const unchanged = diffEntries.filter((d) => !d.differs)

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Response Comparator</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Side-by-side JSON diff viewer for variant responses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterExp}
            onChange={(e) => { setFilterExp(e.target.value); setCurrentIdx(0) }}
            className="bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
          >
            <option value="all">All Experiments</option>
            {experiments.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          {log && (
            <button
              onClick={() => { selectExperiment(log.experiment_id); setPage('cockpit') }}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              View Cockpit →
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <GitCompare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No execution logs with multiple variants</p>
            <p className="text-slate-600 text-sm mt-1">Run champion/challenger or shadow experiments to compare responses</p>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation */}
          <div className="flex items-center justify-between bg-[#0D1117] border border-white/5 rounded-xl px-4 py-3">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-200">
                {log?.experiment_name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                {log?.request.method} {log?.request.url}
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">
                Log {currentIdx + 1} of {filtered.length} · {log && new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => setCurrentIdx(Math.min(filtered.length - 1, currentIdx + 1))}
              disabled={currentIdx >= filtered.length - 1}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {log && (
            <>
              {/* Side-by-side panels */}
              <div className="flex gap-4">
                {log.variant_results.map((r) => (
                  <VariantPanel
                    key={r.variant_id}
                    result={r}
                    isWinner={r.variant_id === log.winner_variant_id}
                  />
                ))}
              </div>

              {/* JSON Diff Table */}
              <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">JSON Diff Analysis</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {changed.length} changed fields · {unchanged.length} identical fields
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-slate-500">Changed</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                      <span className="text-slate-500">Identical</span>
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-48">JSON Path</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {log.variant_results[0]?.variant_name}
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {log.variant_results[1]?.variant_name}
                        </th>
                        <th className="px-5 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Diff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...changed, ...unchanged].map((entry, i) => (
                        <tr
                          key={i}
                          className={`border-b border-white/5 ${entry.differs ? 'bg-amber-500/5' : ''}`}
                        >
                          <td className="px-5 py-2.5 font-mono text-slate-400">{entry.path}</td>
                          <td className={`px-5 py-2.5 font-mono ${entry.differs ? 'text-red-400' : 'text-slate-400'}`}>
                            {entry.aVal.length > 60 ? entry.aVal.slice(0, 60) + '…' : entry.aVal}
                          </td>
                          <td className={`px-5 py-2.5 font-mono ${entry.differs ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {entry.bVal.length > 60 ? entry.bVal.slice(0, 60) + '…' : entry.bVal}
                          </td>
                          <td className="px-5 py-2.5 text-center">
                            {entry.differs ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                                CHANGED
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-600">same</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
