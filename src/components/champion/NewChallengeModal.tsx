import { useState } from 'react'
import Modal from '@/components/shared/Modal'
import { useCreateChallenge } from '@/api/hooks/useChallenges'

interface Props {
  onClose: () => void
}

export default function NewChallengeModal({ onClose }: Props) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    total_rounds: 3,
    scoring_config: {
      cvr_weight: 0.6,
      engagement_weight: 0.25,
      session_volume_weight: 0.15
    }
  })
  const { mutate: create, isPending } = useCreateChallenge()

  const valid = form.name.trim().length >= 3

  const handleSubmit = () => {
    if (!valid) return
    create(form, { onSuccess: onClose })
  }

  const setWeight = (key: keyof typeof form.scoring_config, val: number) => {
    setForm((f) => ({ ...f, scoring_config: { ...f.scoring_config, [key]: val } }))
  }

  const total = Object.values(form.scoring_config).reduce((a, b) => a + b, 0)

  return (
    <Modal title="New challenge" onClose={onClose}>
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="label">Challenge name</label>
          <input
            className="input"
            placeholder="e.g. Q3 Growth Hackathon"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="What are teams competing to optimise?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Number of rounds</label>
          <div className="flex gap-2">
            {[2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setForm((f) => ({ ...f, total_rounds: n }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.total_rounds === n
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label mb-0">Scoring weights</label>
            <span className={`text-xs font-medium ${Math.abs(total - 1) > 0.01 ? 'text-red-500' : 'text-green-600'}`}>
              Total: {(total * 100).toFixed(0)}%
            </span>
          </div>

          {([ ['cvr_weight', 'Conversion rate (CVR)'], ['engagement_weight', 'Engagement score'], ['session_volume_weight', 'Session volume'] ] as const).map(
            ([key, label]) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">{label}</span>
                  <span className="text-xs font-medium text-gray-900">{(form.scoring_config[key] * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.scoring_config[key] * 100}
                  onChange={(e) => setWeight(key, +e.target.value / 100)}
                  className="w-full accent-teal-600"
                />
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={handleSubmit}
          disabled={!valid || isPending}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Creating…' : 'Create challenge'}
        </button>
      </div>
    </Modal>
  )
}
