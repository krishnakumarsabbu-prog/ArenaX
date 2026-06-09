import { Bell, Settings, FlaskConical } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="bg-white border-b border-gray-200 h-14 px-6 flex items-center gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900 tracking-tight text-sm">XTest</span>
        <span className="text-xs font-medium bg-blue-600 text-white px-2 py-0.5 rounded-full">beta</span>
      </div>

      <div className="hidden md:flex items-center gap-1 ml-4">
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-xs text-gray-400 ml-3">Platform Engineering</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <div className="ml-1 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold border border-blue-200">
          KP
        </div>
      </div>
    </header>
  )
}
