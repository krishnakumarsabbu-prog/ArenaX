import {
  LayoutDashboard, SlidersHorizontal, FlaskConical, BarChart3, Layers, Sparkles,
  Trophy, GitBranch, ListOrdered, Users, Brain,
  UserCog, Settings, Plug, ChevronRight, Activity,
} from 'lucide-react'
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
  const { activePage, setPage, experiments, challenges } = useStore()

  const runningExps = experiments.filter((e) => e.status === 'running').length
  const runningChs = challenges.filter((c) => c.status === 'running').length

  const groups: NavGroup[] = [
    {
      label: '',
      items: [
        { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'A/B Testing',
      items: [
        { label: 'Experiments', page: 'experiments', icon: SlidersHorizontal, badge: String(experiments.length) },
        { label: 'Live Cockpit', page: 'experiment-cockpit', icon: FlaskConical, live: runningExps > 0, badge: runningExps > 0 ? String(runningExps) : undefined },
        { label: 'Analytics Hub', page: 'analytics', icon: BarChart3 },
        { label: 'Variant Designer', page: 'variant-designer', icon: Layers },
        { label: 'AI Insights', page: 'ai-insights', icon: Sparkles },
      ],
    },
    {
      label: 'Challenge Champion',
      items: [
        { label: 'Tournaments', page: 'tournaments', icon: Trophy, badge: String(challenges.length) },
        { label: 'Brackets', page: 'brackets', icon: GitBranch, live: runningChs > 0 },
        { label: 'Leaderboard', page: 'leaderboard', icon: ListOrdered },
        { label: 'Team Performance', page: 'team-detail', icon: Users },
        { label: 'AI Coach', page: 'ai-coach', icon: Brain },
      ],
    },
    {
      label: 'Administration',
      items: [
        { label: 'Users & Roles', page: 'users', icon: UserCog },
        { label: 'Settings', page: 'settings', icon: Settings },
        { label: 'Integrations', page: 'integrations', icon: Plug },
      ],
    },
  ]

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#0D1117] border-r border-white/5 min-h-screen">
      {/* Brand */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
          <FlaskConical className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight leading-none">XTest</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Platform v2.0</div>
        </div>
      </div>

      {/* Live status */}
      <div className="px-3 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.03]">
          <Activity className="w-3 h-3 text-green-400 flex-shrink-0" />
          <span className="text-[11px] text-slate-400 font-medium">Systems</span>
          <span className="text-[11px] text-green-400 font-semibold ml-auto">operational</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            {group.label && (
              <div className="px-2 mb-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activePage === item.page
                const Icon = item.icon
                return (
                  <button
                    key={item.page}
                    onClick={() => setPage(item.page)}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left
                      text-[13px] font-medium transition-all duration-150 group
                      ${active
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.live && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      )}
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                          ${active ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-slate-500'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {active && <ChevronRight className="w-3 h-3 text-blue-400/60 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
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
