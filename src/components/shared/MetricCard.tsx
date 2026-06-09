interface Props {
  label: string
  value: string | number
  delta?: 'up' | 'down'
  sub?: string
}

export default function MetricCard({ label, value, delta, sub }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card">
      <div className="text-xs text-gray-400 font-medium mb-1.5">{label}</div>
      <div className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      {delta === 'up' && (
        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <span>↑</span> trending up
        </div>
      )}
      {delta === 'down' && (
        <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <span>↓</span> trending down
        </div>
      )}
    </div>
  )
}
