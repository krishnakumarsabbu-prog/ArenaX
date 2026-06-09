import type { ExperimentAnalytics } from '@/types'

interface Props {
  analytics: ExperimentAnalytics
}

export default function SegmentBreakdown({ analytics }: Props) {
  const segments = Object.entries(analytics.segment_breakdown)

  if (segments.every(([, rows]) => rows.length === 0)) {
    return (
      <div className="text-sm text-gray-400 py-8 text-center">
        No segment data yet — events with device_type or country will appear here.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {segments.map(([segName, rows]) => (
        rows.length > 0 && (
          <div key={segName}>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {segName === 'device' ? 'By device' : segName === 'country' ? 'By country' : segName}
            </div>
            <div className="space-y-1.5">
              {rows.map((row) => (
                <div key={row.value} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-medium text-gray-700 w-20 shrink-0 capitalize">{row.value}</span>
                  <span className="text-xs text-gray-400">winner:</span>
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{row.winner_variant}</span>
                  <span className="text-xs text-gray-400 ml-auto">{row.lift.toFixed(1)}% CVR</span>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  )
}
