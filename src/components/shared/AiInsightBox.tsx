import { Sparkles, Loader as Loader2 } from 'lucide-react'

interface Props {
  color: 'blue' | 'teal'
  title: string
  body: string
  ctaLabel: string
  onCta: () => void
  loading?: boolean
}

const palette = {
  blue: {
    wrap:  'bg-blue-50 border-blue-200',
    icon:  'bg-blue-600',
    title: 'text-blue-800',
    body:  'text-blue-700',
    btn:   'bg-blue-600 hover:bg-blue-700'
  },
  teal: {
    wrap:  'bg-teal-50 border-teal-200',
    icon:  'bg-teal-600',
    title: 'text-teal-800',
    body:  'text-teal-700',
    btn:   'bg-teal-600 hover:bg-teal-700'
  }
}

export default function AiInsightBox({ color, title, body, ctaLabel, onCta, loading }: Props) {
  const c = palette[color]
  return (
    <div className={`${c.wrap} border rounded-xl p-4 flex gap-3`}>
      <div className={`${c.icon} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold ${c.title} mb-1`}>{title}</div>
        <p className={`text-xs ${c.body} leading-relaxed`}>{body}</p>
        <button
          onClick={onCta}
          disabled={loading}
          className={`mt-2 ${c.btn} text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 inline-flex items-center gap-1.5`}
        >
          {loading ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Analysing…</>
          ) : (
            <>{ctaLabel} ↗</>
          )}
        </button>
      </div>
    </div>
  )
}
