import { Brain, Zap, Target, TrendingUp, TriangleAlert as AlertTriangle, ChevronRight } from 'lucide-react'
import { useStore } from '../data/store'

export default function AICoachPage() {
  const { challenges } = useStore()
  const ch = challenges.find(c => c.ai_analysis) ?? challenges[0]
  const ai = ch?.ai_analysis

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#A78BFA)' }}>
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">AI Coach</h2>
          <p className="text-sm text-gray-400 mt-0.5">Strategic intelligence for your tournament teams</p>
        </div>
      </div>

      {/* Challenge selector */}
      <div className="flex gap-2 flex-wrap">
        {challenges.filter(c => c.status !== 'draft').map(c => (
          <div key={c.id}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all
              ${c.id === ch?.id ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-200'}`}>
            {c.name}
          </div>
        ))}
      </div>

      {ai && (
        <div className="space-y-4">
          {/* Predicted outcome */}
          <div className="rounded-2xl p-5 border border-purple-200 shadow-sm"
            style={{ background: 'linear-gradient(135deg,#F5F3FF,#EFF6FF)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-900">Predicted Outcome</span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full
                ${ai.confidence === 'high' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {ai.confidence} confidence
              </span>
            </div>
            <p className="text-sm text-purple-800 leading-relaxed">{ai.predicted_outcome}</p>
          </div>

          {/* Gap analysis */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2Icon />
              <span className="text-sm font-bold text-gray-900">Gap Analysis</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{ai.gap_analysis}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick wins */}
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Quick Wins</span>
              </div>
              <div className="space-y-2">
                {ai.quick_wins.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-200 text-green-700 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs text-green-800 leading-snug">{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic tests */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Strategic Tests</span>
              </div>
              <div className="space-y-2">
                {ai.strategic_tests.map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs text-blue-800 leading-snug">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk moves */}
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-red-800 uppercase tracking-wide">Risk Moves</span>
              </div>
              <div className="space-y-2">
                {ai.risk_moves.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-200 text-red-700 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">!</span>
                    <span className="text-xs text-red-800 leading-snug">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!ai && (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center">
          <Brain className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">AI analysis not yet available for running challenges.</p>
          <p className="text-xs text-gray-300 mt-1">Analysis generates after round 1 completes.</p>
        </div>
      )}
    </div>
  )
}

function BarChart2Icon() {
  return <TrendingUp className="w-4 h-4 text-blue-600" />
}
