import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from 'recharts'
import type { ExperimentAnalytics } from '@/types'

interface Props {
  analytics: ExperimentAnalytics
}

const CONTROL_COLOR = '#94A3B8'
const WINNER_COLOR  = '#22C55E'
const VARIANT_COLOR = '#3B82F6'
const NEG_COLOR     = '#EF4444'

export default function VariantPerformance({ analytics }: Props) {
  const { variant_stats } = analytics
  const control = variant_stats.find(v => v.variant_key === 'control')

  // Bar chart data
  const cvrData = variant_stats.map(v => ({
    name: v.variant_name,
    key: v.variant_key,
    cvr: v.cvr,
    impressions: v.impressions,
    conversions: v.conversions,
    lift: v.lift_vs_control,
    confidence: v.confidence,
    isWinner: v.variant_key !== 'control' && (v.lift_vs_control ?? 0) > 0 && v.confidence > 0.9,
  }))

  const liftData = variant_stats
    .filter(v => v.variant_key !== 'control' && v.lift_vs_control != null)
    .map(v => ({
      name: v.variant_name,
      lift: v.lift_vs_control ?? 0,
      confidence: v.confidence,
    }))

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryBox
          label="Total sessions"
          value={analytics.total_sessions.toLocaleString()}
          color="text-blue-700"
          bg="bg-blue-50"
        />
        <SummaryBox
          label="Overall confidence"
          value={`${(analytics.overall_confidence * 100).toFixed(1)}%`}
          color={analytics.overall_confidence > 0.95 ? 'text-green-700' : analytics.overall_confidence > 0.8 ? 'text-amber-700' : 'text-gray-500'}
          bg={analytics.overall_confidence > 0.95 ? 'bg-green-50' : 'bg-amber-50'}
        />
        <SummaryBox
          label="Days running"
          value={`${analytics.days_running}d`}
          color="text-gray-700"
          bg="bg-gray-50"
          sub={analytics.estimated_days_remaining != null
            ? `~${analytics.estimated_days_remaining}d remaining`
            : analytics.total_sessions >= variant_stats.reduce((a,v) => a + v.impressions, 0) ? 'Target reached' : undefined}
        />
      </div>

      {/* CVR comparison chart */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Conversion Rate by Variant</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={cvrData} barSize={40} margin={{ top: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40}
              tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
              formatter={(v: number, name: string) => [`${v.toFixed(2)}%`, 'CVR']}
              cursor={{ fill: '#F8FAFC' }}
            />
            <Bar dataKey="cvr" radius={[6,6,0,0]}>
              {cvrData.map((entry, i) => (
                <Cell key={i}
                  fill={entry.key === 'control' ? CONTROL_COLOR
                    : entry.isWinner ? WINNER_COLOR
                    : VARIANT_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lift chart */}
      {liftData.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Lift vs Control</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={liftData} barSize={40} margin={{ top: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40}
                tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`} />
              <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="4 2" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}
                formatter={(v: number) => [`${v > 0 ? '+' : ''}${v.toFixed(2)}%`, 'Lift']}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar dataKey="lift" radius={[4,4,0,0]}>
                {liftData.map((entry, i) => (
                  <Cell key={i} fill={entry.lift >= 0 ? '#22C55E' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Variant detail cards */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Variant Detail</div>
        {variant_stats.map((v) => {
          const isControl = v.variant_key === 'control'
          const isWinner = !isControl && (v.lift_vs_control ?? 0) > 0 && v.confidence > 0.9
          const liftPositive = (v.lift_vs_control ?? 0) > 0

          return (
            <div
              key={v.variant_id}
              className={`rounded-xl border p-4 transition-all duration-200 ${
                isWinner ? 'border-green-200 bg-green-50/40 shadow-sm' : 'border-gray-100 bg-gray-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold ${
                    isControl ? 'bg-gray-100 text-gray-500' : isWinner ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {v.variant_key}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{v.variant_name}</span>
                  {isWinner && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      ✓ Winner
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-400">{v.impressions.toLocaleString()} sessions</span>
                  <span className="text-gray-400">{v.conversions.toLocaleString()} conversions</span>
                  <span className="font-bold text-gray-900 text-base tabular-nums">{v.cvr.toFixed(2)}%</span>
                </div>
              </div>

              {/* CVR bar */}
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${
                    isWinner ? 'bg-green-500' : isControl ? 'bg-gray-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, v.cvr * 3)}%` }}
                />
              </div>

              {!isControl && (
                <div className="flex items-center gap-4 mt-2">
                  <div className={`flex items-center gap-1 text-xs font-semibold ${liftPositive ? 'text-green-600' : 'text-red-500'}`}>
                    <span>{liftPositive ? '↑' : '↓'}</span>
                    {v.lift_vs_control != null
                      ? `${liftPositive ? '+' : ''}${v.lift_vs_control.toFixed(2)}% lift`
                      : 'No lift data'}
                  </div>
                  <ConfidenceIndicator value={v.confidence} />
                  <span className="text-xs text-gray-400 ml-auto">
                    {(v.traffic_weight * 100).toFixed(0)}% traffic allocation
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SummaryBox({ label, value, color, bg, sub }: {
  label: string; value: string; color: string; bg: string; sub?: string
}) {
  return (
    <div className={`${bg} rounded-xl p-3.5 border border-white`}>
      <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function ConfidenceIndicator({ value }: { value: number }) {
  const pct = value * 100
  const color = pct >= 95 ? 'text-green-600' : pct >= 80 ? 'text-amber-600' : 'text-gray-400'
  const bg = pct >= 95 ? 'bg-green-100' : pct >= 80 ? 'bg-amber-100' : 'bg-gray-100'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${color}`}>
      {pct.toFixed(0)}% conf.
    </span>
  )
}
