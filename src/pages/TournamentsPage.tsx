import { useState } from 'react'
import { Plus, Trophy, Users, ChevronRight, Play, Clock, CircleCheck as CheckCircle } from 'lucide-react'
import { useStore } from '../data/store'
import { Challenge } from '../types'

const STATUS_STYLES: Record<Challenge['status'], { bg: string; text: string; dot: string; label: string }> = {
  running:   { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Running' },
  open:      { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'Open' },
  concluded: { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Concluded' },
  draft:     { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Draft' },
}

export default function TournamentsPage() {
  const { challenges, setPage, selectChallenge } = useStore()
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tournaments</h2>
          <p className="text-sm text-gray-400 mt-0.5">{challenges.length} challenges · {challenges.filter(c => c.status === 'running').length} running</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Tournament
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((ch) => {
          const s = STATUS_STYLES[ch.status]
          return (
            <div key={ch.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => { selectChallenge(ch.id); setPage('brackets') }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#0D9488,#14B8A6)' }}>
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{ch.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${ch.status === 'running' ? 'animate-pulse' : ''}`} />
                        {s.label}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors mt-1" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">{ch.team_count}</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">Teams</div>
                </div>
                <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">
                    {ch.status === 'draft' ? '—' : `${ch.current_round}/${ch.total_rounds}`}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">Round</div>
                </div>
                <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-gray-900">
                    {ch.top_score !== null ? ch.top_score.toFixed(0) : '—'}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">Top Score</div>
                </div>
              </div>

              {ch.top_team && (
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-800">Leader: {ch.top_team}</span>
                  {ch.top_score !== null && (
                    <span className="ml-auto text-xs font-bold text-amber-700">{ch.top_score}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-4">New Tournament</h3>
            <div className="space-y-3">
              <div><label className="label">Tournament Name</label><input className="input" placeholder="Q3 Landing Page Sprint" /></div>
              <div><label className="label">Total Rounds</label>
                <select className="input"><option>2</option><option>3</option><option>4</option></select>
              </div>
              <div><label className="label">Description</label><textarea className="input h-20 resize-none" placeholder="Tournament description…" /></div>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn-primary flex-1 justify-center" onClick={() => setShowNew(false)}>Create Tournament</button>
              <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
