const styles: Record<string, string> = {
  live:      'bg-teal-50 text-teal-800 border border-teal-200',
  running:   'bg-blue-50 text-blue-700 border border-blue-200',
  draft:     'bg-gray-100 text-gray-500 border border-gray-200',
  concluded: 'bg-amber-50 text-amber-700 border border-amber-200',
  paused:    'bg-orange-50 text-orange-600 border border-orange-200',
  winner:    'bg-amber-50 text-amber-700 border border-amber-200',
  open:      'bg-green-50 text-green-700 border border-green-200',
}

const dots: Record<string, string> = {
  running: 'bg-blue-500',
  live:    'bg-teal-500',
  open:    'bg-green-500',
}

const defaultLabels: Record<string, string> = {
  live: 'Live', running: 'Running', draft: 'Draft',
  concluded: 'Concluded', paused: 'Paused', winner: 'Leading', open: 'Open',
}

interface Props {
  status: string
  label?: string
}

export default function Badge({ status, label }: Props) {
  const dot = dots[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] ?? styles.draft}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
      )}
      {label ?? defaultLabels[status] ?? status}
    </span>
  )
}
