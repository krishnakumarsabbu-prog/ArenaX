import {
  TrendingUp, FlaskConical, Users, Trophy, Target, Zap,
  ArrowUpRight, ArrowDownRight, Activity, BarChart2, ChevronRight, Sparkles
} from 'lucide-react'
import { useStore } from '../data/store'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

const sessionData = [
  { day: 'Mon', sessions: 6200, conversions: 744 },
  { day: 'Tue', sessions: 7100, conversions: 852 },
  { day: 'Wed', sessions: 6800, conversions: 816 },
  { day: 'Thu', sessions: 8200, conversions: 984 },
  { day: 'Fri', sessions: 9100, conversions: 1092 },
  { day: 'Sat', sessions: 7400, conversions: 888 },
  { day: 'Sun', sessions: 5900, conversions: 708 },
]

const liftData = [
  { name: 'Hero CTA', lift: 9.4 },
  { name: 'Pricing', lift: 14.2 },
  { name: 'Onboarding', lift: 18.3 },
  { name: 'Email', lift: 7.1 },
  { name: 'Dashboard', lift: 3.2 },
]

function StatCard({
  label, value, sub, icon: Icon, trend, trendUp, color, gradient
}: {
  label: string; value: string; sub: string; icon: React.ElementType
  trend?: string; trendUp?: boolean; color: string; gradient: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: gradient }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
            ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{value}</div>
      <div className="text-xs font-semibold text-gray-500 mt-1">{label}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { experiments, challenges, leaderboard, setPage, selectExperiment } = useStore()

  const running = experiments.filter((e) => e.status === 'running')
  const totalSessions = experiments.reduce((s, e) => s + e.total_sessions, 0)
  const avgLift = running.filter((e) => e.leading_lift).reduce((s, e) => s + (e.leading_lift ?? 0), 0) / (running.filter(e => e.leading_lift).length || 1)
  const runningChallenges = challenges.filter((c) => c.status === 'running').length

  const recentActivity = [
    { type: 'experiment', label: 'Hero CTA Button Color hit 87% confidence', time: '2m ago', color: 'bg-blue-500' },
    { type: 'winner', label: 'Pricing Layout: Variant A declared winner', time: '14m ago', color: 'bg-green-500' },
    { type: 'ai', label: 'AI Coach: New recommendation for Team Falcon', time: '31m ago', color: 'bg-amber-500' },
    { type: 'challenge', label: 'Q2 Conversion Sprint: Round 2 started', time: '1h ago', color: 'bg-teal-500' },
    { type: 'experiment', label: 'Email Subject Line experiment launched', time: '2h ago', color: 'bg-blue-500' },
    { type: 'user', label: 'New team "Team Craft" joined tournament', time: '3h ago', color: 'bg-purple-500' },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0EA5E9 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Welcome back</span>
          </div>
          <h2 className="text-xl font-bold text-white">Good morning, Kai</h2>
          <p className="text-blue-200 text-sm mt-1">
            You have <span className="text-white font-semibold">{running.length} live experiments</span> and&nbsp;
            <span className="text-white font-semibold">{runningChallenges} active tournaments</span> running today.
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setPage('experiment-cockpit')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 border border-white/20 text-white text-xs font-semibold rounded-lg transition-colors">
              <Activity className="w-3.5 h-3.5" /> Live Cockpit
            </button>
            <button onClick={() => setPage('ai-insights')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/30 text-amber-200 text-xs font-semibold rounded-lg transition-colors">
              <Zap className="w-3.5 h-3.5" /> AI Insights
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Running Experiments" value={String(running.length)} sub="Active tests" icon={FlaskConical} trend="+2 this week" trendUp gradient="linear-gradient(135deg,#2563EB,#0EA5E9)" color="blue" />
        <StatCard label="Total Sessions" value={totalSessions.toLocaleString()} sub="Across all tests" icon={Users} trend="+12.4%" trendUp gradient="linear-gradient(135deg,#7C3AED,#A78BFA)" color="purple" />
        <StatCard label="Avg Lift" value={`+${avgLift.toFixed(1)}%`} sub="Running experiments" icon={TrendingUp} trend="+1.8pp" trendUp gradient="linear-gradient(135deg,#059669,#10B981)" color="green" />
        <StatCard label="Winning Variants" value="3" sub="Declared this month" icon={Target} trend="+1 today" trendUp gradient="linear-gradient(135deg,#0891B2,#06B6D4)" color="cyan" />
        <StatCard label="Challenges Running" value={String(runningChallenges)} sub="Active tournaments" icon={Trophy} trend={`${challenges.length} total`} trendUp gradient="linear-gradient(135deg,#D97706,#F59E0B)" color="amber" />
        <StatCard label="Leaderboard Leader" value={leaderboard[0]?.team_name.split(' ')[1] ?? '—'} sub={`Score: ${leaderboard[0]?.composite_score}`} icon={BarChart2} gradient="linear-gradient(135deg,#BE185D,#EC4899)" color="pink" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Sessions chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-gray-900">Session Volume</div>
              <div className="text-xs text-gray-400 mt-0.5">Last 7 days</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Sessions</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-green-400" />Conversions</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sessionData}>
              <defs>
                <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} />
              <Area type="monotone" dataKey="sessions" stroke="#2563EB" strokeWidth={2} fill="url(#sessGrad)" />
              <Area type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} fill="url(#convGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lift chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-gray-900">Experiment Lift</div>
              <div className="text-xs text-gray-400 mt-0.5">% vs control</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={liftData} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(v) => [`+${v}%`, 'Lift']} />
              <Bar dataKey="lift" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Running experiments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <div className="text-sm font-bold text-gray-900">Running Experiments</div>
            <button onClick={() => setPage('experiments')}
              className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {running.map((exp) => (
              <button key={exp.id}
                onClick={() => { selectExperiment(exp.id); setPage('experiment-cockpit') }}
                className="w-full text-left px-5 py-3 hover:bg-blue-50/40 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-900">{exp.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {exp.leading_lift !== null && (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        +{exp.leading_lift}% lift
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1 ml-4.5">
                  <span className="text-xs text-gray-400">{exp.total_sessions.toLocaleString()} sessions</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{exp.variant_count} variants</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <div className="text-sm font-bold text-gray-900">Activity Feed</div>
            <span className="flex items-center gap-1.5 text-[11px] text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug">{item.label}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-medium flex-shrink-0 mt-0.5">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
