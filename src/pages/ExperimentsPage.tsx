import { useState } from 'react'
import { Plus, Search, Filter, ChevronRight, FlaskConical, Eye, Pause, Play, Trash2 } from 'lucide-react'
import { useStore } from '../data/store'
import { Experiment } from '../types'
import NewExperimentModal from '../components/ab/NewExperimentModal'

const STATUS_STYLES: Record<Experiment['status'], { bg: string; text: string; dot: string; label: string }> = {
  running:   { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Running' },
  paused:    { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  label: 'Paused' },
  concluded: { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Concluded' },
  draft:     { bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-400',   label: 'Draft' },
}

const GOAL_LABELS: Record<string, string> = {
  conversion: 'Conversion', click: 'Click-through', scroll: 'Scroll depth'
}

export default function ExperimentsPage() {
  const { experiments, setPage, selectExperiment, updateExperimentStatus } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | Experiment['status']>('all')
  const [showNew, setShowNew] = useState(false)

  const filtered = experiments.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.url.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || e.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    all: experiments.length,
    running: experiments.filter(e => e.status === 'running').length,
    paused: experiments.filter(e => e.status === 'paused').length,
    concluded: experiments.filter(e => e.status === 'concluded').length,
    draft: experiments.filter(e => e.status === 'draft').length,
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">All Experiments</h2>
          <p className="text-sm text-gray-400 mt-0.5">{experiments.length} experiments · {counts.running} running</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="btn-primary">
          <Plus className="w-4 h-4" /> New Experiment
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search experiments…"
            className="input pl-9" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['all', 'running', 'paused', 'concluded', 'draft'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                ${filter === s ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              {s} {s !== 'all' && <span className="ml-1 opacity-70">{counts[s]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Experiment</th>
              <th>Status</th>
              <th>Goal</th>
              <th className="text-right">Sessions</th>
              <th className="text-right">Variants</th>
              <th className="text-right">Leading Lift</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 text-sm text-gray-400">No experiments found</td></tr>
            )}
            {filtered.map((exp) => {
              const s = STATUS_STYLES[exp.status]
              return (
                <tr key={exp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FlaskConical className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{exp.name}</div>
                        <div className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{exp.url}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${exp.status === 'running' ? 'animate-pulse' : ''}`} />
                      {s.label}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-600 font-medium">{GOAL_LABELS[exp.goal_metric]}</span>
                  </td>
                  <td className="text-right">
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">{exp.total_sessions.toLocaleString()}</span>
                  </td>
                  <td className="text-right">
                    <span className="text-sm text-gray-600">{exp.variant_count}</span>
                  </td>
                  <td className="text-right">
                    {exp.leading_lift !== null ? (
                      <span className="text-sm font-bold text-green-700">+{exp.leading_lift}%</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { selectExperiment(exp.id); setPage('experiment-cockpit') }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View in Cockpit">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {exp.status === 'running' && (
                        <button
                          onClick={() => updateExperimentStatus(exp.id, 'paused')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Pause">
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {exp.status === 'paused' && (
                        <button
                          onClick={() => updateExperimentStatus(exp.id, 'running')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Resume">
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showNew && <NewExperimentModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
