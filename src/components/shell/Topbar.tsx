import { Bell, Search, Activity } from 'lucide-react'
import { useStore, NavPage } from '../../data/store'

const PAGE_TITLES: Record<NavPage, { title: string; sub: string }> = {
  dashboard:              { title: 'API Lab Dashboard', sub: 'Real-time API experimentation overview' },
  experiments:            { title: 'API Experiments', sub: 'Manage and monitor all experiments' },
  'api-builder':          { title: 'API Builder', sub: 'Create a new API experiment' },
  cockpit:                { title: 'Live Cockpit', sub: 'Real-time execution monitoring & response comparison' },
  analytics:              { title: 'Analytics Hub', sub: 'Latency, error rates, and throughput analysis' },
  'ai-insights':          { title: 'AI Insights', sub: 'AI-driven winner detection and recommendations' },
  'execution-logs':       { title: 'Execution Logs', sub: 'All API execution records' },
  'response-comparator':  { title: 'Response Comparator', sub: 'Side-by-side JSON diff viewer' },
  users:                  { title: 'Users & Roles', sub: 'Access control management' },
  settings:               { title: 'Settings', sub: 'Platform configuration' },
  integrations:           { title: 'Integrations', sub: 'Connected tools & APIs' },
}

export default function Topbar() {
  const { activePage, experiments, liveRequestCount, liveErrorCount } = useStore()
  const { title, sub } = PAGE_TITLES[activePage] ?? { title: activePage, sub: '' }
  const runningExps = experiments.filter((e) => e.status === 'running').length

  return (
    <header className="h-14 bg-[#0D1117] border-b border-white/5 flex items-center gap-4 px-6 sticky top-0 z-30">
      <div className="flex-1">
        <h1 className="text-sm font-bold text-slate-100 leading-none">{title}</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
      </div>

      {/* Center: search */}
      <div className="hidden md:flex items-center gap-2 w-64">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-500">
          <Search className="w-3.5 h-3.5" />
          <span>Search experiments…</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {runningExps > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-semibold">{runningExps} running</span>
          </div>
        )}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
          <Activity className="w-3 h-3 text-slate-500" />
          <span className="text-[11px] text-slate-400">
            {(liveRequestCount / 1000).toFixed(1)}k req
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="text-[11px] text-red-400 font-medium">{liveErrorCount} err</span>
        </div>
        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
