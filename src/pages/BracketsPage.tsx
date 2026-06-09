import { useState } from 'react'
import { Trophy, ChevronRight, Swords } from 'lucide-react'
import { useStore } from '../data/store'
import { BracketPair, BracketTeam } from '../types'

function TeamCard({ team, winner }: { team?: BracketTeam; winner?: boolean }) {
  if (!team) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-300 font-medium">TBD</span>
      </div>
    )
  }
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all
      ${winner ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white'}`}>
      {winner && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-gray-900 truncate">{team.name}</div>
        {team.cvr !== null && (
          <div className="text-[10px] text-gray-400">CVR: {team.cvr}%</div>
        )}
      </div>
      {team.score !== null && (
        <span className={`text-sm font-bold tabular-nums flex-shrink-0
          ${winner ? 'text-blue-700' : 'text-gray-700'}`}>
          {team.score}
        </span>
      )}
    </div>
  )
}

function MatchCard({ pair, isCurrentRound }: { pair: BracketPair; isCurrentRound: boolean }) {
  const winner = pair.team_a && pair.team_b
    ? (pair.team_a.score ?? 0) > (pair.team_b.score ?? 0) ? 'a' : 'b'
    : null

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden
      ${isCurrentRound ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}>
      {isCurrentRound && (
        <div className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wide">
          Live Match
        </div>
      )}
      <div className="p-3 space-y-1.5">
        <TeamCard team={pair.team_a} winner={winner === 'a'} />
        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px bg-gray-100" />
          <Swords className="w-3 h-3 text-gray-300" />
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <TeamCard team={pair.team_b} winner={winner === 'b'} />
      </div>
    </div>
  )
}

export default function BracketsPage() {
  const { challenges, bracket, selectChallenge, selectedChallengeId } = useStore()
  const running = challenges.filter(c => c.status === 'running')

  const rounds = Array.from(new Set(bracket.bracket.map(p => p.round))).sort()
  const roundGroups = rounds.map(r => ({
    round: r,
    pairs: bracket.bracket.filter(p => p.round === r),
    isCurrent: r === bracket.current_round,
  }))

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Challenge selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {running.map(ch => (
          <button key={ch.id} onClick={() => selectChallenge(ch.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all
              ${(selectedChallengeId ?? running[0]?.id) === ch.id
                ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-200'}`}>
            <Trophy className="w-3.5 h-3.5" />
            {ch.name}
          </button>
        ))}
      </div>

      {/* Bracket header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{bracket.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Round {bracket.current_round} of {bracket.total_rounds} · {bracket.status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rounds.map(r => (
            <span key={r} className={`text-xs font-semibold px-2.5 py-1 rounded-full
              ${r === bracket.current_round ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
              Round {r}
            </span>
          ))}
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 font-medium">Final →</span>
        </div>
      </div>

      {/* Bracket view */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {roundGroups.map(({ round, pairs, isCurrent }) => (
          <div key={round} className="flex-shrink-0 w-60">
            <div className={`text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2
              ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
              {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
              Round {round} {isCurrent ? '(Live)' : ''}
            </div>
            <div className="space-y-4">
              {pairs.map((pair, i) => (
                <MatchCard key={i} pair={pair} isCurrentRound={isCurrent} />
              ))}
            </div>
          </div>
        ))}
        {/* Final placeholder */}
        <div className="flex-shrink-0 w-60">
          <div className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-300">Final</div>
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-300" />
            <span className="text-xs text-gray-400 text-center">Champion will be crowned here</span>
          </div>
        </div>
      </div>

      {/* Score comparison */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="text-sm font-bold text-gray-900 mb-4">Current Round Score Comparison</div>
        <div className="space-y-3">
          {roundGroups.find(r => r.isCurrent)?.pairs.map((pair, i) => {
            const max = Math.max(pair.team_a?.score ?? 0, pair.team_b?.score ?? 0, 1)
            return (
              <div key={i} className="grid grid-cols-5 gap-3 items-center">
                <div className="text-right text-xs font-semibold text-gray-700 col-span-1 truncate">{pair.team_a?.name}</div>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                      <div className="h-full rounded-full transition-all duration-700 bg-blue-500"
                        style={{ width: `${((pair.team_a?.score ?? 0) / max) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-300 font-bold w-4 text-center">vs</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700 bg-teal-500"
                        style={{ width: `${((pair.team_b?.score ?? 0) / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-gray-700 col-span-1 truncate">{pair.team_b?.name}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
