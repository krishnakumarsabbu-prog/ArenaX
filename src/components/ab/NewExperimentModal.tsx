import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore } from '../../data/store'
import { Experiment } from '../../types'

interface Props {
  onClose: () => void
}

export default function NewExperimentModal({ onClose }: Props) {
  const { addExperiment } = useStore()
  const [form, setForm] = useState({
    name: '',
    url: '',
    hypothesis: '',
    goal_metric: 'conversion' as Experiment['goal_metric'],
    min_sessions: 1000,
    confidence_threshold: 95,
    traffic_pct: 50,
  })

  const valid = form.name.trim().length >= 3 && form.url.trim().length > 5

  const handleSubmit = () => {
    if (!valid) return
    const exp: Experiment = {
      id: `exp-${Date.now()}`,
      name: form.name,
      url: form.url,
      status: 'draft',
      hypothesis: form.hypothesis || null,
      goal_metric: form.goal_metric,
      traffic_pct: form.traffic_pct,
      min_sessions: form.min_sessions,
      confidence_threshold: form.confidence_threshold,
      created_at: new Date().toISOString(),
      concluded_at: null,
      ai_verdict: null,
      variant_count: 2,
      total_sessions: 0,
      leading_lift: null,
    }
    addExperiment(exp)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">New Experiment</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Experiment Name</label>
            <input className="input" placeholder="e.g. Checkout CTA copy test"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Target URL</label>
            <input className="input" placeholder="https://yoursite.com/page"
              value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </div>
          <div>
            <label className="label">Hypothesis <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea className="input resize-none" rows={3}
              placeholder="e.g. Changing the CTA will increase conversions by 10%…"
              value={form.hypothesis} onChange={e => setForm(f => ({ ...f, hypothesis: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Goal Metric</label>
              <select className="input" value={form.goal_metric}
                onChange={e => setForm(f => ({ ...f, goal_metric: e.target.value as Experiment['goal_metric'] }))}>
                <option value="conversion">Conversion</option>
                <option value="click">Click-through</option>
                <option value="scroll">Scroll depth</option>
              </select>
            </div>
            <div>
              <label className="label">Min Sessions</label>
              <input type="number" className="input" value={form.min_sessions}
                onChange={e => setForm(f => ({ ...f, min_sessions: +e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Confidence Threshold: <span className="text-gray-900 font-medium">{form.confidence_threshold}%</span></label>
            <input type="range" min={80} max={99} step={1} value={form.confidence_threshold}
              onChange={e => setForm(f => ({ ...f, confidence_threshold: +e.target.value }))}
              className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="label">Traffic Allocation: <span className="text-gray-900 font-medium">{form.traffic_pct}%</span></label>
            <input type="range" min={10} max={100} step={10} value={form.traffic_pct}
              onChange={e => setForm(f => ({ ...f, traffic_pct: +e.target.value }))}
              className="w-full accent-blue-600" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={!valid} className="btn-primary">Create Experiment</button>
        </div>
      </div>
    </div>
  )
}
