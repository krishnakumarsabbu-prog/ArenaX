import { Sparkles, Loader, ChevronRight } from 'lucide-react'

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
    wrap:  'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
    iconBg: 'bg-gradient-to-br from-blue-600 to-cyan-500',
    title: 'text-blue-900 font-bold',
    body:  'text-blue-700',
    btn:   'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    dots:  'text-blue-400',
  },
  teal: {
    wrap:  'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200',
    iconBg: 'bg-gradient-to-br from-teal-600 to-emerald-500',
    title: 'text-teal-900 font-bold',
    body:  'text-teal-700',
    btn:   'bg-teal-600 hover:bg-teal-700 active:bg-teal-800',
    dots:  'text-teal-400',
  }
}

export default function AiInsightBox({ color, title, body, ctaLabel, onCta, loading }: Props) {
  const c = palette[color]
  return (
    <div className={`${c.wrap} border rounded-2xl p-5 flex gap-4 shadow-sm`}>
      <div className={`${c.iconBg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs uppercase tracking-wider mb-1 ${c.dots}`}>AI Analysis</div>
        <div className={`text-sm ${c.title} mb-1.5`}>{title}</div>
        <p className={`text-xs ${c.body} leading-relaxed`}>{body}</p>
        <button
          onClick={onCta}
          disabled={loading}
          className={`mt-3 ${c.btn} text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 inline-flex items-center gap-1.5`}
        >
          {loading ? (
            <><Loader className="w-3 h-3 animate-spin" /> Analysing…</>
          ) : (
            <>{ctaLabel}<ChevronRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>
    </div>
  )
}
