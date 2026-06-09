import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import type { ExperimentAnalytics, SegmentStats } from '@/types'

interface Props {
  analytics: ExperimentAnalytics
}

const segmentColors = ['#3B82F6', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981']

export default function SegmentBreakdown({ analytics }: Props) {
  const segments = Object.entries(analytics.segment_breakdown)

  if (segments.every(([, rows]) => rows.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="text-sm font-medium text-gray-500">No segment data yet</div>
        <div className="text-xs text-gray-400 mt-1 max-w-xs">Events with device_type or country will appear here as segments</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {segments.map(([segName, rows]) => {
        if (rows.length === 0) return null

        const chartData = rows.map(r => ({
          name: String(r.value),
          cvr: r.lift,
          winner: r.winner_variant,
        }))

        const segLabel = segName === 'device' ? 'By Device' : segName === 'country' ? 'By Country' : segName === 'user_type' ? 'By User Type' : segName

        return (
          <div key={segName}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">{segLabel}</div>
              <div className="flex-1 h-px bg-gray-100" />
              <div className="text-xs text-gray-400">{rows.length} segments</div>
            </div>

            {/* Chart */}
            <div className="mb-3">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} barSize={36} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={36}
                    tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}
                    formatter={(v: number, _n: string, props: any) => [
                      `${v.toFixed(1)}% CVR`,
                      `Winner: ${props.payload.winner}`
                    ]}
                    cursor={{ fill: '#F8FAFC' }}
                  />
                  <Bar dataKey="cvr" radius={[5,5,0,0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={segmentColors[i % segmentColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Rows */}
            <div className="grid grid-cols-2 gap-2">
              {rows.map((row, i) => (
                <SegmentRow key={row.value} row={row} color={segmentColors[i % segmentColors.length]} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SegmentRow({ row, color }: { row: SegmentStats; color: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-gray-800 capitalize block truncate">{row.value}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-gray-400">winner:</span>
          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            {row.winner_variant}
          </span>
        </div>
      </div>
      <div className="text-xs font-bold text-gray-700 tabular-nums">{row.lift.toFixed(1)}%</div>
    </div>
  )
}
