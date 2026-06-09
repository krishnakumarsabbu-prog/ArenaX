import { Bell, Activity } from 'lucide-react'
import { useStore, NavPage } from '../../data/store'

const PAGE_TITLES: Record<NavPage, { title: string; sub: string }> = {
  dashboard:       { title: 'API Lab Dashboard', sub: 'Real-time experimentation overview' },
  'ab-experiments':{ title: 'A/B Experiments', sub: 'Traffic split routing experiments' },
  'ab-builder':    { title: 'New A/B Experiment', sub: 'Configure traffic split experiment' },
  'ab-cockpit':    { title: 'A/B Live Cockpit', sub: 'Session execution & variant distribution' },
  'ab-analytics':  { title: 'A/B Analytics', sub: 'Traffic split performance analysis' },
  'cc-experiments':{ title: 'Champion vs Challenger', sub: 'Parallel execution comparison experiments' },
  'cc-builder':    { title: 'New CC Experiment', sub: 'Configure champion vs challenger experiment' },
  'cc-cockpit':    { title: 'CC Live Cockpit', sub: 'Side-by-side response comparison' },
  'cc-analytics':  { title: 'CC Analytics', sub: 'Champion vs Challenger performance analysis' },
  settings:        { title: 'Settings', sub: 'Platform configuration' },
}

export default function Topbar() {
  const { activePage, activeModule, liveRequestCount, liveErrorCount } = useStore()
  const info = PAGE_TITLES[activePage] ?? { title: activePage, sub: '' }

  return (
    <header className="h-14 bg-[#0D1117] border-b border-white/5 flex items-center gap-4 px-6 sticky top-0 z-30">
      <div className="flex-1">
        <h1 className="text-sm font-bold text-slate-100 leading-none">{info.title}</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">{info.sub}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold
          ${activeModule === 'AB' ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-teal-600/10 border-teal-500/30 text-teal-400'}`}>
          {activeModule === 'AB' ? 'A/B Mode' : 'CC Mode'}
        </div>
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
          <Activity className="w-3 h-3 text-slate-500" />
          <span className="text-[11px] text-slate-400">{liveRequestCount} req</span>
        </div>
        {liveErrorCount > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="text-[11px] text-red-400 font-medium">{liveErrorCount} err</span>
          </div>
        )}
        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
