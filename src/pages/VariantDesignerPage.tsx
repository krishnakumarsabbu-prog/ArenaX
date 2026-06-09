import { useState } from 'react'
import { FlaskConical, Plus, Trash2, ChevronDown, Info, CircleCheck as CheckCircle, Shield } from 'lucide-react'
import { useStore } from '../data/store'
import { ApiExperiment, HttpMethod, ExecutionMode, AuthType, Environment, VariantType } from '../types'

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-400 bg-emerald-500/15',
  POST: 'text-blue-400 bg-blue-500/15',
  PUT: 'text-amber-400 bg-amber-500/15',
  DELETE: 'text-red-400 bg-red-500/15',
  PATCH: 'text-violet-400 bg-violet-500/15',
}

interface VariantForm {
  id: string
  name: string
  type: VariantType
  target_url: string
  description: string
  weight: number
}

export default function APIBuilderPage() {
  const { addExperiment, setPage } = useStore()

  const [step, setStep] = useState(1)
  const [saved, setSaved] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('ab')
  const [environment, setEnvironment] = useState<Environment>('staging')
  const [method, setMethod] = useState<HttpMethod>('POST')
  const [baseUrl, setBaseUrl] = useState('')
  const [path, setPath] = useState('/')
  const [queryParams, setQueryParams] = useState<{ key: string; value: string }[]>([])
  const [bodyTemplate, setBodyTemplate] = useState('')
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Content-Type', value: 'application/json' },
  ])
  const [authType, setAuthType] = useState<AuthType>('none')
  const [authValue, setAuthValue] = useState('')
  const [timeoutMs, setTimeoutMs] = useState(5000)
  const [maxRetries, setMaxRetries] = useState(0)
  const [scoringLatency, setScoringLatency] = useState(0.4)
  const [scoringError, setScoringError] = useState(0.4)
  const [scoringBusiness, setScoringBusiness] = useState(0.2)
  const [businessMetricPath, setBusinessMetricPath] = useState('')
  const [variants, setVariants] = useState<VariantForm[]>([
    { id: 'v1', name: 'Variant A (Baseline)', type: 'service_routing', target_url: '', description: 'Current production service', weight: 50 },
    { id: 'v2', name: 'Variant B (Challenger)', type: 'service_routing', target_url: '', description: 'New candidate service', weight: 50 },
  ])

  function addVariant() {
    setVariants((v) => [...v, {
      id: 'v' + Date.now(),
      name: `Variant ${String.fromCharCode(65 + v.length)}`,
      type: 'service_routing',
      target_url: '',
      description: '',
      weight: Math.floor(100 / (v.length + 1)),
    }])
  }

  function removeVariant(id: string) {
    if (variants.length <= 2) return
    setVariants((v) => v.filter((x) => x.id !== id))
  }

  function updateVariant(id: string, key: keyof VariantForm, value: string | number) {
    setVariants((v) => v.map((x) => x.id === id ? { ...x, [key]: value } : x))
  }

  function handleSave() {
    const now = new Date().toISOString()
    const exp: ApiExperiment = {
      id: 'exp-' + Date.now(),
      name: name || 'Untitled Experiment',
      description,
      status: 'draft',
      execution_mode: executionMode,
      environment,
      request_config: {
        method,
        base_url: baseUrl,
        path,
        query_params: Object.fromEntries(queryParams.map((q) => [q.key, q.value])),
        body_template: bodyTemplate,
        headers: Object.fromEntries(headers.map((h) => [h.key, h.value])),
      },
      auth_config: { type: authType, value: authValue },
      timeout_ms: timeoutMs,
      max_retries: maxRetries,
      scoring_rules: {
        success_status: 200,
        latency_weight: scoringLatency,
        error_weight: scoringError,
        business_metric_weight: scoringBusiness,
        business_metric_path: businessMetricPath || undefined,
      },
      variant_count: variants.length,
      total_requests: 0,
      error_rate: 0,
      avg_latency_ms: 0,
      winner_variant_id: null,
      created_at: now,
      concluded_at: null,
    }
    addExperiment(exp)
    setSaved(true)
    setTimeout(() => setPage('experiments'), 1500)
  }

  const steps = [
    { n: 1, label: 'Request Definition' },
    { n: 2, label: 'Auth & Headers' },
    { n: 3, label: 'Variants' },
    { n: 4, label: 'Scoring Rules' },
  ]

  if (saved) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Experiment Created</h3>
          <p className="text-slate-400 text-sm">Redirecting to experiments list…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">API Request Builder</h2>
        <p className="text-sm text-slate-500 mt-0.5">Define your API experiment — endpoint, variants, scoring rules</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-1">
            <button
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                step === s.n ? 'bg-blue-600 text-white'
                : step > s.n ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === s.n ? 'bg-white/20' : step > s.n ? 'bg-emerald-500/30' : 'bg-white/10'
              }`}>{s.n}</span>
              {s.label}
            </button>
            {i < steps.length - 1 && <div className="w-4 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      {/* Experiment name + mode (always visible) */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Experiment Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Payment Gateway Comparison"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what you're testing"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Execution Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { v: 'ab', label: 'A/B Test', desc: '1 request → 1 variant' },
                { v: 'champion_challenger', label: 'C/C', desc: 'All variants execute' },
                { v: 'shadow', label: 'Shadow', desc: 'Primary + silent copy' },
              ] as { v: ExecutionMode; label: string; desc: string }[]).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setExecutionMode(opt.v)}
                  className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                    executionMode === opt.v
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Environment</label>
            <div className="flex gap-2">
              {(['dev', 'staging', 'prod'] as Environment[]).map((env) => (
                <button
                  key={env}
                  onClick={() => setEnvironment(env)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                    environment === env
                      ? env === 'prod' ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : env === 'staging' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-slate-500/20 border-slate-500/40 text-slate-400'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Request definition */}
      {step === 1 && (
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Request Definition</h3>

          {/* Method + URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">HTTP Method & Endpoint</label>
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-blue-500/50"
              >
                {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
              />
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/v1/endpoint"
                className="w-40 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
              />
            </div>
          </div>

          {/* Query params */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400">Query Parameters</label>
              <button
                onClick={() => setQueryParams((p) => [...p, { key: '', value: '' }])}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {queryParams.length === 0 && (
              <div className="text-xs text-slate-600 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                No query parameters. Click Add to include one. Use {'{{variable}}'} for dynamic values.
              </div>
            )}
            {queryParams.map((qp, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={qp.key}
                  onChange={(e) => setQueryParams((p) => p.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                  placeholder="key"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 font-mono"
                />
                <input
                  type="text"
                  value={qp.value}
                  onChange={(e) => setQueryParams((p) => p.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                  placeholder="value or {{variable}}"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 font-mono"
                />
                <button onClick={() => setQueryParams((p) => p.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Body */}
          {method !== 'GET' && method !== 'DELETE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Request Body (JSON Template)</label>
              <textarea
                value={bodyTemplate}
                onChange={(e) => setBodyTemplate(e.target.value)}
                placeholder={'{\n  "user_id": "{{user_id}}",\n  "context": "homepage"\n}'}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono resize-y"
              />
              <p className="text-[10px] text-slate-600 mt-1">
                Use {'{{variable_name}}'} for dynamic values that will be substituted at execution time
              </p>
            </div>
          )}

          {/* Timeout + retries */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Timeout (ms)</label>
              <input
                type="number"
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
                min={100}
                max={60000}
                step={100}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Max Retries</label>
              <input
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                min={0}
                max={5}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Auth & Headers */}
      {step === 2 && (
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Authorization & Headers</h3>

          {/* Auth type */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Authorization Type</label>
            <div className="grid grid-cols-5 gap-2">
              {(['none', 'bearer', 'api_key', 'oauth2', 'mtls'] as AuthType[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAuthType(a)}
                  className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                    authType === a
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {a === 'none' ? 'None' : a === 'bearer' ? 'Bearer' : a === 'api_key' ? 'API Key' : a === 'oauth2' ? 'OAuth2' : 'mTLS'}
                </button>
              ))}
            </div>
          </div>

          {authType !== 'none' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {authType === 'bearer' ? 'Bearer Token' : authType === 'api_key' ? 'API Key Value' : 'Auth Value'}
              </label>
              <input
                type="password"
                value={authValue}
                onChange={(e) => setAuthValue(e.target.value)}
                placeholder={authType === 'bearer' ? 'eyJhbGciOiJSUzI1NiJ9...' : 'sk-...'}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 font-mono"
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <Shield className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] text-slate-600">Stored encrypted. Use environment variable references for production.</span>
              </div>
            </div>
          )}

          {/* Static headers */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400">Request Headers</label>
              <button
                onClick={() => setHeaders((h) => [...h, { key: '', value: '' }])}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add header
              </button>
            </div>
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={h.key}
                  onChange={(e) => setHeaders((hs) => hs.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                  placeholder="Header-Name"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 font-mono"
                />
                <input
                  type="text"
                  value={h.value}
                  onChange={(e) => setHeaders((hs) => hs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                  placeholder="value or {{variable}}"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 font-mono"
                />
                <button
                  onClick={() => setHeaders((hs) => hs.filter((_, j) => j !== i))}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Variants */}
      {step === 3 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">API Variants</h3>
            <button
              onClick={addVariant}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add variant
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Each variant represents a different API service, model, or configuration to compare.
            Traffic will be split according to variant weights.
          </p>
          {variants.map((v, i) => (
            <div key={v.id} className="bg-[#0D1117] border border-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[11px] font-bold text-blue-400">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-sm font-semibold text-slate-200">{v.name}</span>
                </div>
                {variants.length > 2 && (
                  <button
                    onClick={() => removeVariant(v.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Variant Name</label>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Variant Type</label>
                  <select
                    value={v.type}
                    onChange={(e) => updateVariant(v.id, 'type', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500/50"
                  >
                    <option value="service_routing">Service Routing</option>
                    <option value="model">ML Model</option>
                    <option value="feature_flag">Feature Flag</option>
                    <option value="config">Config Override</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Target URL</label>
                  <input
                    type="text"
                    value={v.target_url}
                    onChange={(e) => updateVariant(v.id, 'target_url', e.target.value)}
                    placeholder="https://service-v2.internal/endpoint"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={v.description}
                    onChange={(e) => updateVariant(v.id, 'description', e.target.value)}
                    placeholder="Brief description"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Traffic Weight: {v.weight}%
                  </label>
                  <input
                    type="range"
                    value={v.weight}
                    onChange={(e) => updateVariant(v.id, 'weight', Number(e.target.value))}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 4: Scoring Rules */}
      {step === 4 && (
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Scoring Engine Configuration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Define how the winner is determined. Weights must sum to 1.0.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Latency Weight', value: scoringLatency, set: setScoringLatency, desc: 'Lower latency = higher score' },
              { label: 'Error Rate Weight', value: scoringError, set: setScoringError, desc: 'Zero errors = mandatory priority' },
              { label: 'Business Metric Weight', value: scoringBusiness, set: setScoringBusiness, desc: 'Extracted from response JSON' },
            ].map((rule) => (
              <div key={rule.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">{rule.label}</span>
                    <span className="text-xs text-slate-600 ml-2">({rule.desc})</span>
                  </div>
                  <span className="text-sm font-bold text-blue-400">{rule.value.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  value={rule.value}
                  onChange={(e) => rule.set(Number(e.target.value))}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full accent-blue-500"
                />
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-xs font-semibold text-slate-400">Business Metric JSON Path</label>
              <Info className="w-3 h-3 text-slate-600" />
            </div>
            <input
              type="text"
              value={businessMetricPath}
              onChange={(e) => setBusinessMetricPath(e.target.value)}
              placeholder="e.g. data.conversion_rate or prediction.confidence"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 font-mono"
            />
            <p className="text-[10px] text-slate-600 mt-1">
              JSON path to a numeric value in the response body used as the business metric
            </p>
          </div>

          {/* Summary */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-blue-400 mb-3">Scoring Summary</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Latency', value: `${(scoringLatency * 100).toFixed(0)}%` },
                { label: 'Error Rate', value: `${(scoringError * 100).toFixed(0)}%` },
                { label: 'Business', value: `${(scoringBusiness * 100).toFixed(0)}%` },
              ].map((item) => (
                <div key={item.label} className="text-center bg-white/5 rounded-lg p-3">
                  <div className="text-lg font-bold text-slate-100">{item.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
            <div className={`mt-3 text-center text-xs font-medium ${
              Math.abs(scoringLatency + scoringError + scoringBusiness - 1.0) < 0.01
                ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {Math.abs(scoringLatency + scoringError + scoringBusiness - 1.0) < 0.01
                ? '✓ Weights sum to 1.0'
                : `⚠ Weights sum to ${(scoringLatency + scoringError + scoringBusiness).toFixed(2)} (should be 1.0)`
              }
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        <div className="flex items-center gap-3">
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!name}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FlaskConical className="w-4 h-4" />
              Create Experiment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
