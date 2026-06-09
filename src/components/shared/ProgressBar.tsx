interface Props {
  value: number
  max: number
  color?: 'blue' | 'teal' | 'green' | 'amber' | 'red'
  showLabel?: boolean
  height?: 'xs' | 'sm' | 'md'
}

const colors = {
  blue:  'bg-gradient-to-r from-blue-500 to-cyan-400',
  teal:  'bg-gradient-to-r from-teal-500 to-emerald-400',
  green: 'bg-gradient-to-r from-green-500 to-emerald-400',
  amber: 'bg-gradient-to-r from-amber-500 to-orange-400',
  red:   'bg-gradient-to-r from-red-500 to-rose-400',
}

const heights = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
}

export default function ProgressBar({ value, max, color = 'blue', showLabel, height = 'sm' }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="w-full">
      <div className={`${heights[height]} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-400 mt-1 font-medium">{pct.toFixed(0)}%</div>
      )}
    </div>
  )
}
