import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileApi } from '../lib/api'

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects',  label: 'Projects' },
  { to: '/tasks',     label: 'Tasks' },
  { to: '/kanban',    label: 'Kanban' },
]

const IS = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(153,69,255,0.25)' }

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, setUser } = useAuth()
  const { pathname } = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', current_password: '', password: '', password_confirmation: '' })
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileOk, setProfileOk] = useState('')

  async function handleProfile(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setProfileError(''); setProfileOk('')
    try {
      const payload: Record<string, string> = {}
      if (form.name !== user?.name) payload.name = form.name
      if (form.email !== user?.email) payload.email = form.email
      if (form.password) {
        payload.current_password = form.current_password
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
      }
      const updated = await profileApi.update(payload)
      setUser(updated)
      setProfileOk('Profile updated successfully.')
      setForm(p => ({ ...p, current_password: '', password: '', password_confirmation: '' }))
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen text-white">
      <nav className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(153,69,255,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="text-2xl font-bold gradient-text">Vulcan</Link>
            <div className="hidden md:flex items-center gap-1">
              {NAV.map(({ to, label }) => (
                <Link key={to} to={to}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={pathname.startsWith(to)
                    ? { color: '#9945FF', background: 'rgba(153,69,255,0.1)' }
                    : { color: '#888' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm px-3 py-1.5 rounded-lg border font-medium transition-all"
                style={{ color: '#9945FF', borderColor: 'rgba(153,69,255,0.4)', background: 'rgba(153,69,255,0.08)' }}>
                Admin
              </Link>
            )}
            <button onClick={() => { setForm({ name: user?.name ?? '', email: user?.email ?? '', current_password: '', password: '', password_confirmation: '' }); setProfileError(''); setProfileOk(''); setProfileOpen(true) }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-[#ccc]">{user?.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: '#14F195', background: 'rgba(20,241,149,0.1)' }}>
                {user?.role}
              </span>
            </button>
            <button onClick={logout}
              className="text-sm px-3 py-1.5 rounded-lg text-[#888] hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Profile modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setProfileOpen(false)}>
          <div className="sol-card rounded-2xl p-8 w-full max-w-md"
            style={{ boxShadow: '0 0 60px rgba(153,69,255,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleProfile} className="space-y-4">
              {profileError && <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">{profileError}</div>}
              {profileOk    && <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ color: '#14F195', background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.3)' }}>{profileOk}</div>}

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Name</label>
                <input style={IS} className="w-full px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Email</label>
                <input type="email" style={IS} className="w-full px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>

              <div className="pt-2 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-[#555] mb-3">Leave password fields blank to keep current password</p>
                <div className="space-y-3">
                  <input type="password" placeholder="Current password" style={IS}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm placeholder-[#444] focus:outline-none"
                    value={form.current_password} onChange={e => setForm(p => ({ ...p, current_password: e.target.value }))} />
                  <input type="password" placeholder="New password" style={IS}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm placeholder-[#444] focus:outline-none"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                  <input type="password" placeholder="Confirm new password" style={IS}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm placeholder-[#444] focus:outline-none"
                    value={form.password_confirmation} onChange={e => setForm(p => ({ ...p, password_confirmation: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setProfileOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-[#888] hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 glow-btn py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
