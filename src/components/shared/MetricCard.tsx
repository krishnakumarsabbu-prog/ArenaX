import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SparklineBar } from './SparklineBar'

interface Props {
  label: string
  value: string | number
  delta?: 'up' | 'down'
  sub?: string
  trend?: number[]
  color?: 'blue' | 'teal' | 'amber' | 'green' | 'red'
  icon?: React.ReactNode
  prefix?: string
  suffix?: string
}

const colorMap = {
  blue:  { bg: 'from-blue-600 to-cyan-500', text: 'text-blue-600', light: 'bg-blue-50', bar: '#3B82F6' },
  teal:  { bg: 'from-teal-600 to-emerald-500', text: 'text-teal-600', light: 'bg-teal-50', bar: '#14B8A6' },
  amber: { bg: 'from-amber-500 to-orange-400', text: 'text-amber-600', light: 'bg-amber-50', bar: '#F59E0B' },
  green: { bg: 'from-green-600 to-emerald-500', text: 'text-green-600', light: 'bg-green-50', bar: '#22C55E' },
  red:   { bg: 'from-red-500 to-rose-400', text: 'text-red-600', light: 'bg-red-50', bar: '#EF4444' },
}

export default function MetricCard({ label, value, delta, sub, trend, color = 'blue', icon, prefix, suffix }: Props) {
  const c = colorMap[color]
  const hasTrend = trend && trend.length >= 2
  const trendUp = hasTrend && trend[trend.length - 1] > trend[0]
  const trendDown = hasTrend && trend[trend.length - 1] < trend[0]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover-lift overflow-hidden relative">
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${c.bg}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1 mb-1">
        {prefix && <span className="text-lg font-semibold text-gray-400 mb-0.5">{prefix}</span>}
        <div className="text-3xl font-bold tracking-tight text-gray-900 tabular-nums">{value}</div>
        {suffix && <span className="text-sm font-medium text-gray-400 mb-1">{suffix}</span>}
      </div>

      {/* Sub / delta */}
      <div className="flex items-center gap-2 min-h-[20px]">
        {delta === 'up' && (
          <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>Trending up</span>
          </div>
        )}
        {delta === 'down' && (
          <div className="flex items-center gap-1 text-xs font-semibold text-red-500">
            <TrendingDown className="w-3 h-3" />
            <span>Trending down</span>
          </div>
        )}
        {!delta && sub && <span className="text-xs text-gray-400">{sub}</span>}
        {!delta && !sub && (
          <span className="text-xs text-gray-300">
            {hasTrend
              ? trendUp ? <span className="text-green-500">↑ vs last period</span>
              : trendDown ? <span className="text-red-400">↓ vs last period</span>
              : <span className="text-gray-400">No change</span>
              : null}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {hasTrend && (
        <div className="mt-3 -mx-1">
          <SparklineBar data={trend!} color={c.bar} />
        </div>
      )}

      {/* Accent strip */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${c.bg} opacity-60`} />
    </div>
  )
}
