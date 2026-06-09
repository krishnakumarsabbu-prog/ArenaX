import { useState } from 'react'
import Topbar from '@/components/shell/Topbar'
import TabBar from '@/components/shell/TabBar'
import ABTestingTab from '@/components/ab/ABTestingTab'
import ChampionTab from '@/components/champion/ChampionTab'

type Tab = 'ab' | 'champion'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('ab')

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Topbar />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'ab'       && <ABTestingTab />}
        {activeTab === 'champion' && <ChampionTab />}
      </main>
    </div>
  )
}
