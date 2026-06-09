import { Eye, Play, Pause, CircleCheck as CheckCircle, ArrowUpRight, Users, Zap } from 'lucide-react'
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-gray-50 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-gray-100 rounded w-48 animate-pulse" />
              <div className="h-2.5 bg-gray-50 rounded w-32 animate-pulse" />
            </div>
            <div className="h-5 bg-gray-100 rounded-full w-16 animate-pulse" />
            <div className="h-1.5 bg-gray-100 rounded w-28 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
        <div className="text-sm font-bold text-gray-900">All experiments</div>
        <div className="text-xs text-gray-400">{experiments.length} total</div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-50">
            {['Experiment', 'Status', 'Variants', 'Progress to target', 'Conversion lift', 'Actions'].map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {experiments.map((exp) => (
            <ExperimentRow
              key={exp.id}
              exp={exp}
              selected={selectedId === exp.id}
              onSelect={() => onSelect(exp.id)}
              onUpdate={(status) => update({ id: exp.id, status })}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ExperimentRow({
  exp, selected, onSelect, onUpdate
}: {
  exp: Experiment
  selected: boolean
  onSelect: () => void
  onUpdate: (s: string) => void
}) {
  const progress = exp.min_sessions > 0 ? Math.min(100, (exp.total_sessions / exp.min_sessions) * 100) : 0

  return (
    <tr
      onClick={onSelect}
      className={`border-b border-gray-50 cursor-pointer transition-all duration-150 last:border-0 group
        ${selected ? 'bg-blue-50/60 border-l-2 border-l-blue-500' : 'hover:bg-gray-50/80 border-l-2 border-l-transparent'}`}
    >
      {/* Name */}
      <td className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5
            ${selected ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-50'} transition-colors`}>
            <Zap className={`w-3.5 h-3.5 ${selected ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm leading-tight">{exp.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <a
                href={exp.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-0.5 truncate max-w-[180px]"
              >
                {exp.url.replace(/^https?:\/\//, '')}
                <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
              </a>
            </div>
            {exp.hypothesis && (
              <div className="text-xs text-gray-400 mt-1 truncate max-w-[220px]" title={exp.hypothesis}>
                "{exp.hypothesis.slice(0, 60)}{exp.hypothesis.length > 60 ? '…' : ''}"
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <Badge status={exp.status} />
        <div className="text-xs text-gray-400 mt-1 capitalize">{exp.goal_metric}</div>
      </td>

      {/* Variants */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-300" />
          <span className="font-semibold text-gray-700">{exp.variant_count}</span>
          <span className="text-xs text-gray-400">variants</span>
        </div>
      </td>

      {/* Progress */}
      <td className="px-5 py-4 w-52">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium tabular-nums">
              {exp.total_sessions.toLocaleString()}
              <span className="text-gray-300"> / {exp.min_sessions.toLocaleString()}</span>
            </span>
            <span className={`text-xs font-bold ${progress >= 100 ? 'text-green-600' : progress >= 75 ? 'text-blue-600' : 'text-gray-400'}`}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <ProgressBar
            value={exp.total_sessions}
            max={exp.min_sessions}
            color={progress >= 100 ? 'green' : 'blue'}
          />
        </div>
      </td>

      {/* Lift */}
      <td className="px-5 py-4">
        {exp.leading_lift != null ? (
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
            ${exp.leading_lift > 0
              ? 'bg-green-50 text-green-700 border border-green-200'
              : exp.leading_lift < 0
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
            {exp.leading_lift > 0 ? '↑' : exp.leading_lift < 0 ? '↓' : '→'}
            {exp.leading_lift > 0 ? '+' : ''}{exp.leading_lift.toFixed(1)}%
          </div>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {exp.status === 'draft' && (
            <ActionBtn title="Start" icon={<Play className="w-3.5 h-3.5" />} color="blue"
              onClick={() => onUpdate('running')} />
          )}
          {exp.status === 'running' && (
            <>
              <ActionBtn title="Pause" icon={<Pause className="w-3.5 h-3.5" />} color="amber"
                onClick={() => onUpdate('paused')} />
              <ActionBtn title="Conclude" icon={<CheckCircle className="w-3.5 h-3.5" />} color="green"
                onClick={() => onUpdate('concluded')} />
            </>
          )}
          {exp.status === 'paused' && (
            <ActionBtn title="Resume" icon={<Play className="w-3.5 h-3.5" />} color="blue"
              onClick={() => onUpdate('running')} />
          )}
          <ActionBtn title="View" icon={<Eye className="w-3.5 h-3.5" />} color="gray"
            onClick={onSelect} />
        </div>
      </td>
    </tr>
  )
}

function ActionBtn({ title, icon, color, onClick }: {
  title: string; icon: React.ReactNode; color: string; onClick: () => void
}) {
  const colorMap: Record<string, string> = {
    blue:  'hover:text-blue-600 hover:bg-blue-50',
    amber: 'hover:text-amber-600 hover:bg-amber-50',
    green: 'hover:text-green-600 hover:bg-green-50',
    gray:  'hover:text-gray-600 hover:bg-gray-100',
  }
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg text-gray-400 transition-all duration-150 ${colorMap[color]}`}
    >
      {icon}
    </button>
  )
}
