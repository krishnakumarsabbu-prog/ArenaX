import { type LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      <div className="text-xs text-gray-400 max-w-xs">{description}</div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
