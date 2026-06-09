import { Plug, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Plus } from 'lucide-react'

const INTEGRATIONS = [
  {
    name: 'Google Analytics 4',
    desc: 'Session and conversion data sync',
    logo: '📊',
    status: 'connected',
    lastSync: '2 min ago',
  },
  {
    name: 'Segment',
    desc: 'Event stream integration',
    logo: '🔵',
    status: 'connected',
    lastSync: '5 min ago',
  },
  {
    name: 'Slack',
    desc: 'Experiment alerts & notifications',
    logo: '💬',
    status: 'connected',
    lastSync: 'N/A',
  },
  {
    name: 'Mixpanel',
    desc: 'User journey analytics',
    logo: '📈',
    status: 'disconnected',
    lastSync: 'Never',
  },
  {
    name: 'Amplitude',
    desc: 'Product analytics platform',
    logo: '🎯',
    status: 'disconnected',
    lastSync: 'Never',
  },
  {
    name: 'Datadog',
    desc: 'Infrastructure & APM monitoring',
    logo: '🐶',
    status: 'disconnected',
    lastSync: 'Never',
  },
  {
    name: 'Webhook',
    desc: 'Custom HTTP webhook endpoint',
    logo: '🔗',
    status: 'connected',
    lastSync: '1h ago',
  },
  {
    name: 'Jira',
    desc: 'Link experiments to tickets',
    logo: '📋',
    status: 'disconnected',
    lastSync: 'Never',
  },
]

const API_KEYS = [
  { name: 'Production SDK Key', key: 'xtest_prod_••••••••••••••••4a2f', created: '2026-01-15', lastUsed: '5m ago' },
  { name: 'Staging SDK Key', key: 'xtest_stg_••••••••••••••••8c91', created: '2026-03-01', lastUsed: '2h ago' },
]

export default function IntegrationsPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Integrations</h2>
        <p className="text-sm text-gray-400 mt-0.5">Connect XTest with your analytics and tooling stack</p>
      </div>

      {/* Status summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <CheckCircle className="w-3.5 h-3.5" /> 4 connected
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <AlertCircle className="w-3.5 h-3.5" /> 4 available
        </div>
      </div>

      {/* Integration grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {INTEGRATIONS.map((int) => (
          <div key={int.name}
            className={`bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all
              ${int.status === 'connected' ? 'border-gray-100' : 'border-gray-100 opacity-75'}`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{int.logo}</span>
              {int.status === 'connected' ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                  <CheckCircle className="w-2.5 h-2.5" /> Connected
                </span>
              ) : (
                <button className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
                  Connect
                </button>
              )}
            </div>
            <div className="text-sm font-bold text-gray-900">{int.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{int.desc}</div>
            {int.status === 'connected' && (
              <div className="text-[10px] text-gray-400 mt-2">Synced: {int.lastSync}</div>
            )}
          </div>
        ))}
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
          <div className="text-sm font-bold text-gray-900">API Keys</div>
          <button className="btn-secondary text-xs py-1.5"><Plus className="w-3.5 h-3.5" /> New Key</button>
        </div>
        <div className="divide-y divide-gray-50">
          {API_KEYS.map(k => (
            <div key={k.name} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{k.name}</div>
                <div className="text-xs font-mono text-gray-400 mt-0.5">{k.key}</div>
              </div>
              <div className="text-right text-xs text-gray-400">
                <div>Created: {k.created}</div>
                <div className="text-green-600 font-medium">Used: {k.lastUsed}</div>
              </div>
              <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">Revoke</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
