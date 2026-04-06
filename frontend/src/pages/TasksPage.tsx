import { useState, useEffect, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectsApi, tasksApi, commentsApi, type Project, type Task, type Comment } from '../lib/api'

const priorityStyle: Record<string, { color: string; bg: string }> = {
    high:   { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
    medium: { color: '#f0a500', bg: 'rgba(240,165,0,0.10)' },
    low:    { color: '#14F195', bg: 'rgba(20,241,149,0.10)' },
}
const statusStyle: Record<string, { color: string; bg: string }> = {
    todo:        { color: '#00C2FF', bg: 'rgba(0,194,255,0.1)' },
    in_progress: { color: '#f0a500', bg: 'rgba(240,165,0,0.1)' },
    done:        { color: '#14F195', bg: 'rgba(20,241,149,0.1)' },
}
const statusLabel: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }

const emptyTaskForm = { title: '', description: '', status: 'todo' as Task['status'], priority: 'medium' as Task['priority'], due_date: '', project_id: 0 }

type TaskModal = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; task: Task }
type DetailModal = { open: false } | { open: true; task: Task }

export default function TasksPage() {
    const { user, logout } = useAuth()
    const [searchParams] = useSearchParams()

    const [tasks, setTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        project_id: searchParams.get('project_id') ? Number(searchParams.get('project_id')) : 0,
        status: '',
        priority: '',
    })

    // Task create/edit modal
    const [modal, setModal] = useState<TaskModal>({ mode: 'closed' })
    const [form, setForm] = useState(emptyTaskForm)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')

    // Task detail/comments modal
    const [detail, setDetail] = useState<DetailModal>({ open: false })
    const [comments, setComments] = useState<Comment[]>([])
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [postingComment, setPostingComment] = useState(false)

    // Delete
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const load = () => {
        const params: Record<string, string | number> = {}
        if (filters.project_id) params.project_id = filters.project_id
        if (filters.status) params.status = filters.status
        if (filters.priority) params.priority = filters.priority
        return tasksApi.list(params as Parameters<typeof tasksApi.list>[0]).then(setTasks)
    }

    useEffect(() => {
        Promise.all([load(), projectsApi.list().then(setProjects)]).finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        load()
    }, [filters])

    function openCreate() {
        setForm({ ...emptyTaskForm, project_id: filters.project_id || (projects[0]?.id ?? 0) })
        setFormError('')
        setModal({ mode: 'create' })
    }

    function openEdit(task: Task) {
        setForm({
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            due_date: task.due_date ?? '',
            project_id: task.project_id,
        })
        setFormError('')
        setModal({ mode: 'edit', task })
    }

    async function openDetail(task: Task) {
        setDetail({ open: true, task })
        setComments([])
        setCommentsLoading(true)
        try {
            const c = await commentsApi.list(task.id)
            setComments(c)
        } finally {
            setCommentsLoading(false)
        }
    }

    async function handleTaskSubmit(e: FormEvent) {
        e.preventDefault()
        setSaving(true)
        setFormError('')
        try {
            if (modal.mode === 'create') {
                const created = await tasksApi.create(form)
                setTasks(prev => [created, ...prev])
            } else if (modal.mode === 'edit') {
                const updated = await tasksApi.update(modal.task.id, form)
                setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
                if (detail.open && detail.task.id === modal.task.id) {
                    setDetail({ open: true, task: updated })
                }
            }
            setModal({ mode: 'closed' })
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: number) {
        try {
            await tasksApi.remove(id)
            setTasks(prev => prev.filter(t => t.id !== id))
            if (detail.open && detail.task.id === id) setDetail({ open: false })
        } finally {
            setDeleteId(null)
        }
    }

    async function handlePostComment(e: FormEvent) {
        e.preventDefault()
        if (!detail.open || !newComment.trim()) return
        setPostingComment(true)
        try {
            const c = await commentsApi.create(detail.task.id, newComment.trim())
            setComments(prev => [c, ...prev])
            setNewComment('')
        } finally {
            setPostingComment(false)
        }
    }

    async function handleDeleteComment(commentId: number) {
        await commentsApi.remove(commentId)
        setComments(prev => prev.filter(c => c.id !== commentId))
    }

    const inputStyle = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(153,69,255,0.25)',
    }
    const selectStyle = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
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
                            <Link to="/projects" className="px-4 py-2 rounded-lg text-sm font-medium text-[#888] hover:text-white transition-all">Projects</Link>
                            <Link to="/tasks" className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{ color: '#9945FF', background: 'rgba(153,69,255,0.1)' }}>Tasks</Link>
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

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm mb-3">
                            <Link to="/dashboard" className="text-[#555] hover:text-[#888] transition-all">Dashboard</Link>
                            <span className="text-[#333]">/</span>
                            <span className="text-[#aaa] font-medium">Tasks</span>
                        </div>
                        <h1 className="text-3xl font-bold">Tasks</h1>
                    </div>
                    <button onClick={openCreate} disabled={projects.length === 0}
                        className="glow-btn px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}
                        title={projects.length === 0 ? 'Create a project first' : ''}>
                        + New Task
                    </button>
                </div>

                {/* Filters */}
                <div className="sol-card rounded-2xl p-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        <select style={selectStyle}
                            className="px-3 py-2.5 rounded-xl text-[#aaa] text-sm focus:outline-none"
                            value={filters.project_id}
                            onChange={e => setFilters(p => ({ ...p, project_id: Number(e.target.value) }))}>
                            <option value={0}>All projects</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select style={selectStyle}
                            className="px-3 py-2.5 rounded-xl text-[#aaa] text-sm focus:outline-none"
                            value={filters.status}
                            onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
                            <option value="">All statuses</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                        <select style={selectStyle}
                            className="px-3 py-2.5 rounded-xl text-[#aaa] text-sm focus:outline-none"
                            value={filters.priority}
                            onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}>
                            <option value="">All priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        <div className="hidden lg:block" />
                        <button onClick={() => setFilters({ project_id: 0, status: '', priority: '' })}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#666] hover:text-white transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="sol-card rounded-2xl overflow-hidden" style={{ boxShadow: '0 0 40px rgba(153,69,255,0.06)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(153,69,255,0.15)', background: 'rgba(153,69,255,0.04)' }}>
                                    {['Task', 'Project', 'Priority', 'Status', 'Due Date', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-4 text-left font-semibold text-[#555] text-xs uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [1,2,3].map(i => (
                                        <tr key={i}>
                                            {[1,2,3,4,5,6].map(j => (
                                                <td key={j} className="px-5 py-4">
                                                    <div className="h-4 rounded bg-white/5 animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center text-[#444]">
                                            No tasks found.{' '}
                                            {projects.length > 0 && (
                                                <button onClick={openCreate} className="underline" style={{ color: '#9945FF' }}>
                                                    Create one
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task, i) => {
                                        const p = priorityStyle[task.priority]
                                        const s = statusStyle[task.status]
                                        const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
                                        return (
                                            <tr key={task.id}
                                                className="transition-all hover:bg-white/[0.02]"
                                                style={{ borderBottom: i < tasks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                                                <td className="px-5 py-4">
                                                    <button onClick={() => openDetail(task)}
                                                        className="font-medium text-white hover:opacity-80 text-left transition-all">
                                                        {task.title}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4 text-[#666]">{task.project.name}</td>
                                                <td className="px-5 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                                                        style={{ color: p?.color, background: p?.bg }}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                                                        style={{ color: s?.color, background: s?.bg }}>
                                                        {statusLabel[task.status]}
                                                    </span>
                                                </td>
                                                <td className={`px-5 py-4 text-xs ${overdue ? 'text-red-400' : 'text-[#555]'}`}>
                                                    {task.due_date ?? '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex gap-3">
                                                        <button onClick={() => openEdit(task)}
                                                            className="text-xs font-medium transition-all hover:opacity-80"
                                                            style={{ color: '#9945FF' }}>Edit</button>
                                                        <button onClick={() => setDeleteId(task.id)}
                                                            className="text-xs font-medium text-red-400 hover:text-red-300 transition-all">Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Create / Edit Task Modal */}
            {modal.mode !== 'closed' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setModal({ mode: 'closed' })}>
                    <div className="sol-card rounded-2xl p-8 w-full max-w-lg"
                        style={{ boxShadow: '0 0 60px rgba(153,69,255,0.2)' }}
                        onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-6">
                            {modal.mode === 'create' ? 'New Task' : 'Edit Task'}
                        </h2>

                        <form onSubmit={handleTaskSubmit} className="space-y-4">
                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[#aaa] mb-2">Title</label>
                                <input style={inputStyle}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                                    required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#aaa] mb-2">Description</label>
                                <textarea style={inputStyle}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none resize-none"
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#aaa] mb-2">Project</label>
                                    <select style={inputStyle}
                                        className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                                        value={form.project_id}
                                        onChange={e => setForm(p => ({ ...p, project_id: Number(e.target.value) }))}
                                        required>
                                        <option value={0} disabled>Pick project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#aaa] mb-2">Status</label>
                                    <select style={inputStyle}
                                        className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                                        value={form.status}
                                        onChange={e => setForm(p => ({ ...p, status: e.target.value as Task['status'] }))}>
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#aaa] mb-2">Priority</label>
                                    <select style={inputStyle}
                                        className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                                        value={form.priority}
                                        onChange={e => setForm(p => ({ ...p, priority: e.target.value as Task['priority'] }))}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#aaa] mb-2">Due Date</label>
                                    <input type="date" style={inputStyle}
                                        className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                                        value={form.due_date}
                                        onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
                                </div>
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

            {/* Task Detail + Comments Modal */}
            {detail.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setDetail({ open: false })}>
                    <div className="sol-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                        style={{ boxShadow: '0 0 60px rgba(153,69,255,0.15)' }}
                        onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold mb-2">{detail.task.title}</h2>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                            style={{ color: priorityStyle[detail.task.priority]?.color, background: priorityStyle[detail.task.priority]?.bg }}>
                                            {detail.task.priority}
                                        </span>
                                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                            style={{ color: statusStyle[detail.task.status]?.color, background: statusStyle[detail.task.status]?.bg }}>
                                            {statusLabel[detail.task.status]}
                                        </span>
                                        <span className="text-xs text-[#555]">{detail.task.project.name}</span>
                                        {detail.task.due_date && (
                                            <span className={`text-xs ${new Date(detail.task.due_date) < new Date() && detail.task.status !== 'done' ? 'text-red-400' : 'text-[#555]'}`}>
                                                Due {detail.task.due_date}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => { setDetail({ open: false }); openEdit(detail.task) }}
                                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                                        style={{ color: '#9945FF', background: 'rgba(153,69,255,0.1)' }}>
                                        Edit
                                    </button>
                                    <button onClick={() => setDetail({ open: false })}
                                        className="text-[#555] hover:text-white transition-all text-lg leading-none px-2">×</button>
                                </div>
                            </div>
                            {detail.task.description && (
                                <p className="text-[#777] text-sm mt-3 leading-relaxed">{detail.task.description}</p>
                            )}
                        </div>

                        {/* Comments */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wider mb-4">
                                Comments ({comments.length})
                            </h3>
                            {commentsLoading ? (
                                [1,2].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)
                            ) : comments.length === 0 ? (
                                <p className="text-[#444] text-sm text-center py-6">No comments yet. Be the first!</p>
                            ) : (
                                comments.map(c => (
                                    <div key={c.id} className="p-4 rounded-xl group"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                                    style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)' }}>
                                                    {c.user.name[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-[#ccc]">{c.user.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-[#444]">
                                                    {new Date(c.created_at).toLocaleDateString()}
                                                </span>
                                                {(c.user_id === detail.task.project_id || user?.role === 'admin') && (
                                                    <button onClick={() => handleDeleteComment(c.id)}
                                                        className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-300">
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[#888] text-sm leading-relaxed">{c.content}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add comment */}
                        <form onSubmit={handlePostComment} className="p-4"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex gap-3">
                                <input style={inputStyle}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-white placeholder-[#444] text-sm focus:outline-none transition-all"
                                    placeholder="Add a comment…"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                                />
                                <button type="submit" disabled={postingComment || !newComment.trim()}
                                    className="glow-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                                    style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                                    {postingComment ? '…' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setDeleteId(null)}>
                    <div className="sol-card rounded-2xl p-8 w-full max-w-sm text-center"
                        style={{ boxShadow: '0 0 60px rgba(255,107,107,0.15)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="text-4xl mb-4">⚠</div>
                        <h2 className="text-lg font-bold mb-2">Delete Task?</h2>
                        <p className="text-[#666] text-sm mb-6">This cannot be undone.</p>
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
