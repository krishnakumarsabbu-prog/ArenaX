import { useEffect } from 'react'
import Sidebar from './components/shell/Sidebar'
import Topbar from './components/shell/Topbar'
import { useStore } from './data/store'

import DashboardPage from './pages/DashboardPage'
import ExperimentsPage from './pages/ExperimentsPage'
import APIBuilderPage from './pages/APIBuilderPage'
import CockpitPage from './pages/CockpitPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AIInsightsPage from './pages/AIInsightsPage'
import ExecutionLogsPage from './pages/ExecutionLogsPage'
import ResponseComparatorPage from './pages/ResponseComparatorPage'
import UsersPage from './pages/admin/UsersPage'
import SettingsPage from './pages/admin/SettingsPage'
import IntegrationsPage from './pages/admin/IntegrationsPage'

export default function App() {
  const { activePage, tickLive } = useStore()

  useEffect(() => {
    const id = setInterval(tickLive, 2000)
    return () => clearInterval(id)
  }, [tickLive])

  const Page = {
    dashboard:            DashboardPage,
    experiments:          ExperimentsPage,
    'api-builder':        APIBuilderPage,
    cockpit:              CockpitPage,
    analytics:            AnalyticsPage,
    'ai-insights':        AIInsightsPage,
    'execution-logs':     ExecutionLogsPage,
    'response-comparator': ResponseComparatorPage,
    users:                UsersPage,
    settings:             SettingsPage,
    integrations:         IntegrationsPage,
  }[activePage]

  return (
    <div className="flex min-h-screen bg-[#0A0F1E] font-sans">
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
