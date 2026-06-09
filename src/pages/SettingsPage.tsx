import React from 'react'
import { Settings, Info, BookOpen, ExternalLink } from 'lucide-react'

const SettingsPage: React.FC = () => {
  const backendUrl = '/api'

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings size={32} />
            Settings
          </h1>
          <p className="text-slate-400">Configure XTest API Lab 2.0</p>
        </div>

        {/* Backend URL Section */}
        <div className="mb-8 p-6 bg-[#0D1117] border border-white/8 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Backend Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">API Base URL</label>
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-slate-100 font-mono text-sm">
                {backendUrl}
              </div>
              <p className="text-xs text-slate-500 mt-2">This is where XTest API Lab communicates with your backend services</p>
            </div>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="mb-8 p-6 bg-[#0D1117] border border-white/8 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <Info className="text-blue-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Dual-Mode Architecture</h2>
              <p className="text-slate-400">XTest API Lab 2.0 supports two powerful experimentation modes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* A/B Mode */}
            <div className="p-4 bg-white/5 rounded-lg border border-blue-500/20">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">A/B Experiments</h3>
              <p className="text-sm text-slate-400 mb-4">
                Traffic-split experimentation mode for testing multiple API implementations simultaneously
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Route incoming requests to different variants by weight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Compare metrics like latency, error rate, and request distribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Supports up to 5 variants per experiment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Real-time session execution and analytics</span>
                </li>
              </ul>

              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Key Features:</h4>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>• Weighted variant distribution</div>
                  <div>• Per-variant latency percentiles (P50, P95, P99)</div>
                  <div>• Success rate tracking</div>
                  <div>• Header and URL overrides per variant</div>
                </div>
              </div>
            </div>

            {/* CC Mode */}
            <div className="p-4 bg-white/5 rounded-lg border border-teal-500/20">
              <h3 className="text-lg font-semibold text-teal-400 mb-3">Champion vs Challenger</h3>
              <p className="text-sm text-slate-400 mb-4">
                Side-by-side comparison mode for evaluating champion and challenger implementations
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Execute parallel requests to champion and challenger</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Automatic winner determination based on scoring rules</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Configurable scoring weights (latency, error rate, business metrics)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 mt-1">•</span>
                  <span>Compare response bodies side-by-side</span>
                </li>
              </ul>

              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Key Features:</h4>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>• Latency, error rate, and business metric scoring</div>
                  <div>• Win rate analytics and trend charts</div>
                  <div>• Full response comparison</div>
                  <div>• Configurable success criteria</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="p-6 bg-[#0D1117] border border-white/8 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-amber-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Documentation & Resources</h2>
          </div>

          <div className="space-y-3">
            <a
              href="#"
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors"
            >
              <span className="text-slate-300">Getting Started Guide</span>
              <ExternalLink size={18} className="text-slate-500" />
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors"
            >
              <span className="text-slate-300">API Reference</span>
              <ExternalLink size={18} className="text-slate-500" />
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors"
            >
              <span className="text-slate-300">Best Practices</span>
              <ExternalLink size={18} className="text-slate-500" />
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors"
            >
              <span className="text-slate-300">Troubleshooting</span>
              <ExternalLink size={18} className="text-slate-500" />
            </a>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Tips</h2>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">→</span>
              <span>Start with A/B mode to test multiple variants simultaneously with traffic splitting</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">→</span>
              <span>Use CC mode when you want to compare two specific implementations in detail</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">→</span>
              <span>Monitor analytics to identify performance trends and regressions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">→</span>
              <span>Use the Cockpit view for real-time execution and instant feedback</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
