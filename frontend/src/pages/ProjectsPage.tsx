import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectsApi, type Project } from '../lib/api'

const statusStyle: Record<string, { color: string; bg: string }> = {
    active: { color: '#14F195', bg: 'rgba(20,241,149,0.1)' },
    paused: { color: '#f0a500', bg: 'rgba(240,165,0,0.1)' },
    done:   { color: '#9945FF', bg: 'rgba(153,69,255,0.1)' },
}

type ModalState =
    | { mode: 'closed' }
    | { mode: 'create' }
    | { mode: 'edit'; project: Project }

const emptyForm = { name: '', description: '', status: 'active' as Project['status'] }

export default function ProjectsPage() {
    const { user, logout } = useAuth()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const load = () => projectsApi.list().then(setProjects).finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    function openCreate() {
        setForm(emptyForm)
        setError('')
        setModal({ mode: 'create' })
    }

    function openEdit(project: Project) {
        setForm({ name: project.name, description: project.description ?? '', status: project.status })
        setError('')
        setModal({ mode: 'edit', project })
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
            if (modal.mode === 'create') {
                const created = await projectsApi.create(form)
                setProjects(prev => [created, ...prev])
            } else if (modal.mode === 'edit') {
                const updated = await projectsApi.update(modal.project.id, form)
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
            }
            setModal({ mode: 'closed' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: number) {
        try {
            await projectsApi.remove(id)
            setProjects(prev => prev.filter(p => p.id !== id))
        } catch {
            // silent
        } finally {
            setDeleteId(null)
        }
    }

    const inputStyle = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(153,69,255,0.25)',
    }

    return (
        <div className="min-h-screen text-white">
            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b"
                style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(153,69,255,0.15)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="text-2xl font-bold gradient-text">Vulcan</Link>
                        <div className="hidden md:flex items-center gap-1">
                            <Link to="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-[#888] hover:text-white transition-all">Dashboard</Link>
                            <Link to="/projects" className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{ color: '#9945FF', background: 'rgba(153,69,255,0.1)' }}>Projects</Link>
                            <Link to="/tasks" className="px-4 py-2 rounded-lg text-sm font-medium text-[#888] hover:text-white transition-all">Tasks</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="text-sm px-4 py-2 rounded-lg border transition-all font-medium"
                                style={{ color: '#9945FF', borderColor: 'rgba(153,69,255,0.4)', background: 'rgba(153,69,255,0.08)' }}>
                                Admin
                            </Link>
                        )}
                        <button onClick={logout}
                            className="text-sm px-4 py-2 rounded-lg text-[#888] hover:text-white transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            Log out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
                        <p className="text-[#555] text-sm">Manage your projects and teams</p>
                    </div>
                    <button onClick={openCreate}
                        className="glow-btn px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
                        style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                        + New Project
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1,2,3].map(i => <div key={i} className="sol-card rounded-2xl h-48 animate-pulse" />)}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-24 sol-card rounded-2xl">
                        <p className="text-[#444] mb-4">No projects yet.</p>
                        <button onClick={openCreate}
                            className="glow-btn px-5 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                            Create your first project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projects.map(project => {
                            const s = statusStyle[project.status] ?? statusStyle.active
                            return (
                                <div key={project.id}
                                    className="sol-card rounded-2xl p-6 transition-all hover:scale-[1.02]"
                                    style={{ boxShadow: '0 0 30px rgba(153,69,255,0.06)' }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                                            style={{ background: 'linear-gradient(135deg, #9945FF22, #14F19522)', border: '1px solid rgba(153,69,255,0.3)' }}>
                                            <span className="gradient-text">{project.name[0]}</span>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: s.color, background: s.bg }}>
                                            {project.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
                                    <p className="text-[#555] text-sm mb-5 line-clamp-2">{project.description || 'No description'}</p>

                                    <div className="flex gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div>
                                            <div className="text-lg font-bold text-white">{project.tasks_count}</div>
                                            <div className="text-xs text-[#555]">Tasks</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link to={`/tasks?project_id=${project.id}`}
                                            className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-[#888] hover:text-white transition-all"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            View Tasks
                                        </Link>
                                        <button onClick={() => openEdit(project)}
                                            className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all glow-btn"
                                            style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                                            Edit
                                        </button>
                                        <button onClick={() => setDeleteId(project.id)}
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
            </main>

            {/* Create/Edit Modal */}
            {modal.mode !== 'closed' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setModal({ mode: 'closed' })}>
                    <div className="sol-card rounded-2xl p-8 w-full max-w-md"
                        style={{ boxShadow: '0 0 60px rgba(153,69,255,0.2)' }}
                        onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-6">
                            {modal.mode === 'create' ? 'New Project' : 'Edit Project'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[#aaa] mb-2">Name</label>
                                <input style={inputStyle}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                                    required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#aaa] mb-2">Description</label>
                                <textarea style={inputStyle}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all resize-none"
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#aaa] mb-2">Status</label>
                                <select style={inputStyle}
                                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                                    value={form.status}
                                    onChange={e => setForm(p => ({ ...p, status: e.target.value as Project['status'] }))}>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModal({ mode: 'closed' })}
                                    className="flex-1 py-3 rounded-xl text-sm text-[#888] hover:text-white transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 glow-btn py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                                    style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                                    {saving ? 'Saving…' : modal.mode === 'create' ? 'Create' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setDeleteId(null)}>
                    <div className="sol-card rounded-2xl p-8 w-full max-w-sm text-center"
                        style={{ boxShadow: '0 0 60px rgba(255,107,107,0.15)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="text-4xl mb-4">⚠</div>
                        <h2 className="text-lg font-bold mb-2">Delete Project?</h2>
                        <p className="text-[#666] text-sm mb-6">This will also delete all tasks in this project. This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)}
                                className="flex-1 py-3 rounded-xl text-sm text-[#888] hover:text-white transition-all"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteId)}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                                style={{ background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)' }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
