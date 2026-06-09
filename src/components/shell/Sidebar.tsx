import { Zap, LayoutDashboard, FlaskConical, CirclePlus as PlusCircle, Activity, BarChart3, Settings, ChevronRight } from 'lucide-react'
import { useStore, NavPage } from '../../data/store'

interface NavItem {
  label: string
  page: NavPage
  icon: React.ElementType
  badge?: string
  live?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export default function Sidebar() {
  const { activePage, activeModule, setPage, setModule, liveRequestCount } = useStore()

  const abGroup: NavGroup = {
    label: 'A/B Testing',
    items: [
      { label: 'Experiments', page: 'ab-experiments', icon: FlaskConical },
      { label: 'New Experiment', page: 'ab-builder', icon: PlusCircle },
      { label: 'Live Cockpit', page: 'ab-cockpit', icon: Activity, live: true },
      { label: 'Analytics', page: 'ab-analytics', icon: BarChart3 },
    ],
  }

  const ccGroup: NavGroup = {
    label: 'Champion vs Challenger',
    items: [
      { label: 'Experiments', page: 'cc-experiments', icon: FlaskConical },
      { label: 'New Experiment', page: 'cc-builder', icon: PlusCircle },
      { label: 'Live Cockpit', page: 'cc-cockpit', icon: Activity, live: true },
      { label: 'Analytics', page: 'cc-analytics', icon: BarChart3 },
    ],
  }

  function NavBtn({ item }: { item: NavItem }) {
    const active = activePage === item.page
    const Icon = item.icon
    return (
      <button
        onClick={() => setPage(item.page)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] font-medium transition-all duration-150 group
          ${active
            ? activeModule === 'AB'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
              : 'bg-teal-600/20 text-teal-400 border border-teal-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
          }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? (activeModule === 'AB' ? 'text-blue-400' : 'text-teal-400') : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        {active && <ChevronRight className="w-3 h-3 opacity-60 flex-shrink-0" />}
      </button>
    )
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#0D1117] border-r border-white/5 min-h-screen">
      {/* Brand */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight leading-none">XTest</div>
          <div className="text-[10px] text-cyan-500 mt-0.5 font-semibold tracking-wide">API Lab 2.0</div>
        </div>
      </div>

      {/* Live status */}
      <div className="px-3 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-[11px] text-emerald-400 font-semibold flex-1">Gateway Live</span>
          <span className="text-[10px] text-emerald-600 font-medium">{liveRequestCount} req</span>
        </div>
      </div>

      {/* Module tabs */}
      <div className="px-3 py-2.5 border-b border-white/5">
        <div className="flex rounded-lg bg-white/5 p-0.5 gap-0.5">
          <button
            onClick={() => { setModule('AB'); setPage('ab-experiments') }}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${activeModule === 'AB' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            A/B Test
          </button>
          <button
            onClick={() => { setModule('CC'); setPage('cc-experiments') }}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${activeModule === 'CC' ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Champ/Chall
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {/* Dashboard */}
        <div>
          <button
            onClick={() => setPage('dashboard')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] font-medium transition-all border
              ${activePage === 'dashboard' ? 'bg-slate-700/50 text-slate-200 border-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'}`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0 text-slate-500" />
            <span className="flex-1">Dashboard</span>
          </button>
        </div>

        {/* A/B Section */}
        <div>
          <div className="px-2 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-[10px] font-semibold text-blue-500/80 uppercase tracking-widest">{abGroup.label}</span>
          </div>
          <div className="space-y-0.5">
            {abGroup.items.map((item) => <NavBtn key={item.page} item={item} />)}
          </div>
        </div>

        {/* CC Section */}
        <div>
          <div className="px-2 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
            <span className="text-[10px] font-semibold text-teal-500/80 uppercase tracking-widest">{ccGroup.label}</span>
          </div>
          <div className="space-y-0.5">
            {ccGroup.items.map((item) => <NavBtn key={item.page} item={item} />)}
          </div>
        </div>

        {/* Admin */}
        <div>
          <div className="space-y-0.5">
            <button
              onClick={() => setPage('settings')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all border
                ${activePage === 'settings' ? 'bg-slate-700/50 text-slate-200 border-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'}`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="flex-1">Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}>
            KP
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-slate-200 leading-none truncate">Kai Patel</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Platform Eng</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
