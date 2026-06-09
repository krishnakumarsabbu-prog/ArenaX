interface Props {
  value: number  // 0.0 – 1.0
  showLabel?: boolean
}

export default function ConfidencePill({ value, showLabel }: Props) {
  const pct = value * 100

  let colorClass = 'bg-gray-100 text-gray-400 border border-gray-200'
  let label = 'No data'
  if (pct >= 95) {
    colorClass = 'bg-green-50 text-green-700 border border-green-200'
    label = 'High'
  } else if (pct >= 80) {
    colorClass = 'bg-blue-50 text-blue-700 border border-blue-200'
    label = 'Medium'
  } else if (pct >= 60) {
    colorClass = 'bg-amber-50 text-amber-700 border border-amber-200'
    label = 'Low'
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
      {pct >= 1 ? `${pct.toFixed(0)}%` : '—'}
      {showLabel && pct >= 1 && <span className="opacity-70">· {label}</span>}
    </span>
  )
}
