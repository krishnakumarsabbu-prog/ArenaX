import { SlidersHorizontal, Trophy } from 'lucide-react'
import { useExperiments } from '@/api/hooks/useExperiments'
import { useChallenges } from '@/api/hooks/useChallenges'

interface Props {
  activeTab: 'ab' | 'champion'
  onTabChange: (tab: 'ab' | 'champion') => void
}

export default function TabBar({ activeTab, onTabChange }: Props) {
  const { data: experiments } = useExperiments()
  const { data: challenges }  = useChallenges()

  const tabs = [
    {
      id: 'ab' as const,
      label: 'A/B Testing',
      icon: SlidersHorizontal,
      count: experiments?.length ?? 0,
      activeColor: 'text-blue-700 border-blue-600',
      countColor: 'bg-blue-50 text-blue-700'
    },
    {
      id: 'champion' as const,
      label: 'Challenge Champion',
      icon: Trophy,
      count: challenges?.length ?? 0,
      activeColor: 'text-teal-700 border-teal-600',
      countColor: 'bg-teal-50 text-teal-700'
    }
  ]

  return (
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="flex gap-1 -mb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium
                border-b-2 transition-all
                ${isActive
                  ? `${tab.activeColor} bg-white`
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                isActive ? tab.countColor : 'bg-gray-100 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
