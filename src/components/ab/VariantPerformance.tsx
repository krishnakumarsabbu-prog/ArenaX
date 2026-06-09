import { RadialBar, RadialBarChart, ResponsiveContainer, Cell } from 'recharts'
import type { ExperimentAnalytics } from '@/types'

interface Props {
  analytics: ExperimentAnalytics
}

export default function VariantPerformance({ analytics }: Props) {
  const maxCvr = Math.max(...analytics.variant_stats.map((v) => v.cvr), 0.01)

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Total sessions" value={analytics.total_sessions.toLocaleString()} />
        <StatBox label="Confidence" value={`${(analytics.overall_confidence * 100).toFixed(1)}%`} />
        <StatBox label="Days running" value={analytics.days_running} />
      </div>

      {/* Variant cards */}
      <div className="space-y-2">
        {analytics.variant_stats.map((v) => {
          const isControl = v.variant_key === 'control'
          const barWidth = maxCvr > 0 ? (v.cvr / maxCvr) * 100 : 0
          const isWinner = !isControl && v.lift_vs_control != null && v.lift_vs_control > 0 && v.confidence > 0.9

          return (
            <div
              key={v.variant_id}
              className={`rounded-lg border p-3.5 transition-colors ${
                isWinner ? 'border-green-200 bg-green-50/40' : 'border-gray-100 bg-gray-50/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium ${
                    isControl ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {v.variant_key}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{v.variant_name}</span>
                  {isWinner && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                      Leading
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{v.impressions.toLocaleString()} sessions</span>
                  <span>{v.conversions.toLocaleString()} convs</span>
                  <span className="font-semibold text-gray-900">{v.cvr}% CVR</span>
                </div>
              </div>

              {/* CVR bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isWinner ? 'bg-green-500' : isControl ? 'bg-gray-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Lift & confidence */}
              {!isControl && (
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs font-medium ${
                    (v.lift_vs_control ?? 0) > 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {v.lift_vs_control != null
                      ? `${v.lift_vs_control > 0 ? '+' : ''}${v.lift_vs_control}% lift`
                      : 'No lift data'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {(v.confidence * 100).toFixed(0)}% confidence
                  </span>
                  <span className="text-xs text-gray-400">
                    Traffic: {(v.traffic_weight * 100).toFixed(0)}%
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

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  )
}
