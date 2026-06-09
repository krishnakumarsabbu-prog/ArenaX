import { useState } from 'react'
import { Plus, Search, FlaskConical, Play, Pause, Trash2, ChevronRight, Filter } from 'lucide-react'
import { useStore } from '../data/store'
import { ApiExperiment } from '../types'

const STATUS_STYLES: Record<string, string> = {
  running: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  concluded: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  draft: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

const MODE_STYLES: Record<string, string> = {
  ab: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  champion_challenger: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  shadow: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const MODE_LABELS: Record<string, string> = {
  ab: 'A/B Test',
  champion_challenger: 'Champion/Challenger',
  shadow: 'Shadow Mode',
}

const ENV_DOT: Record<string, string> = {
  prod: 'bg-red-400',
  staging: 'bg-amber-400',
  dev: 'bg-slate-400',
}

const AUTH_LABELS: Record<string, string> = {
  none: 'None',
  bearer: 'Bearer Token',
  api_key: 'API Key',
  oauth2: 'OAuth2',
  mtls: 'mTLS',
}

type FilterStatus = 'all' | ApiExperiment['status']

export default function ExperimentsPage() {
  const { experiments, updateExperimentStatus, setPage, selectExperiment } = useStore()
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterMode, setFilterMode] = useState<string>('all')

  const filtered = experiments.filter((e) => {
    const matchQ = e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.request_config.base_url.toLowerCase().includes(query.toLowerCase()) ||
      e.request_config.path.toLowerCase().includes(query.toLowerCase())
    const matchS = filterStatus === 'all' || e.status === filterStatus
    const matchM = filterMode === 'all' || e.execution_mode === filterMode
    return matchQ && matchS && matchM
  })

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">API Experiments</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {experiments.filter((e) => e.status === 'running').length} running ·{' '}
            {experiments.length} total
          </p>
        </div>
        <button
          onClick={() => setPage('api-builder')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Experiment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search experiments, endpoints…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          {(['all', 'running', 'paused', 'draft', 'concluded'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize
                ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'ab', 'champion_challenger', 'shadow']).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${filterMode === m ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              {m === 'all' ? 'All Modes' : m === 'champion_challenger' ? 'C/C' : m === 'ab' ? 'A/B' : 'Shadow'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((exp) => (
          <ExperimentCard
            key={exp.id}
            exp={exp}
            onView={() => { selectExperiment(exp.id); setPage('cockpit') }}
            onStatusToggle={(newStatus) => updateExperimentStatus(exp.id, newStatus)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
            <FlaskConical className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No experiments match your filters</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting the search or filters above</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ExperimentCard({
  exp,
  onView,
  onStatusToggle,
}: {
  exp: ApiExperiment
  onView: () => void
  onStatusToggle: (status: ApiExperiment['status']) => void
}) {
  return (
    <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all group">
      {/* Card header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ENV_DOT[exp.environment] || 'bg-slate-400'}`} />
            <h3 className="text-[13px] font-semibold text-slate-200 truncate">{exp.name}</h3>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 capitalize ${STATUS_STYLES[exp.status]}`}>
            {exp.status}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{exp.description}</p>
      </div>

      {/* Endpoint */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
            exp.request_config.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400'
            : exp.request_config.method === 'POST' ? 'bg-blue-500/20 text-blue-400'
            : exp.request_config.method === 'DELETE' ? 'bg-red-500/20 text-red-400'
            : 'bg-amber-500/20 text-amber-400'
          }`}>
            {exp.request_config.method}
          </span>
          <span className="text-[11px] text-slate-400 font-mono truncate flex-1">
            {exp.request_config.base_url}{exp.request_config.path}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 px-4 py-3 border-b border-white/5">
        <div className="text-center">
          <div className="text-base font-bold text-slate-100">
            {exp.total_requests > 0 ? (exp.total_requests / 1000).toFixed(1) + 'k' : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">requests</div>
        </div>
        <div className="text-center border-x border-white/5">
          <div className={`text-base font-bold ${
            exp.avg_latency_ms > 0 && exp.avg_latency_ms < 100 ? 'text-emerald-400'
            : exp.avg_latency_ms < 300 ? 'text-amber-400'
            : exp.avg_latency_ms > 0 ? 'text-red-400'
            : 'text-slate-500'
          }`}>
            {exp.avg_latency_ms > 0 ? exp.avg_latency_ms + 'ms' : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">avg latency</div>
        </div>
        <div className="text-center">
          <div className={`text-base font-bold ${
            exp.error_rate === 0 ? 'text-slate-500'
            : exp.error_rate < 1 ? 'text-emerald-400'
            : exp.error_rate < 3 ? 'text-amber-400'
            : 'text-red-400'
          }`}>
            {exp.total_requests > 0 ? exp.error_rate.toFixed(1) + '%' : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">error rate</div>
        </div>
      </div>

      {/* Tags + actions */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${MODE_STYLES[exp.execution_mode]}`}>
            {MODE_LABELS[exp.execution_mode]}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-medium capitalize">
            {exp.environment}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-medium">
            {AUTH_LABELS[exp.auth_config.type]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {exp.status === 'running' && (
            <button
              onClick={() => onStatusToggle('paused')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              title="Pause experiment"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          {exp.status === 'paused' && (
            <button
              onClick={() => onStatusToggle('running')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title="Resume experiment"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition-colors"
          >
            View <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
