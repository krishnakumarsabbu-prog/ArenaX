import { Bell, Settings, FlaskConical, Zap, ChevronDown, Activity } from 'lucide-react'
import { useExperiments } from '@/api/hooks/useExperiments'
import { useChallenges } from '@/api/hooks/useChallenges'

export default function Topbar() {
  const { data: experiments = [] } = useExperiments()
  const { data: challenges = [] } = useChallenges()

  const runningExps = experiments.filter(e => e.status === 'running').length
  const runningChallenges = challenges.filter(c => c.status === 'running').length

  return (
    <header className="bg-[#0F172A] border-b border-white/5 h-14 px-6 flex items-center gap-4 sticky top-0 z-40 shadow-lg">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #0EA5E9)' }}>
          <FlaskConical className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-tight text-sm">XTest</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-blue-300"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
            v1.0
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-white/10" />

      {/* Live system status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs text-slate-400 font-medium">All systems</span>
          <span className="text-xs text-green-400 font-semibold">operational</span>
        </div>
      </div>

      {/* Live counters */}
      <div className="hidden lg:flex items-center gap-2 ml-2">
        {runningExps > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <span className="live-dot w-1.5 h-1.5" />
            <span className="text-xs text-blue-300 font-medium">{runningExps} running</span>
          </div>
        )}
        {runningChallenges > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.2)' }}>
            <span className="live-dot w-1.5 h-1.5 bg-teal-400" />
            <span className="text-xs text-teal-300 font-medium">{runningChallenges} challenge{runningChallenges > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        {/* Insights trigger */}
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:bg-white/5 transition-colors"
          style={{ border: '1px solid rgba(251,191,36,0.2)' }}>
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden md:block">AI Insights</span>
        </button>

        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        <div className="ml-1 flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
            KP
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-white leading-none">Kai Patel</div>
            <div className="text-xs text-slate-500 mt-0.5">Platform Eng</div>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </div>
      </div>
    </header>
  )
}
