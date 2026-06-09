import { Bell, Shield, Database, Palette, Globe } from 'lucide-react'

interface Field {
  label: string
  type: 'select' | 'toggle' | 'number' | 'range' | 'text' | 'color'
  value: string | boolean | number
  options?: string[]
}

interface Section {
  icon: React.ElementType
  title: string
  fields: Field[]
}

const SECTIONS: Section[] = [
  {
    icon: Palette,
    title: 'Appearance',
    fields: [
      { label: 'Theme', type: 'select', value: 'Light', options: ['Light', 'Dark', 'System'] },
      { label: 'Primary Color', type: 'color', value: '#2563EB' },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    fields: [
      { label: 'Email alerts when experiment reaches significance', type: 'toggle', value: true },
      { label: 'Weekly digest summary', type: 'toggle', value: true },
      { label: 'Tournament round updates', type: 'toggle', value: false },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    fields: [
      { label: 'Two-factor authentication', type: 'toggle', value: false },
      { label: 'Session timeout (minutes)', type: 'number', value: '60' },
    ],
  },
  {
    icon: Database,
    title: 'Data',
    fields: [
      { label: 'Default traffic allocation', type: 'range', value: '50' },
      { label: 'Default confidence threshold', type: 'range', value: '95' },
      { label: 'Min sessions before significance', type: 'number', value: '1000' },
    ],
  },
  {
    icon: Globe,
    title: 'Platform',
    fields: [
      { label: 'Organization name', type: 'text', value: 'XTest Platform Inc.' },
      { label: 'Timezone', type: 'select', value: 'UTC', options: ['UTC', 'UTC-5', 'UTC-8', 'UTC+1', 'UTC+9'] },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">Platform configuration & preferences</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {SECTIONS.map(section => {
          const Icon = section.icon
          return (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-gray-900">{section.title}</span>
              </div>
              <div className="p-5 space-y-4">
                {section.fields.map(field => (
                  <div key={field.label} className="flex items-center justify-between gap-4">
                    <label className="text-sm text-gray-600 flex-1">{field.label}</label>
                    {field.type === 'toggle' && (
                      <div className={`w-10 h-5 rounded-full cursor-pointer transition-colors flex items-center px-0.5
                        ${field.value ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform
                          ${field.value ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    )}
                    {field.type === 'select' && (
                      <select className="input w-auto text-sm py-1.5" defaultValue={field.value as string}>
                        {field.options?.map((o: string) => <option key={o}>{o}</option>)}
                      </select>
                    )}
                    {field.type === 'text' && (
                      <input className="input w-52 text-sm" defaultValue={field.value as string} />
                    )}
                    {field.type === 'number' && (
                      <input type="number" className="input w-24 text-sm" defaultValue={field.value as string} />
                    )}
                    {field.type === 'color' && (
                      <input type="color" className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                        defaultValue={field.value as string} />
                    )}
                    {field.type === 'range' && (
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={100} defaultValue={field.value as string}
                          className="w-32 accent-blue-600" />
                        <span className="text-xs font-bold text-gray-700 w-8">{field.value}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        <button className="btn-primary">Save Settings</button>
      </div>
    </div>
  )
}
