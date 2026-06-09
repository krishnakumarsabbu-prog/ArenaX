import { Eye, Play, Pause, CircleCheck as CheckCircle } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import ProgressBar from '@/components/shared/ProgressBar'
import { useUpdateExperiment } from '@/api/hooks/useExperiments'
import type { Experiment } from '@/types'

interface Props {
  experiments: Experiment[]
  loading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function ExperimentTable({ experiments, loading, selectedId, onSelect }: Props) {
  const { mutate: update } = useUpdateExperiment()

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 h-40 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          Loading experiments…
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            {['Experiment', 'Status', 'Variants', 'Progress', 'Lift', 'Actions'].map((h) => (
              <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {experiments.map((exp) => (
            <tr
              key={exp.id}
              onClick={() => onSelect(exp.id)}
              className={`border-b border-gray-50 cursor-pointer transition-colors last:border-0
                ${selectedId === exp.id ? 'bg-blue-50/50' : 'hover:bg-gray-50/80'}`}
            >
              <td className="px-4 py-3.5">
                <div className="font-medium text-gray-900">{exp.name}</div>
                <div className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{exp.url}</div>
              </td>
              <td className="px-4 py-3.5">
                <Badge status={exp.status} />
              </td>
              <td className="px-4 py-3.5 text-gray-600 font-medium">{exp.variant_count}</td>
              <td className="px-4 py-3.5 w-40">
                <ProgressBar
                  value={exp.total_sessions}
                  max={exp.min_sessions}
                  color="blue"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {exp.total_sessions.toLocaleString()} / {exp.min_sessions.toLocaleString()}
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className={`font-medium ${
                  exp.leading_lift != null && exp.leading_lift > 0
                    ? 'text-green-600'
                    : exp.leading_lift != null && exp.leading_lift < 0
                    ? 'text-red-500'
                    : 'text-gray-300'
                }`}>
                  {exp.leading_lift != null
                    ? `${exp.leading_lift > 0 ? '+' : ''}${exp.leading_lift}%`
                    : '—'
                  }
                </span>
              </td>
              <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  {exp.status === 'draft' && (
                    <button
                      title="Start experiment"
                      onClick={() => update({ id: exp.id, status: 'running' })}
                      className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {exp.status === 'running' && (
                    <>
                      <button
                        title="Pause"
                        onClick={() => update({ id: exp.id, status: 'paused' })}
                        className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Conclude"
                        onClick={() => update({ id: exp.id, status: 'concluded' })}
                        className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {exp.status === 'paused' && (
                    <button
                      title="Resume"
                      onClick={() => update({ id: exp.id, status: 'running' })}
                      className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    title="View details"
                    onClick={() => onSelect(exp.id)}
                    className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
