import { Sparkles, TrendingUp, TriangleAlert as AlertTriangle, Lightbulb, Target, BarChart2, ChevronRight } from 'lucide-react'
import { useStore } from '../data/store'

const insights = [
  {
    type: 'hypothesis',
    icon: Lightbulb,
    color: '#2563EB',
    bg: '#EFF6FF',
    title: 'Hypothesis Review: Hero CTA Button Color',
    summary: 'Your hypothesis that orange CTAs increase conversions is showing strong early signals. Current data supports the directional outcome with 87% confidence.',
    tags: ['Strong signal', 'Above baseline'],
    actions: ['View full experiment', 'Declare winner'],
  },
  {
    type: 'recommendation',
    icon: TrendingUp,
    color: '#059669',
    bg: '#F0FDF4',
    title: 'Recommended Next Test: Mobile Checkout',
    summary: 'Based on segment data, mobile users underperform desktop by 22%. A dedicated mobile checkout flow could yield +15-25% conversion lift for that segment.',
    tags: ['High impact', 'Mobile segment'],
    actions: ['Create experiment', 'View mobile analytics'],
  },
  {
    type: 'risk',
    icon: AlertTriangle,
    color: '#D97706',
    bg: '#FFFBEB',
    title: 'Risk Area: Tablet Segment Regression',
    summary: 'Tablet users show a -1.2% lift in the Hero CTA experiment. This segment represents 8% of traffic. Monitor closely before declaring winner.',
    tags: ['Regression detected', 'Tablet users'],
    actions: ['Filter by tablet', 'Pause for tablets'],
  },
  {
    type: 'future',
    icon: Target,
    color: '#7C3AED',
    bg: '#F5F3FF',
    title: 'Future Test: Personalized Homepage',
    summary: 'AI analysis of your concluded experiments suggests personalization could be the highest-ROI next investment. Predicted +20-35% lift based on segment patterns.',
    tags: ['Predicted high ROI', 'Personalization'],
    actions: ['Plan test', 'View roadmap'],
  },
  {
    type: 'recommendation',
    icon: BarChart2,
    color: '#0891B2',
    bg: '#ECFEFF',
    title: 'Increase Traffic on Email Subject Experiment',
    summary: 'Email Subject Line experiment is at 78.9% confidence after 6 days. Increasing traffic allocation from 60% to 80% would reduce time-to-significance by ~4 days.',
    tags: ['Speed up', 'Traffic optimization'],
    actions: ['Update allocation', 'View experiment'],
  },
]

export default function AIInsightsPage() {
  const { setPage, selectExperiment, experiments } = useStore()

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">AI Insights Center</h2>
          <p className="text-sm text-gray-400 mt-0.5">Intelligent analysis of your experiments and recommendations</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Recommendations', value: '5', color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Hypotheses Reviewed', value: '3', color: '#059669', bg: '#F0FDF4' },
          { label: 'Risk Areas Detected', value: '1', color: '#D97706', bg: '#FFFBEB' },
          { label: 'Future Tests Suggested', value: '4', color: '#7C3AED', bg: '#F5F3FF' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold tabular-nums" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((ins, i) => {
          const Icon = ins.icon
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: ins.bg }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: ins.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 leading-snug">{ins.title}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {ins.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: ins.bg, color: ins.color }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">{ins.summary}</p>
              <div className="flex items-center gap-2">
                {ins.actions.map((action) => (
                  <button key={action}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm"
                    style={{ borderColor: ins.color + '40', color: ins.color, background: ins.bg }}>
                    {action} <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* AI-analyzed experiments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50">
          <div className="text-sm font-bold text-gray-900">Concluded Experiments — AI Analysis</div>
        </div>
        {experiments.filter(e => e.ai_verdict).map(exp => (
          <div key={exp.id} className="px-5 py-4 border-b border-gray-50 last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{exp.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                    ${exp.ai_verdict?.hypothesis_confirmed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {exp.ai_verdict?.hypothesis_confirmed ? '✓ Confirmed' : '✗ Rejected'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{exp.ai_verdict?.verdict_summary}</p>
                {exp.ai_verdict?.next_tests && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-gray-400 font-medium">Next tests:</span>
                    {exp.ai_verdict.next_tests.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0
                ${exp.ai_verdict?.confidence_level === 'high' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                {exp.ai_verdict?.confidence_level} confidence
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
