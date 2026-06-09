import { Bell, Search, Zap } from 'lucide-react'
import { useStore, NavPage } from '../../data/store'

const PAGE_TITLES: Record<NavPage, { title: string; sub: string }> = {
  dashboard: { title: 'Executive Dashboard', sub: 'Platform overview & KPIs' },
  experiments: { title: 'Experiments', sub: 'All A/B tests' },
  'experiment-cockpit': { title: 'Live Cockpit', sub: 'Real-time experiment monitoring' },
  analytics: { title: 'Analytics Hub', sub: 'Metrics, funnels & segments' },
  'variant-designer': { title: 'Variant Designer', sub: 'Visual experiment editor' },
  'ai-insights': { title: 'AI Insights Center', sub: 'Hypothesis review & recommendations' },
  tournaments: { title: 'Tournaments', sub: 'Active & past challenges' },
  brackets: { title: 'Brackets', sub: 'Tournament bracket view' },
  leaderboard: { title: 'Leaderboard', sub: 'Team rankings' },
  'team-detail': { title: 'Team Performance', sub: 'Deep-dive team analytics' },
  'ai-coach': { title: 'AI Coach', sub: 'Strategic AI guidance' },
  users: { title: 'Users & Roles', sub: 'Access control' },
  settings: { title: 'Settings', sub: 'Platform configuration' },
  integrations: { title: 'Integrations', sub: 'Connected tools & APIs' },
}

export default function Topbar() {
  const { activePage, experiments, liveSessionCount } = useStore()
  const { title, sub } = PAGE_TITLES[activePage]
  const runningExps = experiments.filter((e) => e.status === 'running').length

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-4 px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">{title}</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        </div>
      </div>

      {/* Center: search */}
      <div className="hidden md:flex items-center gap-2 w-64">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400">
          <Search className="w-3.5 h-3.5" />
          <span>Search experiments…</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {runningExps > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] text-blue-700 font-semibold">{runningExps} live</span>
          </div>
        )}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
          <span className="text-[11px] text-gray-500">{liveSessionCount.toLocaleString()} sessions</span>
        </div>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors">
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:block">AI Insights</span>
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
