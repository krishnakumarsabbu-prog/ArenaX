import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, CircleAlert as AlertCircle, Check } from 'lucide-react'
import { ccApi } from '../api/client'
import type { HttpMethod, AuthType, ScoringRules } from '../types'
import { useStore } from '../data/store'

type Step = 1 | 2 | 3 | 4

interface FormData {
  name: string
  description: string
  environment: string
  method: HttpMethod
  champion_url: string
  challenger_url: string
  path: string
  body_template: string
  request_headers: Record<string, string>
  auth_type: AuthType
  auth_value: string
  timeout_ms: number
  scoring_rules: ScoringRules
}

const CCBuilderPage: React.FC = () => {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const { setPage } = useStore()

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    environment: 'dev',
    method: 'GET',
    champion_url: '',
    challenger_url: '',
    path: '',
    body_template: '',
    request_headers: {},
    auth_type: 'none',
    auth_value: '',
    timeout_ms: 5000,
    scoring_rules: {
      priority: 'latency',
      success_status_required: true,
      latency_weight: 0.5,
      error_weight: 0.3,
      business_metric_weight: 0.2,
    },
  })

  const [headerKey, setHeaderKey] = useState('')
  const [headerValue, setHeaderValue] = useState('')

  const weightSum = form.scoring_rules.latency_weight + form.scoring_rules.error_weight + form.scoring_rules.business_metric_weight
  const weightWarning = Math.abs(weightSum - 1.0) > 0.01

  const handleInputChange = (field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleScoringChange = (field: keyof ScoringRules, value: any) => {
    setForm((prev) => ({
      ...prev,
      scoring_rules: { ...prev.scoring_rules, [field]: value },
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

  const handleSubmit = async () => {
    if (weightWarning) {
      alert('Scoring weights must sum to 1.0')
      return
    }
    setLoading(true)
    try {
      await ccApi.create(form)
      setPage('cc-experiments')
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
            onClick={() => setPage('cc-experiments')}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4"
          >
            <ChevronLeft size={18} />
            Back to Experiments
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Create CC Experiment</h1>
          <p className="text-slate-400">Compare champion vs challenger implementations</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-between">
          {([1, 2, 3, 4] as const).map((s, idx) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  step >= s
                    ? 'bg-teal-600 text-white'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {s}
              </div>
              {idx < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-teal-600' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Experiment Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="My CC Test"
                  className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Environment</label>
                <select
                  value={form.environment}
                  onChange={(e) => handleInputChange('environment', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 focus:outline-none focus:border-teal-500/50"
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
                placeholder="What are you testing?"
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">HTTP Method</label>
              <select
                value={form.method}
                onChange={(e) => handleInputChange('method', e.target.value as HttpMethod)}
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 focus:outline-none focus:border-teal-500/50"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
                <option>PATCH</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: URLs & Headers */}
        {step === 2 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white">Champion & Challenger URLs</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Champion URL</label>
              <input
                type="text"
                value={form.champion_url}
                onChange={(e) => handleInputChange('champion_url', e.target.value)}
                placeholder="https://champion-api.example.com"
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Challenger URL</label>
              <input
                type="text"
                value={form.challenger_url}
                onChange={(e) => handleInputChange('challenger_url', e.target.value)}
                placeholder="https://challenger-api.example.com"
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Path</label>
              <input
                type="text"
                value={form.path}
                onChange={(e) => handleInputChange('path', e.target.value)}
                placeholder="/api/endpoint"
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Request Body Template (JSON)</label>
              <textarea
                value={form.body_template}
                onChange={(e) => handleInputChange('body_template', e.target.value)}
                placeholder='{"key": "value"}'
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 font-mono text-sm"
              />
            </div>

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
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                />
                <input
                  type="text"
                  value={headerValue}
                  onChange={(e) => setHeaderValue(e.target.value)}
                  placeholder="Header value"
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                />
                <button
                  onClick={addHeader}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Authentication Type</label>
              <select
                value={form.auth_type}
                onChange={(e) => handleInputChange('auth_type', e.target.value as AuthType)}
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 focus:outline-none focus:border-teal-500/50"
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
                  className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Scoring Rules */}
        {step === 3 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white">Scoring Rules</h2>

            {weightWarning && (
              <div className="flex items-start gap-3 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <AlertCircle className="text-amber-300 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-amber-300">Weight Sum Warning</p>
                  <p className="text-sm text-amber-300/80">Weights must sum to 1.0 (currently {weightSum.toFixed(2)})</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority Metric</label>
              <select
                value={form.scoring_rules.priority}
                onChange={(e) => handleScoringChange('priority', e.target.value as 'latency' | 'error_rate' | 'business')}
                className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 focus:outline-none focus:border-teal-500/50"
              >
                <option value="latency">Latency (lower is better)</option>
                <option value="error_rate">Error Rate (lower is better)</option>
                <option value="business">Business Metric (configurable)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 p-4 bg-white/5 rounded-lg border border-white/10">
              <input
                type="checkbox"
                id="success_required"
                checked={form.scoring_rules.success_status_required}
                onChange={(e) => handleScoringChange('success_status_required', e.target.checked)}
                className="rounded border-white/8"
              />
              <label htmlFor="success_required" className="text-sm text-slate-300">
                Require 2xx status code for scoring
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Latency Weight: {form.scoring_rules.latency_weight.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={form.scoring_rules.latency_weight}
                onChange={(e) => handleScoringChange('latency_weight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Error Rate Weight: {form.scoring_rules.error_weight.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={form.scoring_rules.error_weight}
                onChange={(e) => handleScoringChange('error_weight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Business Metric Weight: {form.scoring_rules.business_metric_weight.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={form.scoring_rules.business_metric_weight}
                onChange={(e) => handleScoringChange('business_metric_weight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {form.scoring_rules.business_metric_weight > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Business Metric Path (JSON path)</label>
                <input
                  type="text"
                  value={form.scoring_rules.business_metric_path || ''}
                  onChange={(e) => handleScoringChange('business_metric_path', e.target.value)}
                  placeholder="response.user.engagement_score"
                  className="w-full px-4 py-2 rounded-lg bg-[#0D1117] border border-white/8 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>
            )}

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Weight Summary</h3>
              <div className="space-y-1 text-sm font-mono">
                <div className="text-slate-400">Latency: {(form.scoring_rules.latency_weight * 100).toFixed(0)}%</div>
                <div className="text-slate-400">Error Rate: {(form.scoring_rules.error_weight * 100).toFixed(0)}%</div>
                <div className="text-slate-400">Business: {(form.scoring_rules.business_metric_weight * 100).toFixed(0)}%</div>
                <div className={`${Math.abs(weightSum - 1.0) < 0.01 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Total: {(weightSum * 100).toFixed(0)}%
                </div>
              </div>
            </div>
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
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-sm font-medium text-slate-300 mb-2">URLs</h3>
                <div className="space-y-2 text-sm font-mono text-slate-300 break-all">
                  <div className="text-blue-400">Champion:</div>
                  <div className="text-slate-400 text-xs">{form.champion_url}</div>
                  <div className="text-teal-400 mt-2">Challenger:</div>
                  <div className="text-slate-400 text-xs">{form.challenger_url}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Scoring Configuration</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-500">Priority:</span> <span className="text-slate-100 font-medium">{form.scoring_rules.priority}</span></div>
                <div><span className="text-slate-500">Latency Weight:</span> <span className="text-slate-100 font-medium">{(form.scoring_rules.latency_weight * 100).toFixed(0)}%</span></div>
                <div><span className="text-slate-500">Error Weight:</span> <span className="text-slate-100 font-medium">{(form.scoring_rules.error_weight * 100).toFixed(0)}%</span></div>
                <div><span className="text-slate-500">Business Weight:</span> <span className="text-slate-100 font-medium">{(form.scoring_rules.business_metric_weight * 100).toFixed(0)}%</span></div>
              </div>
            </div>
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
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
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

export default CCBuilderPage
