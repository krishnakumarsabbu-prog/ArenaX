interface Props {
  data: number[]
  color?: string
  height?: number
}

export function SparklineBar({ data, color = '#3B82F6', height = 28 }: Props) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-0.5 px-1" style={{ height }}>
      {data.map((v, i) => {
        const pct = ((v - min) / range) * 100
        const isLast = i === data.length - 1
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-500"
            style={{
              height: `${Math.max(pct, 8)}%`,
              background: isLast ? color : `${color}40`,
            }}
          />
        )
      })}
    </div>
  )
}
