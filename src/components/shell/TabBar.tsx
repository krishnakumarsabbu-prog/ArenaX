import { SlidersHorizontal, Trophy, FlaskConical, Zap } from 'lucide-react'
import { useExperiments } from '@/api/hooks/useExperiments'
import { useChallenges } from '@/api/hooks/useChallenges'

interface Props {
  activeTab: 'ab' | 'champion'
  onTabChange: (tab: 'ab' | 'champion') => void
}

export default function TabBar({ activeTab, onTabChange }: Props) {
  const { data: experiments } = useExperiments()
  const { data: challenges }  = useChallenges()

  const runningExp = experiments?.filter(e => e.status === 'running').length ?? 0
  const runningCh  = challenges?.filter(c => c.status === 'running').length ?? 0

  return (
    <div className="bg-white border-b border-gray-100 px-6 shadow-sm">
      <div className="flex items-end gap-0 -mb-px max-w-7xl mx-auto">
        <TabButton
          id="ab"
          active={activeTab === 'ab'}
          onClick={() => onTabChange('ab')}
          icon={SlidersHorizontal}
          label="A/B Testing"
          count={experiments?.length ?? 0}
          liveCount={runningExp}
          activeGradient="from-blue-600 to-cyan-500"
          activeBorder="border-blue-600"
          activeText="text-blue-700"
          activeBg="bg-blue-50/40"
          countBg="bg-blue-50 text-blue-700"
          liveBg="bg-blue-600"
        />
        <TabButton
          id="champion"
          active={activeTab === 'champion'}
          onClick={() => onTabChange('champion')}
          icon={Trophy}
          label="Challenge Champion"
          count={challenges?.length ?? 0}
          liveCount={runningCh}
          activeGradient="from-teal-600 to-emerald-500"
          activeBorder="border-teal-600"
          activeText="text-teal-700"
          activeBg="bg-teal-50/40"
          countBg="bg-teal-50 text-teal-700"
          liveBg="bg-teal-600"
        />
      </div>
    </div>
  )
}

interface TabButtonProps {
  id: string
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  count: number
  liveCount: number
  activeGradient: string
  activeBorder: string
  activeText: string
  activeBg: string
  countBg: string
  liveBg: string
}

function TabButton({ active, onClick, icon: Icon, label, count, liveCount, activeBorder, activeText, activeBg, countBg, liveBg }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-2.5 px-5 py-3.5 text-sm font-semibold
        border-b-2 transition-all duration-200
        ${active
          ? `${activeBorder} ${activeText} ${activeBg}`
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50/60'
        }
      `}
    >
      <Icon className={`w-4 h-4 transition-colors ${active ? activeText : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span>{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? countBg : 'bg-gray-100 text-gray-400'}`}>
          {count}
        </span>
        {liveCount > 0 && (
          <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-semibold text-white ${liveBg}`}>
            <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse" />
            {liveCount} live
          </span>
        )}
      </div>
    </button>
  )
}
