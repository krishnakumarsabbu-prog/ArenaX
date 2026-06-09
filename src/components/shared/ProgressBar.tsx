interface Props {
  value: number
  max: number
  color?: 'blue' | 'teal' | 'green' | 'amber'
  showLabel?: boolean
}

const colors = {
  blue:  'bg-blue-500',
  teal:  'bg-teal-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
}

export default function ProgressBar({ value, max, color = 'blue', showLabel }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="w-full">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}%</div>
      )}
    </div>
  )
}
