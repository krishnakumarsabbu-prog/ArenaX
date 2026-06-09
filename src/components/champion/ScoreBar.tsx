interface Props {
  value: number          // 0–100 composite score
  maxValue?: number      // for normalization (default 100)
  rank?: number          // 1-indexed, drives medal colour
  label?: string         // optional label below bar
  animated?: boolean
  showValue?: boolean
  height?: 'xs' | 'sm' | 'md' | 'lg'
}

const HEIGHT_MAP = {
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
}

function trackColor(rank?: number): string {
  if (rank === 1) return 'bg-gradient-to-r from-amber-400 to-yellow-300'
  if (rank === 2) return 'bg-gradient-to-r from-slate-400 to-gray-300'
  if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-amber-300'
  return 'bg-gradient-to-r from-teal-400 to-cyan-500'
}

export default function ScoreBar({
  value,
  maxValue = 100,
  rank,
  label,
  animated = true,
  showValue = false,
  height = 'sm',
}: Props) {
  const pct = Math.min(Math.max((value / (maxValue || 100)) * 100, 0), 100)

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-400 truncate">{label}</span>}
          {showValue && (
            <span className="text-xs font-bold text-gray-700 tabular-nums ml-auto">{value.toFixed(1)}</span>
          )}
        </div>
      )}

      {/* Track */}
      <div className={`w-full ${HEIGHT_MAP[height]} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full ${trackColor(rank)} ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
        />
      </div>

      {/* Tick markers for scoring reference */}
      {height !== 'xs' && (
        <div className="flex justify-between mt-0.5 px-0.5">
          {[0, 25, 50, 75, 100].map(tick => (
            <div key={tick} className="w-px h-1 bg-gray-200" />
          ))}
        </div>
      )}
    </div>
  )
}

// Segmented variant: shows three score components (CVR / engagement / volume)
interface SegmentedProps {
  cvr: number         // 0–100 normalised
  engagement: number  // 0–100 normalised
  volume: number      // 0–100 normalised
  cvrWeight?: number
  engagementWeight?: number
  volumeWeight?: number
}

export function SegmentedScoreBar({
  cvr,
  engagement,
  volume,
  cvrWeight = 0.6,
  engagementWeight = 0.25,
  volumeWeight = 0.15,
}: SegmentedProps) {
  const segments = [
    { label: 'CVR',        value: cvr,        weight: cvrWeight,        color: 'bg-teal-500'  },
    { label: 'Engagement', value: engagement,  weight: engagementWeight, color: 'bg-blue-500'  },
    { label: 'Volume',     value: volume,      weight: volumeWeight,     color: 'bg-amber-400' },
  ]

  return (
    <div className="space-y-1.5">
      {segments.map(seg => (
        <div key={seg.label} className="flex items-center gap-2.5">
          <span className="text-xs text-gray-400 w-20 shrink-0">{seg.label}</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${seg.color} transition-all duration-700`}
              style={{ width: `${Math.min(seg.value, 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-600 tabular-nums w-10 text-right shrink-0">
            {seg.value.toFixed(1)}
          </span>
          <span className="text-xs text-gray-300 shrink-0 w-8">×{seg.weight}</span>
        </div>
      ))}
    </div>
  )
}
