import React, { useState, useEffect } from 'react'
import { Search, Play, Pause, Trash2, Plus, RotateCcw, Zap } from 'lucide-react'
import { ccApi } from '../api/client'
import type { CCExperiment } from '../types'
import { useStore } from '../data/store'

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    running: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    draft: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    concluded: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const CCExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<CCExperiment[]>([])
  const [filteredExperiments, setFilteredExperiments] = useState<CCExperiment[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'running' | 'paused' | 'draft' | 'concluded'>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { setPage, selectExperiment } = useStore()

  const fetchExperiments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await ccApi.list()
      const data = res.data || []
      setExperiments(data)
      applyFilters(data, search, filter)
    } catch (error) {
      console.error('Failed to fetch experiments:', error)
    } finally {
      if (isRefresh) setRefreshing(false)
      else setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiments()
  }, [])

  const applyFilters = (data: CCExperiment[], searchTerm: string, statusFilter: string) => {
    let filtered = data
    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status === statusFilter)
    }
    if (searchTerm) {
      filtered = filtered.filter((e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredExperiments(filtered)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    applyFilters(experiments, value, filter)
  }

  const handleFilter = (newFilter: typeof filter) => {
    setFilter(newFilter)
    applyFilters(experiments, search, newFilter)
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'paused' : 'running'
    try {
      await ccApi.update(id, { status: newStatus })
      fetchExperiments()
    } catch (error) {
      console.error('Failed to update experiment:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experiment?')) return
    try {
      await ccApi.delete(id)
      fetchExperiments()
    } catch (error) {
      console.error('Failed to delete experiment:', error)
    }
  }

  const handleCockpit = (experimentId: string) => {
    selectExperiment(experimentId)
    setPage('cc-cockpit')
  }

  const getWinRatePercentage = (exp: CCExperiment) => {
    const total = exp.champion_wins + exp.challenger_wins
    if (total === 0) return { champion: 0, challenger: 0 }
    return {
      champion: Math.round((exp.champion_wins / total) * 100),
      challenger: Math.round((exp.challenger_wins / total) * 100),
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Champion vs Challenger</h1>
            <p className="text-slate-400">Create and manage CC experiments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchExperiments(true)}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg border border-white/8 bg-white/5 hover:bg-white/10 text-slate-100 flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw size={18} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setPage('cc-builder')}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
            >
              <Plus size={18} />
              New Experiment
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search experiments..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'running', 'paused', 'draft', 'concluded'] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  filter === f
                    ? 'bg-teal-600 border-teal-500 text-white'
                    : 'border-white/8 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Experiments Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700 border-t-teal-500" />
          </div>
        ) : filteredExperiments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <Zap className="text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No experiments found</h3>
            <p className="text-slate-500 mb-6">Get started by creating your first CC experiment</p>
            <button
              onClick={() => setPage('cc-builder')}
              className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
            >
              <Plus size={18} />
              Create Experiment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExperiments.map((exp) => {
              const winRate = getWinRatePercentage(exp)
              const total = exp.champion_wins + exp.challenger_wins
              return (
                <div
                  key={exp.id}
                  className="bg-[#0D1117] border border-white/8 rounded-lg p-6 hover:border-white/12 transition-all"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{exp.name}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{exp.description}</p>
                    <div className="flex gap-2 mt-3">
                      <StatusBadge status={exp.status} />
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {exp.method}
                      </span>
                    </div>
                  </div>

                  {/* URLs */}
                  <div className="mb-4 space-y-2">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">Champion URL</p>
                      <p className="text-xs text-slate-300 break-all font-mono">{exp.champion_url}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-xs text-slate-500 mb-1">Challenger URL</p>
                      <p className="text-xs text-slate-300 break-all font-mono">{exp.challenger_url}</p>
                    </div>
                  </div>

                  {/* Win Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Champion</p>
                      <p className="text-sm font-semibold text-slate-100">{exp.champion_wins}</p>
                      <p className="text-xs text-slate-500">{winRate.champion}%</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-sm font-semibold text-slate-100">{total}</p>
                      <p className="text-xs text-slate-500">sessions</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Challenger</p>
                      <p className="text-sm font-semibold text-slate-100">{exp.challenger_wins}</p>
                      <p className="text-xs text-slate-500">{winRate.challenger}%</p>
                    </div>
                  </div>

                  {/* Win Rate Bar */}
                  <div className="mb-4">
                    <div className="flex h-2 rounded-full overflow-hidden bg-white/5 border border-white/10">
                      <div
                        style={{ width: `${winRate.champion}%` }}
                        className="bg-blue-500"
                      />
                      <div
                        style={{ width: `${winRate.challenger}%` }}
                        className="bg-teal-500"
                      />
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      <div>
                        <span className="text-slate-400">Champion</span>
                        <span className="text-slate-500 ml-1">{winRate.champion}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Challenger</span>
                        <span className="text-slate-500 ml-1">{winRate.challenger}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCockpit(exp.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Zap size={16} />
                      Cockpit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(exp.id, exp.status)}
                      className="px-3 py-2 rounded-lg border border-white/8 bg-white/5 hover:bg-white/10 text-slate-100"
                      title={exp.status === 'running' ? 'Pause' : 'Play'}
                    >
                      {exp.status === 'running' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="px-3 py-2 rounded-lg border border-white/8 bg-white/5 hover:bg-red-500/20 text-slate-100 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CCExperimentsPage
