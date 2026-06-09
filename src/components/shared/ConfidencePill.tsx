interface Props {
  value: number  // 0.0 – 1.0
}

export default function ConfidencePill({ value }: Props) {
  const pct = value * 100
  let colorClass = 'bg-gray-100 text-gray-400'
  if (pct >= 95) colorClass = 'bg-green-50 text-green-700 border border-green-200'
  else if (pct >= 80) colorClass = 'bg-blue-50 text-blue-700 border border-blue-200'
  else if (pct >= 60) colorClass = 'bg-amber-50 text-amber-700 border border-amber-200'

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
      {pct >= 1 ? `${pct.toFixed(0)}%` : '—'}
    </span>
  )
}
