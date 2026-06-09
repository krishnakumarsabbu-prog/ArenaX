import { type LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-gray-300" />
      </div>
      <div className="text-sm font-bold text-gray-700 mb-1.5">{title}</div>
      <div className="text-xs text-gray-400 max-w-xs leading-relaxed">{description}</div>
      {action && (
        <button onClick={action.onClick} className="mt-5 btn-primary shadow-md">
          {action.label}
        </button>
      )}
    </div>
  )
}
