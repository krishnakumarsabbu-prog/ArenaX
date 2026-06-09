import { useState } from 'react'
import { Lightbulb, Target, TrendingUp, ChevronRight, CircleCheck as CheckCircle2, RefreshCw } from 'lucide-react'

interface HypothesisParts {
  element: string
  change: string
  metric: string
  magnitude: string
  reason: string
}

interface Props {
  value: string
  onChange: (hypothesis: string) => void
}

const ELEMENT_SUGGESTIONS = ['headline', 'CTA button', 'hero image', 'form layout', 'pricing table', 'navigation', 'social proof section']
const CHANGE_SUGGESTIONS = ['changing the copy', 'updating the color', 'repositioning', 'removing', 'adding urgency', 'simplifying', 'personalizing']
const METRIC_SUGGESTIONS = ['conversion rate', 'click-through rate', 'scroll depth', 'form completion', 'checkout initiation', 'session duration']
const REASON_SUGGESTIONS = [
  'it reduces friction in the user journey',
  'it creates stronger visual hierarchy',
  'it addresses user anxiety',
  'it leverages social proof',
  'it aligns with user intent',
  'it improves cognitive load',
]

const MAGNITUDE_OPTIONS = ['5%', '10%', '15%', '20%', '25%+']

function SuggestionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors whitespace-nowrap"
    >
      {label}
    </button>
  )
}

export default function HypothesisBuilder({ value, onChange }: Props) {
  const [mode, setMode] = useState<'free' | 'guided'>('free')
  const [parts, setParts] = useState<HypothesisParts>({
    element: '',
    change: '',
    metric: '',
    magnitude: '10%',
    reason: '',
  })

  const buildFromParts = (p: HypothesisParts) => {
    if (!p.element && !p.change && !p.metric) return ''
    const el = p.element || '[element]'
    const ch = p.change || '[change]'
    const mt = p.metric || '[metric]'
    const mag = p.magnitude || '10%'
    const rs = p.reason ? ` because ${p.reason}` : ''
    return `By ${ch} the ${el}, we will increase ${mt} by ${mag}${rs}.`
  }

  const updatePart = (key: keyof HypothesisParts, val: string) => {
    const next = { ...parts, [key]: val }
    setParts(next)
    onChange(buildFromParts(next))
  }

  const isComplete = parts.element && parts.change && parts.metric

  if (mode === 'free') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="label">Hypothesis</label>
          <button
            type="button"
            onClick={() => setMode('guided')}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <Lightbulb className="w-3 h-3" />
            Guided builder
          </button>
        </div>
        <textarea
          className="input resize-none text-sm"
          rows={3}
          placeholder="e.g. Changing the CTA from 'Buy Now' to 'Get Yours Today' will increase checkout conversions by 10% because it reduces purchase anxiety."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">{value}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Hypothesis Builder</label>
        </div>
        <button
          type="button"
          onClick={() => setMode('free')}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
        >
          Free text ↗
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
        {/* Element */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
            <Target className="w-3 h-3" /> What element are you changing?
          </div>
          <input
            className="input text-sm mb-1.5"
            placeholder="e.g. CTA button"
            value={parts.element}
            onChange={(e) => updatePart('element', e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            {ELEMENT_SUGGESTIONS.map(s => (
              <SuggestionChip key={s} label={s} onClick={() => updatePart('element', s)} />
            ))}
          </div>
        </div>

        {/* Change */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> How are you changing it?
          </div>
          <input
            className="input text-sm mb-1.5"
            placeholder="e.g. changing the copy"
            value={parts.change}
            onChange={(e) => updatePart('change', e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            {CHANGE_SUGGESTIONS.map(s => (
              <SuggestionChip key={s} label={s} onClick={() => updatePart('change', s)} />
            ))}
          </div>
        </div>

        {/* Metric + Magnitude */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Target metric
            </div>
            <select
              className="input text-sm"
              value={parts.metric}
              onChange={(e) => updatePart('metric', e.target.value)}
            >
              <option value="">Select metric…</option>
              {METRIC_SUGGESTIONS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1.5">Expected lift</div>
            <div className="flex gap-1.5 flex-wrap">
              {MAGNITUDE_OPTIONS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => updatePart('magnitude', m)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                    parts.magnitude === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1.5">Why will this work? (optional)</div>
          <input
            className="input text-sm mb-1.5"
            placeholder="e.g. it reduces purchase anxiety"
            value={parts.reason}
            onChange={(e) => updatePart('reason', e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            {REASON_SUGGESTIONS.map(s => (
              <SuggestionChip key={s} label={s} onClick={() => updatePart('reason', s)} />
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      {isComplete && (
        <div className="flex items-start gap-2 p-3.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-blue-800 mb-0.5">Generated hypothesis</div>
            <p className="text-xs text-blue-700 leading-relaxed">{buildFromParts(parts)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(buildFromParts(parts))
              setMode('free')
            }}
            className="ml-auto shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Use it <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
