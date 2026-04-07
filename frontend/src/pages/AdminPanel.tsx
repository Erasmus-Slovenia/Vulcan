import { useState, useEffect, type FormEvent } from 'react'
import { usersApi, type User } from '../lib/api'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const IS = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(153,69,255,0.25)' }

const EMPTY = { name: '', email: '', password: '', password_confirmation: '', role: 'user' }

export default function AdminPanel() {
  const { user } = useAuth()
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />

  useEffect(() => { usersApi.list().then(setUsers).finally(() => setLoading(false)) }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    if (form.password !== form.password_confirmation) { setError('Passwords do not match'); setSaving(false); return }
    try {
      const u = await usersApi.create(form as Parameters<typeof usersApi.create>[0])
      setUsers(prev => [...prev, u])
      setForm(EMPTY)
      setSuccess(`User "${u.name}" created successfully.`)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    await usersApi.remove(id)
    setUsers(prev => prev.filter(u => u.id !== id))
    setDeleteId(null)
  }

  const roleColor = (role: string) =>
    role === 'admin'
      ? { color: '#9945FF', bg: 'rgba(153,69,255,0.1)' }
      : { color: '#14F195', bg: 'rgba(20,241,149,0.1)' }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
          <p className="text-[#555] text-sm">Manage workspace users</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create user form */}
          <div className="sol-card rounded-2xl p-6" style={{ boxShadow: '0 0 40px rgba(153,69,255,0.1)' }}>
            <h2 className="text-lg font-semibold mb-5">Create User</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              {error   && <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
              {success && <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ color: '#14F195', background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.3)' }}>{success}</div>}

              {(['name','email'] as const).map(f => (
                <div key={f}>
                  <label className="block text-xs font-medium text-[#888] mb-1.5 capitalize">{f}</label>
                  <input type={f === 'email' ? 'email' : 'text'} style={IS}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                    value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                    onFocus={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.7)')}
                    onBlur={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.25)')}
                    required />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Password</label>
                <input type="password" style={IS}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  onFocus={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.25)')}
                  required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Confirm Password</label>
                <input type="password" style={IS}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  value={form.password_confirmation} onChange={e => setForm(p => ({ ...p, password_confirmation: e.target.value }))}
                  onFocus={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.25)')}
                  required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Role</label>
                <select style={IS} className="w-full px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button type="submit" disabled={saving}
                className="glow-btn w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 mt-2"
                style={{ background: 'linear-gradient(90deg,#9945FF,#14F195)' }}>
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </form>
          </div>

          {/* User list */}
          <div className="sol-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-5">All Users ({users.length})</h2>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg,#9945FF,#14F195)' }}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{u.name}</div>
                        <div className="text-xs text-[#555]">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={roleColor(u.role)}>
                        {u.role}
                      </span>
                      {u.id !== user?.id && (
                        <button onClick={() => setDeleteId(u.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-all">✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setDeleteId(null)}>
          <div className="sol-card rounded-2xl p-8 w-full max-w-sm text-center"
            style={{ boxShadow: '0 0 60px rgba(255,107,107,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">⚠</div>
            <h2 className="text-lg font-bold mb-2">Delete User?</h2>
            <p className="text-[#666] text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl text-sm text-[#888]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
