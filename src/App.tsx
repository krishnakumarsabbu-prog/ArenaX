import { useEffect } from 'react'
import Sidebar from './components/shell/Sidebar'
import Topbar from './components/shell/Topbar'
import { useStore } from './data/store'

import DashboardPage from './pages/DashboardPage'
import ExperimentsPage from './pages/ExperimentsPage'
import CockpitPage from './pages/CockpitPage'
import AnalyticsPage from './pages/AnalyticsPage'
import VariantDesignerPage from './pages/VariantDesignerPage'
import AIInsightsPage from './pages/AIInsightsPage'
import TournamentsPage from './pages/TournamentsPage'
import BracketsPage from './pages/BracketsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import TeamDetailPage from './pages/TeamDetailPage'
import AICoachPage from './pages/AICoachPage'
import UsersPage from './pages/admin/UsersPage'
import SettingsPage from './pages/admin/SettingsPage'
import IntegrationsPage from './pages/admin/IntegrationsPage'

export default function App() {
  const { activePage, tickLive } = useStore()

  // Simulate live session ticking
  useEffect(() => {
    const id = setInterval(tickLive, 3000)
    return () => clearInterval(id)
  }, [tickLive])

  const Page = {
    dashboard: DashboardPage,
    experiments: ExperimentsPage,
    'experiment-cockpit': CockpitPage,
    analytics: AnalyticsPage,
    'variant-designer': VariantDesignerPage,
    'ai-insights': AIInsightsPage,
    tournaments: TournamentsPage,
    brackets: BracketsPage,
    leaderboard: LeaderboardPage,
    'team-detail': TeamDetailPage,
    'ai-coach': AICoachPage,
    users: UsersPage,
    settings: SettingsPage,
    integrations: IntegrationsPage,
  }[activePage]

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Page />
        </main>
      </div>
    </div>
  )
}
