import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, CircleAlert as AlertCircle, Check } from 'lucide-react'
import { abApi } from '../api/client'
import type { ABExperiment, HttpMethod, AuthType } from '../types'
import { useStore } from '../data/store'

type Step = 1 | 2 | 3 | 4

interface FormData {
  name: string
  description: string
  environment: string
  method: HttpMethod
  base_url: string
  path: string
  body_template: string
  timeout_ms: number
  auth_type: AuthType
  auth_value: string
  request_headers: Record<string, string>
  variants: Array<{
    name: string
    weight: number
    url_override: string
    header_overrides: Record<string, string>
  }>
}

const ABBuilderPage: React.FC = () => {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const { setPage } = useStore()

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    environment: 'dev',
    method: 'GET',
    base_url: '',
    path: '',
    body_template: '',
    timeout_ms: 5000,
    auth_type: 'none',
    auth_value: '',
    request_headers: {},
    variants: [
      { name: 'Control', weight: 50, url_override: '', header_overrides: {} },
      { name: 'Variant A', weight: 50, url_override: '', header_overrides: {} },
    ],
  })

  const [headerKey, setHeaderKey] = useState('')
  const [headerValue, setHeaderValue] = useState('')
  const [headerOverrideKey, setHeaderOverrideKey] = useState<Record<number, string>>({})
  const [headerOverrideValue, setHeaderOverrideValue] = useState<Record<number, string>>({})

  const totalWeight = form.variants.reduce((sum, v) => sum + v.weight, 0)
  const weightWarning = totalWeight !== 100

  const handleInputChange = (field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleVariantChange = (idx: number, field: string, value: any) => {
    setForm((prev) => {
      const newVariants = [...prev.variants]
      newVariants[idx] = { ...newVariants[idx], [field]: value }
      return { ...prev, variants: newVariants }
    })
  }

  const addVariant = () => {
    if (form.variants.length < 5) {
      setForm((prev) => ({
        ...prev,
        variants: [
          ...prev.variants,
          { name: `Variant ${String.fromCharCode(65 + prev.variants.length - 1)}`, weight: 0, url_override: '', header_overrides: {} },
        ],
      }))
    }
  }

  const removeVariant = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }))
  }

  const addHeader = () => {
    if (headerKey.trim()) {
      setForm((prev) => ({
        ...prev,
        request_headers: { ...prev.request_headers, [headerKey]: headerValue },
      }))
      setHeaderKey('')
      setHeaderValue('')
    }
  }

  const removeHeader = (key: string) => {
    setForm((prev) => {
      const newHeaders = { ...prev.request_headers }
      delete newHeaders[key]
      return { ...prev, request_headers: newHeaders }
    })
  }

  const addHeaderOverride = (variantIdx: number) => {
    if (headerOverrideKey[variantIdx]?.trim()) {
      setForm((prev) => {
        const newVariants = [...prev.variants]
        newVariants[variantIdx].header_overrides = {
          ...newVariants[variantIdx].header_overrides,
          [headerOverrideKey[variantIdx]]: headerOverrideValue[variantIdx] || '',
        }
        return { ...prev, variants: newVariants }
      })
      setHeaderOverrideKey({ ...headerOverrideKey, [variantIdx]: '' })
      setHeaderOverrideValue({ ...headerOverrideValue, [variantIdx]: '' })
    }
  }

  const removeHeaderOverride = (variantIdx: number, key: string) => {
    setForm((prev) => {
      const newVariants = [...prev.variants]
      const newOverrides = { ...newVariants[variantIdx].header_overrides }
      delete newOverrides[key]
      newVariants[variantIdx].header_overrides = newOverrides
      return { ...prev, variants: newVariants }
    })
  }

  const handleSubmit = async () => {
    if (weightWarning) {
      alert('Variant weights must sum to 100%')
      return
    }
    setLoading(true)
    try {
      await abApi.create(form)
      setPage('ab-experiments')
    } catch (error) {
      console.error('Failed to create experiment:', error)
      alert('Failed to create experiment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setPage('ab-experiments')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
          >
            <ChevronLeft size={18} />
            Back to Experiments
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Create A/B Experiment</h1>
          <p className="text-slate-400">Set up a new A/B test with traffic splitting</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-between">
          {([1, 2, 3, 4] as const).map((s, idx) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {s}
              </div>
              {idx < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Request Config */}
        {step === 1 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white">Request Configuration</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Experiment Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="My A/B Test"
                  className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Environment</label>
                <select
                  value={form.environment}
                  onChange={(e) => handleInputChange('environment', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 focus:outline-none focus:border-blue-500/50"
                >
                  <option>dev</option>
                  <option>staging</option>
                  <option>prod</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="What is this experiment testing?"
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">HTTP Method</label>
                <select
                  value={form.method}
                  onChange={(e) => handleInputChange('method', e.target.value as HttpMethod)}
                  className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 focus:outline-none focus:border-blue-500/50"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                  <option>PATCH</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Timeout (ms)</label>
                <input
                  type="number"
                  value={form.timeout_ms}
                  onChange={(e) => handleInputChange('timeout_ms', parseInt(e.target.value))}
                  min="1000"
                  max="30000"
                  className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Base URL</label>
              <input
                type="text"
                value={form.base_url}
                onChange={(e) => handleInputChange('base_url', e.target.value)}
                placeholder="https://api.example.com"
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Path</label>
              <input
                type="text"
                value={form.path}
                onChange={(e) => handleInputChange('path', e.target.value)}
                placeholder="/api/endpoint"
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Request Body Template (JSON)</label>
              <textarea
                value={form.body_template}
                onChange={(e) => handleInputChange('body_template', e.target.value)}
                placeholder='{"key": "value"}'
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 2: Auth & Headers */}
        {step === 2 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white">Authentication & Headers</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Authentication Type</label>
              <select
                value={form.auth_type}
                onChange={(e) => handleInputChange('auth_type', e.target.value as AuthType)}
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 focus:outline-none focus:border-blue-500/50"
              >
                <option value="none">None</option>
                <option value="bearer">Bearer Token</option>
                <option value="api_key">API Key</option>
              </select>
            </div>

            {form.auth_type !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {form.auth_type === 'bearer' ? 'Bearer Token' : 'API Key Value'}
                </label>
                <input
                  type="password"
                  value={form.auth_value}
                  onChange={(e) => handleInputChange('auth_value', e.target.value)}
                  placeholder="Enter your token or key"
                  className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Request Headers</h3>
              <div className="space-y-2 mb-3">
                {Object.entries(form.request_headers).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1 text-sm">
                      <span className="text-slate-300 font-mono">{key}:</span>
                      <span className="text-slate-400 font-mono ml-2">{value}</span>
                    </div>
                    <button
                      onClick={() => removeHeader(key)}
                      className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={headerKey}
                  onChange={(e) => setHeaderKey(e.target.value)}
                  placeholder="Header name"
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
                <input
                  type="text"
                  value={headerValue}
                  onChange={(e) => setHeaderValue(e.target.value)}
                  placeholder="Header value"
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={addHeader}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Variants */}
        {step === 3 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white">Variants Configuration</h2>

            {weightWarning && (
              <div className="flex items-start gap-3 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <AlertCircle className="text-amber-300 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-amber-300">Weight Sum Warning</p>
                  <p className="text-sm text-amber-300/80">Weights must sum to 100% (currently {totalWeight}%)</p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Distribution Preview</p>
              <div className="flex h-4 rounded-full overflow-hidden bg-white/5 border border-white/10">
                {form.variants.map((v, idx) => {
                  const colors = ['bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900']
                  return (
                    <div
                      key={idx}
                      style={{ width: `${v.weight}%` }}
                      className={`${colors[idx % colors.length]}`}
                    />
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              {form.variants.map((variant, idx) => (
                <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-lg space-y-3">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-300 mb-1">Variant Name</label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-xs font-medium text-slate-300 mb-1">Weight %</label>
                      <input
                        type="number"
                        value={variant.weight}
                        onChange={(e) => handleVariantChange(idx, 'weight', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                        min="0"
                        max="100"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    {form.variants.length > 2 && (
                      <button
                        onClick={() => removeVariant(idx)}
                        className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-300 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">URL Override (optional)</label>
                    <input
                      type="text"
                      value={variant.url_override}
                      onChange={(e) => handleVariantChange(idx, 'url_override', e.target.value)}
                      placeholder="https://api-variant.example.com"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">Header Overrides</label>
                    <div className="space-y-2 mb-2">
                      {Object.entries(variant.header_overrides).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 p-2 bg-[#0D1117] rounded border border-white/5">
                          <span className="text-xs text-slate-400 font-mono flex-1">{key}</span>
                          <span className="text-xs text-slate-500 font-mono">{value}</span>
                          <button
                            onClick={() => removeHeaderOverride(idx, key)}
                            className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-300"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={headerOverrideKey[idx] || ''}
                        onChange={(e) => setHeaderOverrideKey({ ...headerOverrideKey, [idx]: e.target.value })}
                        placeholder="Header name"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      />
                      <input
                        type="text"
                        value={headerOverrideValue[idx] || ''}
                        onChange={(e) => setHeaderOverrideValue({ ...headerOverrideValue, [idx]: e.target.value })}
                        placeholder="Header value"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      />
                      <button
                        onClick={() => addHeaderOverride(idx)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {form.variants.length < 5 && (
              <button
                onClick={addVariant}
                className="w-full px-4 py-2 rounded-lg border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Variant
              </button>
            )}
          </div>
        )}

        {/* Step 4: Review & Create */}
        {step === 4 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white">Review & Create</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Experiment Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-500">Name:</span> <span className="text-slate-100 font-medium">{form.name}</span></div>
                  <div><span className="text-slate-500">Environment:</span> <span className="text-slate-100 font-medium">{form.environment}</span></div>
                  <div><span className="text-slate-500">Method:</span> <span className="text-slate-100 font-medium">{form.method}</span></div>
                  <div><span className="text-slate-500">Timeout:</span> <span className="text-slate-100 font-medium">{form.timeout_ms}ms</span></div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Endpoint</h3>
                <div className="space-y-2 text-sm font-mono text-slate-300 break-all">
                  <div>{form.base_url}</div>
                  <div className="text-slate-400">/{form.path}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Variants</h3>
              <div className="space-y-2">
                {form.variants.map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{v.name}</span>
                    <span className="text-slate-400">{v.weight}%</span>
                  </div>
                ))}
              </div>
            </div>

            {form.auth_type !== 'none' && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Authentication</h3>
                <p className="text-sm text-slate-400">{form.auth_type.toUpperCase()} enabled</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev))}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-2 rounded-lg border border-white/8 bg-white/5 hover:bg-white/10 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev))}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || weightWarning}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={18} />
              {loading ? 'Creating...' : 'Create Experiment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ABBuilderPage
