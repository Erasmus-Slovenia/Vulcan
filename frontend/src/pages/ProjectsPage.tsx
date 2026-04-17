import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi, type Project } from '../lib/api'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

type Modal = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; project: Project }
const EMPTY = { name: '', description: '', status: 'active' as Project['status'] }
const IS = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(153,69,255,0.25)' }

const SC: Record<string, { color: string; bg: string }> = {
  active:   { color: '#14F195', bg: 'rgba(20,241,149,0.1)' },
  archived: { color: '#9945FF', bg: 'rgba(153,69,255,0.1)' },
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<Modal>({ mode: 'closed' })
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => { projectsApi.list().then(setProjects).finally(() => setLoading(false)) }, [])

  function openCreate() { setForm(EMPTY); setError(''); setModal({ mode: 'create' }) }
  function openEdit(p: Project) { setForm({ name: p.name, description: p.description ?? '', status: p.status }); setError(''); setModal({ mode: 'edit', project: p }) }

  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (modal.mode === 'create') {
        const p = await projectsApi.create(form)
        setProjects(prev => [p, ...prev])
      } else if (modal.mode === 'edit') {
        const p = await projectsApi.update(modal.project.id, form)
        setProjects(prev => prev.map(x => x.id === p.id ? p : x))
      }
      setModal({ mode: 'closed' })
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    setDeleteError('')
    try {
      await projectsApi.remove(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      setDeleteId(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Projects</h1>
            <p className="text-[#555] text-sm">Manage your projects</p>
          </div>
          {isAdmin && (
            <button onClick={openCreate}
              className="glow-btn px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(90deg,#9945FF,#14F195)' }}>
              + New Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="sol-card rounded-2xl h-52 animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 sol-card rounded-2xl">
            <p className="text-[#444] mb-4">No projects yet.</p>
            {isAdmin && (
              <button onClick={openCreate} className="glow-btn px-5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(90deg,#9945FF,#14F195)' }}>
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(p => {
              const s = SC[p.status] ?? SC.active
              return (
                <div key={p.id} className="sol-card rounded-2xl p-6 transition-all hover:scale-[1.02]"
                  style={{ boxShadow: '0 0 30px rgba(153,69,255,0.06)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg,#9945FF22,#14F19522)', border: '1px solid rgba(153,69,255,0.3)' }}>
                      <span className="gradient-text">{p.name[0]}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: s.color, background: s.bg }}>
                      {p.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                  <p className="text-[#555] text-sm mb-5 line-clamp-2">{p.description || 'No description'}</p>
                  <div className="flex gap-4 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div><div className="text-lg font-bold">{p.tasks_count}</div><div className="text-xs text-[#555]">Tasks</div></div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/projects/${p.id}`}
                      className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-[#888] hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      View
                    </Link>
                    <button onClick={() => openEdit(p)}
                      className="flex-1 glow-btn py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(90deg,#9945FF,#14F195)' }}>
                      Edit
                    </button>
                    <button onClick={() => { setDeleteId(p.id); setDeleteError('') }}
                      className="px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 transition-all"
                      style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {modal.mode !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="sol-card rounded-2xl p-8 w-full max-w-md"
            style={{ boxShadow: '0 0 60px rgba(153,69,255,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">{modal.mode === 'create' ? 'New Project' : 'Edit Project'}</h2>
            <form onSubmit={submit} className="space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Name</label>
                <input style={IS} className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  onFocus={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.25)')}
                  required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Description</label>
                <textarea style={IS} rows={3} className="w-full px-4 py-3 rounded-xl text-white focus:outline-none resize-none"
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  onFocus={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.25)')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Status</label>
                <select style={IS} className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                  value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Project['status'] }))}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal({ mode: 'closed' })}
                  className="flex-1 py-3 rounded-xl text-sm text-[#888] hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 glow-btn py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg,#9945FF,#14F195)' }}>
                  {saving ? 'Saving…' : modal.mode === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setDeleteId(null)}>
          <div className="sol-card rounded-2xl p-8 w-full max-w-sm text-center"
            style={{ boxShadow: '0 0 60px rgba(255,107,107,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">⚠</div>
            <h2 className="text-lg font-bold mb-2">Delete Project?</h2>
            {deleteError
              ? <p className="text-red-400 text-sm mb-6">{deleteError}</p>
              : <p className="text-[#666] text-sm mb-6">Projects with active tasks cannot be deleted. This cannot be undone.</p>
            }
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl text-sm text-[#888] hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              {!deleteError && (
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)' }}>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
