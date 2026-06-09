import { useEffect } from 'react'
import Sidebar from './components/shell/Sidebar'
import Topbar from './components/shell/Topbar'
import { useStore } from './data/store'

import DashboardPage from './pages/DashboardPage'
import ExperimentsPage from './pages/ExperimentsPage'
import ABBuilderPage from './pages/ABBuilderPage'
import ABCockpitPage from './pages/ABCockpitPage'
import ABAnalyticsPage from './pages/ABAnalyticsPage'
import CCExperimentsPage from './pages/CCExperimentsPage'
import CCBuilderPage from './pages/CCBuilderPage'
import CCCockpitPage from './pages/CCCockpitPage'
import CCAnalyticsPage from './pages/CCAnalyticsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { activePage, tickLive } = useStore()

  useEffect(() => {
    const id = setInterval(tickLive, 2000)
    return () => clearInterval(id)
  }, [tickLive])

  const pages: Record<string, React.ComponentType> = {
    dashboard: DashboardPage,
    'ab-experiments': ExperimentsPage,
    'ab-builder': ABBuilderPage,
    'ab-cockpit': ABCockpitPage,
    'ab-analytics': ABAnalyticsPage,
    'cc-experiments': CCExperimentsPage,
    'cc-builder': CCBuilderPage,
    'cc-cockpit': CCCockpitPage,
    'cc-analytics': CCAnalyticsPage,
    settings: SettingsPage,
  }

  const Page = pages[activePage] ?? DashboardPage

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
