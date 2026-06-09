import { useState } from 'react'
import Modal from '@/components/shared/Modal'
import { useCreateExperiment } from '@/api/hooks/useExperiments'

interface Props {
  onClose: () => void
}

export default function NewExperimentModal({ onClose }: Props) {
  const [form, setForm] = useState({
    name: '',
    url: '',
    hypothesis: '',
    goal_metric: 'conversion' as 'conversion' | 'click' | 'scroll',
    min_sessions: 1000,
    confidence_threshold: 0.95,
    traffic_pct: 1.0
  })
  const { mutate: create, isPending } = useCreateExperiment()

  const valid = form.name.trim().length >= 3 && form.url.trim().length > 5

  const handleSubmit = () => {
    if (!valid) return
    create(form, { onSuccess: onClose })
  }

  return (
    <Modal title="New experiment" onClose={onClose}>
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="label">Experiment name</label>
          <input
            className="input"
            placeholder="e.g. Checkout CTA copy test"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Target URL</label>
          <input
            className="input"
            placeholder="https://yoursite.com/page"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">
            Hypothesis <span className="text-gray-400 font-normal">(optional but recommended)</span>
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="e.g. Changing the CTA from 'Buy Now' to 'Get Yours Today' will increase checkout conversions by 10% because it reduces purchase anxiety."
            value={form.hypothesis}
            onChange={(e) => setForm((f) => ({ ...f, hypothesis: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Goal metric</label>
            <select
              className="input"
              value={form.goal_metric}
              onChange={(e) => setForm((f) => ({ ...f, goal_metric: e.target.value as typeof form.goal_metric }))}
            >
              <option value="conversion">Conversion</option>
              <option value="click">Click</option>
              <option value="scroll">Scroll depth</option>
            </select>
          </div>
          <div>
            <label className="label">Min sessions</label>
            <input
              type="number"
              className="input"
              value={form.min_sessions}
              onChange={(e) => setForm((f) => ({ ...f, min_sessions: +e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="label">
            Confidence threshold: <span className="text-gray-900 font-medium">{(form.confidence_threshold * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min={80}
            max={99}
            step={1}
            value={form.confidence_threshold * 100}
            onChange={(e) => setForm((f) => ({ ...f, confidence_threshold: +e.target.value / 100 }))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>80%</span><span>99%</span>
          </div>
        </div>

        <div>
          <label className="label">
            Traffic allocation: <span className="text-gray-900 font-medium">{(form.traffic_pct * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={10}
            value={form.traffic_pct * 100}
            onChange={(e) => setForm((f) => ({ ...f, traffic_pct: +e.target.value / 100 }))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={handleSubmit}
          disabled={!valid || isPending}
          className="btn-primary"
        >
          {isPending ? 'Creating…' : 'Create experiment'}
        </button>
      </div>
    </Modal>
  )
}
