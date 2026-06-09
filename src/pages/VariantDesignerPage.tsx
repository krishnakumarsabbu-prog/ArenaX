import { useState } from 'react'
import { Monitor, Smartphone, Tablet, Plus, Trash2, Eye } from 'lucide-react'

interface Variant {
  id: string
  name: string
  label: string
  color: string
  ctaText: string
  ctaColor: string
  headline: string
}

const DEFAULT_VARIANTS: Variant[] = [
  { id: 'control', name: 'Control', label: 'Control', color: '#FFFFFF', ctaText: 'Get Started', ctaColor: '#2563EB', headline: 'Build better products with data' },
  { id: 'var-a', name: 'Variant A', label: 'Variant A', color: '#FFFBEB', ctaText: 'Start Free Trial', ctaColor: '#D97706', headline: 'Build better products with data' },
  { id: 'var-b', name: 'Variant B', label: 'Variant B', color: '#F0FDF4', ctaText: 'Try it Now →', ctaColor: '#059669', headline: 'Ship experiments 10x faster' },
]

type Device = 'desktop' | 'tablet' | 'mobile'

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: 'w-full',
  tablet: 'w-96',
  mobile: 'w-64',
}

function MockPage({ variant, device }: { variant: Variant; device: Device }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300"
      style={{ background: variant.color }}>
      {/* Browser chrome */}
      <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded text-[10px] text-gray-400 px-2 py-0.5 text-center font-mono truncate">
          app.xtest.io/home
        </div>
      </div>
      {/* Page content */}
      <div className="p-5 space-y-3">
        <div className="text-[11px] text-gray-400 font-medium">Navigation bar</div>
        <div className="h-px bg-gray-100" />
        <div className="pt-2 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Hero Section</div>
          <div className="text-base font-bold text-gray-900 leading-snug">{variant.headline}</div>
          <div className="text-xs text-gray-500 leading-relaxed">The most powerful A/B testing platform for modern teams.</div>
          <button className="mt-2 px-4 py-2 rounded-lg text-white text-xs font-bold shadow-sm"
            style={{ background: variant.ctaColor }}>
            {variant.ctaText}
          </button>
        </div>
        <div className="pt-2 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].slice(0, device === 'mobile' ? 2 : 4).map(i => (
            <div key={i} className="h-12 rounded-lg bg-gray-100/60 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function VariantDesignerPage() {
  const [variants, setVariants] = useState<Variant[]>(DEFAULT_VARIANTS)
  const [selected, setSelected] = useState<string>('control')
  const [device, setDevice] = useState<Device>('desktop')
  const [editing, setEditing] = useState<Variant>(DEFAULT_VARIANTS[0])

  const handleSelect = (id: string) => {
    setSelected(id)
    setEditing(variants.find(v => v.id === id) ?? variants[0])
  }

  const handleChange = (field: keyof Variant, value: string) => {
    const updated = { ...editing, [field]: value }
    setEditing(updated)
    setVariants(vs => vs.map(v => v.id === updated.id ? updated : v))
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Variant Designer</h2>
          <p className="text-sm text-gray-400 mt-0.5">Side-by-side visual editor for experiment variants</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as [Device, React.ElementType][]).map(([d, Icon]) => (
              <button key={d} onClick={() => setDevice(d)}
                className={`p-2 rounded-lg transition-all ${device === d ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button className="btn-primary"><Plus className="w-4 h-4" /> Add Variant</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Editor panel */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">Edit Variant</div>
          {/* Variant picker */}
          <div className="space-y-1">
            {variants.map(v => (
              <button key={v.id} onClick={() => handleSelect(v.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all
                  ${selected === v.id ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
                {v.name}
              </button>
            ))}
          </div>
          <div className="h-px bg-gray-100" />
          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="label">Headline</label>
              <input value={editing.headline} onChange={e => handleChange('headline', e.target.value)} className="input text-xs" />
            </div>
            <div>
              <label className="label">CTA Text</label>
              <input value={editing.ctaText} onChange={e => handleChange('ctaText', e.target.value)} className="input text-xs" />
            </div>
            <div>
              <label className="label">CTA Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={editing.ctaColor} onChange={e => handleChange('ctaColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <input value={editing.ctaColor} onChange={e => handleChange('ctaColor', e.target.value)} className="input text-xs font-mono" />
              </div>
            </div>
            <div>
              <label className="label">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={editing.color} onChange={e => handleChange('color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <input value={editing.color} onChange={e => handleChange('color', e.target.value)} className="input text-xs font-mono" />
              </div>
            </div>
          </div>
          <button className="btn-primary w-full justify-center text-xs">
            <Eye className="w-3.5 h-3.5" /> Save & Preview
          </button>
        </div>

        {/* Preview area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Live Preview — {device.charAt(0).toUpperCase() + device.slice(1)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map(v => (
              <div key={v.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${v.id === 'control' ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-700'}`}>
                    {v.name}
                  </span>
                  {selected === v.id && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Editing</span>
                  )}
                </div>
                <MockPage variant={v} device={device} />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs font-bold text-gray-700 mb-3">Traffic Allocation</div>
            <div className="space-y-2">
              {variants.map((v, i) => {
                const weight = Math.round(100 / variants.length)
                return (
                  <div key={v.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20 truncate">{v.name}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${weight}%`, background: i === 0 ? '#94A3B8' : `hsl(${210 + i * 30},80%,55%)` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-8 text-right">{weight}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
