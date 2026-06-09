import { UserCog, Plus, Search, Shield, ChevronDown } from 'lucide-react'

const USERS = [
  { name: 'Kai Patel', email: 'kai@xtest.io', role: 'Admin', team: 'Platform Eng', status: 'active', avatar: 'KP' },
  { name: 'Ana Silva', email: 'ana@xtest.io', role: 'Experimenter', team: 'Team Falcon', status: 'active', avatar: 'AS' },
  { name: 'Dev Kumar', email: 'dev@xtest.io', role: 'Experimenter', team: 'Team Falcon', status: 'active', avatar: 'DK' },
  { name: 'Maria Lopez', email: 'maria@xtest.io', role: 'Viewer', team: 'Team Storm', status: 'active', avatar: 'ML' },
  { name: 'Sam Chen', email: 'sam@xtest.io', role: 'Experimenter', team: 'Team Storm', status: 'inactive', avatar: 'SC' },
  { name: 'Blake Rivers', email: 'blake@xtest.io', role: 'Viewer', team: 'Team Nova', status: 'active', avatar: 'BR' },
]

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-purple-50 text-purple-700',
  Experimenter: 'bg-blue-50 text-blue-700',
  Viewer: 'bg-gray-100 text-gray-600',
}

export default function UsersPage() {
  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Users & Roles</h2>
          <p className="text-sm text-gray-400 mt-0.5">{USERS.length} users · 1 admin</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Invite User</button>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { role: 'Admin', desc: 'Full platform access', count: 1, color: '#7C3AED', bg: '#F5F3FF' },
          { role: 'Experimenter', desc: 'Create & manage experiments', count: 3, color: '#2563EB', bg: '#EFF6FF' },
          { role: 'Viewer', desc: 'Read-only access', count: 2, color: '#64748B', bg: '#F8FAFC' },
        ].map(r => (
          <div key={r.role} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4" style={{ color: r.color }} />
              <span className="text-sm font-bold text-gray-900">{r.role}</span>
              <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: r.bg, color: r.color }}>{r.count}</span>
            </div>
            <p className="text-xs text-gray-400">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="input pl-9" placeholder="Search users…" />
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Team</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.email}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
                      {u.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                </td>
                <td><span className="text-xs text-gray-600">{u.team}</span></td>
                <td>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium
                    ${u.status === 'active' ? 'text-green-700' : 'text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {u.status}
                  </span>
                </td>
                <td className="text-right">
                  <button className="text-xs text-gray-400 hover:text-blue-600 px-2 py-1 rounded transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
