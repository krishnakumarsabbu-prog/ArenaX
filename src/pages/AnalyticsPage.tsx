import { useState } from 'react'
import { useStore } from '../data/store'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const funnelData = [
  { stage: 'Visitors', control: 10000, variant: 10000 },
  { stage: 'Engaged', control: 6200, variant: 7100 },
  { stage: 'Add to Cart', control: 2400, variant: 3050 },
  { stage: 'Checkout', control: 1200, variant: 1700 },
  { stage: 'Purchase', control: 800, variant: 1180 },
]

const deviceData = [
  { name: 'Mobile', value: 58, color: '#2563EB' },
  { name: 'Desktop', value: 34, color: '#0EA5E9' },
  { name: 'Tablet', value: 8, color: '#BAE6FD' },
]

const weeklyData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  control: 8 + Math.sin(i * 0.5) * 1.5 + Math.random() * 0.5,
  variant: 9.5 + Math.sin(i * 0.5 + 0.5) * 1.2 + Math.random() * 0.5,
}))

const TABS = ['Metrics', 'Funnels', 'Segments', 'Confidence'] as const
type Tab = typeof TABS[number]

export default function AnalyticsPage() {
  const { experiments, analyticsMap } = useStore()
  const [tab, setTab] = useState<Tab>('Metrics')
  const [expId, setExpId] = useState(experiments[0]?.id ?? '')
  const analytics = analyticsMap[expId]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Analytics Hub</h2>
          <p className="text-sm text-gray-400 mt-0.5">Deep-dive metrics across all experiments</p>
        </div>
        <select value={expId} onChange={e => setExpId(e.target.value)}
          className="input w-auto text-sm">
          {experiments.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all
              ${tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Metrics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sessions', value: analytics?.total_sessions.toLocaleString() ?? '—', delta: '+12.4%', up: true },
              { label: 'Overall CVR', value: '11.2%', delta: '+1.8pp', up: true },
              { label: 'Statistical Confidence', value: `${analytics?.overall_confidence?.toFixed(0) ?? '—'}%`, delta: '+5.2pp', up: true },
              { label: 'Days Running', value: String(analytics?.days_running ?? '—'), delta: null, up: true },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-bold text-gray-900 tabular-nums">{m.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
                {m.delta && (
                  <div className={`text-xs font-semibold mt-1 ${m.up ? 'text-green-600' : 'text-red-500'}`}>
                    {m.up ? '▲' : '▼'} {m.delta}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-sm font-bold text-gray-900 mb-4">Conversion Rate Over Time</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="controlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="variantGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={35} tickFormatter={v => `${v.toFixed(0)}%`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} formatter={(v: number) => [`${v.toFixed(2)}%`]} />
                <Area type="monotone" dataKey="control" stroke="#94A3B8" strokeWidth={2} fill="url(#controlGrad)" name="Control" />
                <Area type="monotone" dataKey="variant" stroke="#2563EB" strokeWidth={2} fill="url(#variantGrad)" name="Variant" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'Funnels' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm font-bold text-gray-900 mb-4">Conversion Funnel</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v.toLocaleString()} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
              <Bar dataKey="control" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Control" />
              <Bar dataKey="variant" fill="#2563EB" radius={[4, 4, 0, 0]} name="Variant" />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {funnelData.map((d, i) => {
              const lift = ((d.variant - d.control) / d.control * 100).toFixed(0)
              return (
                <div key={i} className="text-center">
                  <div className="text-xs font-semibold text-gray-500">{d.stage}</div>
                  <div className={`text-xs font-bold mt-0.5 ${Number(lift) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {Number(lift) > 0 ? '+' : ''}{lift}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'Segments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-sm font-bold text-gray-900 mb-4">Device Split</div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {deviceData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {deviceData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-gray-600">{d.name}</span>
                    <span className="text-xs font-bold text-gray-900 ml-auto">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {analytics && Object.entries(analytics.segment_breakdown).map(([seg, rows]) => (
            <div key={seg} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="text-sm font-bold text-gray-900 mb-4 capitalize">{seg} Breakdown</div>
              <div className="space-y-3">
                {rows.map((row) => (
                  <div key={row.value} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 capitalize font-medium">{row.value}</span>
                      <span className={`font-bold ${row.lift > 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {row.lift > 0 ? '+' : ''}{row.lift}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.abs(row.lift) * 3.5 + 40)}%`,
                          background: row.lift > 0 ? '#10B981' : '#EF4444'
                        }} />
                    </div>
                    <div className="text-[10px] text-gray-400">Winner: {row.winner_variant}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Confidence' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-sm font-bold text-gray-900 mb-4">Confidence by Variant</div>
            {analytics ? (
              <div className="space-y-4">
                {analytics.variant_stats.filter(v => v.variant_key !== 'control').map(v => (
                  <div key={v.variant_id}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700">{v.variant_name}</span>
                      <span className="text-xs font-bold tabular-nums" style={{
                        color: v.confidence >= 95 ? '#10B981' : v.confidence >= 80 ? '#F59E0B' : '#3B82F6'
                      }}>{v.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${v.confidence}%`,
                          background: v.confidence >= 95 ? 'linear-gradient(90deg,#10B981,#34D399)' :
                            v.confidence >= 80 ? 'linear-gradient(90deg,#F59E0B,#FBBF24)' :
                            'linear-gradient(90deg,#2563EB,#60A5FA)'
                        }} />
                    </div>
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-4 pt-2 border-t border-gray-50">
                  {[{ label: '≥95% — Significant', color: '#10B981' }, { label: '≥80% — Near', color: '#F59E0B' }, { label: '<80% — Building', color: '#3B82F6' }].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      <span className="text-[10px] text-gray-500">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Select an experiment with analytics data.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
