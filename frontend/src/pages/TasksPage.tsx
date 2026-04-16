import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectsApi, tasksApi, commentsApi, usersApi, type Project, type Task, type Comment, type User, type TaskUser } from '../lib/api'
import Layout from '../components/Layout'

const PC: Record<string, { color: string; bg: string }> = {
  high:   { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  medium: { color: '#f0a500', bg: 'rgba(240,165,0,0.10)' },
  low:    { color: '#14F195', bg: 'rgba(20,241,149,0.10)' },
}
const SC: Record<string, { color: string; bg: string }> = {
  todo:        { color: '#00C2FF', bg: 'rgba(0,194,255,0.1)' },
  in_progress: { color: '#f0a500', bg: 'rgba(240,165,0,0.1)' },
  done:        { color: '#14F195', bg: 'rgba(20,241,149,0.1)' },
}
const SL: Record<string, string> = { todo: 'Pending', in_progress: 'In Progress', done: 'Completed' }

// Gradient colors for user avatars — cycles through a set
const AVATAR_COLORS = [
  'linear-gradient(135deg,#9945FF,#14F195)',
  'linear-gradient(135deg,#00C2FF,#9945FF)',
  'linear-gradient(135deg,#14F195,#00C2FF)',
  'linear-gradient(135deg,#FF6B6B,#9945FF)',
  'linear-gradient(135deg,#f0a500,#14F195)',
]
function avatarGrad(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length] }

/** Compact row of user avatars with tooltip names */
function AvatarStack({ users }: { users: TaskUser[] }) {
  if (users.length === 0) return <span className="text-[#444] text-xs">—</span>
  return (
    <div className="flex items-center -space-x-2">
      {users.slice(0, 4).map(u => (
        <div key={u.id} title={u.name}
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-[#0a0a0a]"
          style={{ background: avatarGrad(u.id) }}>
          {u.name[0].toUpperCase()}
        </div>
      ))}
      {users.length > 4 && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
          +{users.length - 4}
        </div>
      )}
    </div>
  )
}

/** Dropdown multi-select for picking users */
function UserMultiSelect({ users, selected, onChange }: {
  users: User[]
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  const selectedUsers = users.filter(u => selected.includes(u.id))

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 rounded-xl text-left text-sm focus:outline-none flex items-center justify-between gap-2"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(153,69,255,0.25)' }}>
        {selectedUsers.length === 0
          ? <span className="text-[#444]">Unassigned</span>
          : <div className="flex items-center gap-1 flex-wrap">
              {selectedUsers.map(u => (
                <span key={u.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ color: '#9945FF', background: 'rgba(153,69,255,0.15)' }}>
                  {u.name}
                </span>
              ))}
            </div>
        }
        <svg className={`w-4 h-4 text-[#555] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden max-h-60 overflow-y-auto"
          style={{ background: '#13111C', border: '1px solid rgba(153,69,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {users.length === 0
            ? <div className="px-4 py-3 text-sm text-[#444]">No users available</div>
            : users.map(u => {
                const checked = selected.includes(u.id)
                return (
                  <button key={u.id} type="button" onClick={() => toggle(u.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-all hover:bg-white/5">
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all`}
                      style={{ background: checked ? 'linear-gradient(90deg,#9945FF,#14F195)' : 'rgba(255,255,255,0.08)', border: checked ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
                      {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: avatarGrad(u.id) }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <span className="text-white">{u.name}</span>
                    <span className="text-xs text-[#555] ml-auto">{u.role}</span>
                  </button>
                )
              })}
        </div>
      )}
    </div>
  )
}

const EMPTY_FORM = {
  title: '', description: '',
  status: 'todo' as Task['status'],
  priority: 'medium' as Task['priority'],
  due_date: '', project_id: 0,
  user_ids: [] as number[],
}

type TaskModal  = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; task: Task }
type DetailPane = { open: false } | { open: true; task: Task }

const IS = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(153,69,255,0.25)' }
const SS = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
const today = new Date().toISOString().split('T')[0]

export default function TasksPage() {
  const { user } = useAuth()
  const [sp] = useSearchParams()

  const [tasks, setTasks]       = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers]       = useState<User[]>([])
  const [loading, setLoading]   = useState(true)

  const [filters, setFilters] = useState({
    project_id: sp.get('project_id') ? Number(sp.get('project_id')) : 0,
    status:     '',
    priority:   '',
    user_id:    0,
    sort:       'created_at',
    dir:        'desc',
  })

  const [modal, setModal]       = useState<TaskModal>({ mode: 'closed' })
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')

  const [detail, setDetail]         = useState<DetailPane>({ open: false })
  const [comments, setComments]     = useState<Comment[]>([])
  const [cLoading, setCLoading]     = useState(false)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting]       = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const loadTasks = (f = filters) =>
    tasksApi.list({
      project_id: f.project_id  || undefined,
      status:     f.status      || undefined,
      priority:   f.priority    || undefined,
      user_id:    f.user_id     || undefined,
      sort:       f.sort,
      dir:        f.dir,
    }).then(setTasks)

  useEffect(() => {
    Promise.all([
      loadTasks(),
      projectsApi.list().then(setProjects),
      usersApi.list().then(setUsers),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (!loading) loadTasks() }, [filters])

  function setF<K extends keyof typeof filters>(k: K, v: typeof filters[K]) {
    setFilters(p => ({ ...p, [k]: v }))
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM, project_id: filters.project_id || projects[0]?.id || 0 })
    setFormErr(''); setModal({ mode: 'create' })
  }

  function openEdit(task: Task) {
    setForm({
      title:       task.title,
      description: task.description ?? '',
      status:      task.status,
      priority:    task.priority,
      due_date:    task.due_date ?? '',
      project_id:  task.project_id,
      user_ids:    task.users.map(u => u.id),
    })
    setFormErr(''); setModal({ mode: 'edit', task })
  }

  async function openDetail(task: Task) {
    setDetail({ open: true, task }); setComments([]); setCLoading(true)
    commentsApi.list(task.id).then(setComments).finally(() => setCLoading(false))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setFormErr('')
    try {
      if (modal.mode === 'create') {
        const t = await tasksApi.create(form)
        setTasks(prev => [t, ...prev])
      } else if (modal.mode === 'edit') {
        const t = await tasksApi.update(modal.task.id, form)
        setTasks(prev => prev.map(x => x.id === t.id ? t : x))
        if (detail.open && detail.task.id === modal.task.id) setDetail({ open: true, task: t })
      }
      setModal({ mode: 'closed' })
    } catch (err) { setFormErr(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    await tasksApi.remove(id)
    setTasks(prev => prev.filter(t => t.id !== id))
    if (detail.open && detail.task.id === id) setDetail({ open: false })
    setDeleteId(null)
  }

  async function postComment(e: FormEvent) {
    e.preventDefault()
    if (!detail.open || !newComment.trim()) return
    setPosting(true)
    try {
      const c = await commentsApi.create(detail.task.id, newComment.trim())
      setComments(prev => [c, ...prev]); setNewComment('')
    } finally { setPosting(false) }
  }

  async function deleteComment(id: number) {
    await commentsApi.remove(id); setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <button onClick={openCreate} disabled={projects.length === 0}
            className="glow-btn px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(90deg,#9945FF,#14F195)' }}>
            + New Task
          </button>
        </div>

        {/* Filters */}
        <div className="sol-card rounded-2xl p-4">
          <div className="flex flex-wrap gap-3">
            <select style={SS} className="px-3 py-2 rounded-xl text-sm text-[#aaa] focus:outline-none"
              value={filters.project_id} onChange={e => setF('project_id', Number(e.target.value))}>
              <option value={0}>All projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select style={SS} className="px-3 py-2 rounded-xl text-sm text-[#aaa] focus:outline-none"
              value={filters.status} onChange={e => setF('status', e.target.value)}>
              <option value="">All statuses</option>
              <option value="todo">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
            <select style={SS} className="px-3 py-2 rounded-xl text-sm text-[#aaa] focus:outline-none"
              value={filters.priority} onChange={e => setF('priority', e.target.value)}>
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select style={SS} className="px-3 py-2 rounded-xl text-sm text-[#aaa] focus:outline-none"
              value={filters.user_id} onChange={e => setF('user_id', Number(e.target.value))}>
              <option value={0}>All assignees</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={`${filters.sort}:${filters.dir}`}
              onChange={e => { const [s, d] = e.target.value.split(':'); setF('sort', s); setF('dir', d) }}
              style={SS} className="px-3 py-2 rounded-xl text-sm text-[#aaa] focus:outline-none">
              <option value="created_at:desc">Newest first</option>
              <option value="created_at:asc">Oldest first</option>
              <option value="due_date:asc">Due date ↑</option>
              <option value="due_date:desc">Due date ↓</option>
              <option value="priority:asc">Priority ↑</option>
              <option value="priority:desc">Priority ↓</option>
            </select>
            <button onClick={() => setFilters({ project_id: 0, status: '', priority: '', user_id: 0, sort: 'created_at', dir: 'desc' })}
              style={SS} className="px-4 py-2 rounded-xl text-sm text-[#666] hover:text-white transition-all">
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="sol-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(153,69,255,0.12)', background: 'rgba(153,69,255,0.04)' }}>
                {['Task','Project','Priority','Status','Assignees','Due Date','Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-[#555] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i => (
                <tr key={i}>{[1,2,3,4,5,6,7].map(j => <td key={j} className="px-5 py-4"><div className="h-4 rounded bg-white/5 animate-pulse" /></td>)}</tr>
              )) : tasks.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-[#444]">
                  No tasks found.{projects.length > 0 && <> <button onClick={openCreate} className="underline" style={{ color: '#9945FF' }}>Create one</button></>}
                </td></tr>
              ) : tasks.map((task, i) => {
                const p = PC[task.priority]; const s = SC[task.status]
                const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
                return (
                  <tr key={task.id} className="transition-all hover:bg-white/[0.02]"
                    style={{ borderBottom: i < tasks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                    <td className="px-5 py-4">
                      <button onClick={() => openDetail(task)} className="font-medium text-white hover:opacity-80 text-left">{task.title}</button>
                    </td>
                    <td className="px-5 py-4 text-[#666]">{task.project.name}</td>
                    <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: p?.color, background: p?.bg }}>{task.priority}</span></td>
                    <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: s?.color, background: s?.bg }}>{SL[task.status]}</span></td>
                    <td className="px-5 py-4"><AvatarStack users={task.users} /></td>
                    <td className={`px-5 py-4 text-xs ${overdue ? 'text-red-400' : 'text-[#555]'}`}>{task.due_date ?? '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(task)} className="text-xs font-medium hover:opacity-80" style={{ color: '#9945FF' }}>Edit</button>
                        <button onClick={() => setDeleteId(task.id)} className="text-xs font-medium text-red-400 hover:text-red-300">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {modal.mode !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="sol-card rounded-2xl p-8 w-full max-w-lg"
            style={{ boxShadow: '0 0 60px rgba(153,69,255,0.2)' }}>
            <h2 className="text-xl font-bold mb-6">{modal.mode === 'create' ? 'New Task' : 'Edit Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formErr && <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">{formErr}</div>}

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Title</label>
                <input style={IS} className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  onFocus={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.25)')}
                  required />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Description</label>
                <textarea style={IS} rows={2} className="w-full px-4 py-3 rounded-xl text-white focus:outline-none resize-none"
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  onFocus={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.25)')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Project</label>
                  <select style={IS} className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                    value={form.project_id} onChange={e => setForm(p => ({ ...p, project_id: Number(e.target.value) }))} required>
                    <option value={0} disabled>Pick project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Status</label>
                  <select style={IS} className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                    value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Task['status'] }))}>
                    <option value="todo">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Priority</label>
                  <select style={IS} className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                    value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Task['priority'] }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Due Date</label>
                  <input type="date" min={today} style={IS}
                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                    value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
                </div>
              </div>

              {/* Multi-user assignee picker */}
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">
                  Assignees <span className="text-[#555] font-normal">(select multiple)</span>
                </label>
                <UserMultiSelect
                  users={users}
                  selected={form.user_ids}
                  onChange={ids => setForm(p => ({ ...p, user_ids: ids }))}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal({ mode: 'closed' })}
                  className="flex-1 py-3 rounded-xl text-sm text-[#888] hover:text-white"
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

      {/* Detail + Comments */}
      {detail.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setDetail({ open: false })}>
          <div className="sol-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            style={{ boxShadow: '0 0 60px rgba(153,69,255,0.15)' }}
            onClick={e => e.stopPropagation()}>

            <div className="p-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{detail.task.title}</h2>
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: PC[detail.task.priority]?.color, background: PC[detail.task.priority]?.bg }}>{detail.task.priority}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: SC[detail.task.status]?.color, background: SC[detail.task.status]?.bg }}>{SL[detail.task.status]}</span>
                    <span className="text-xs text-[#555]">{detail.task.project.name}</span>
                    {detail.task.due_date && <span className={`text-xs ${new Date(detail.task.due_date) < new Date() && detail.task.status !== 'done' ? 'text-red-400' : 'text-[#555]'}`}>Due {detail.task.due_date}</span>}
                  </div>

                  {/* Assignees row */}
                  {detail.task.users.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-[#555]">Assigned to</span>
                      <div className="flex items-center gap-1.5">
                        {detail.task.users.map(u => (
                          <div key={u.id} className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                            style={{ background: 'rgba(153,69,255,0.12)', border: '1px solid rgba(153,69,255,0.25)' }}>
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: avatarGrad(u.id), fontSize: '9px' }}>
                              {u.name[0].toUpperCase()}
                            </div>
                            <span style={{ color: '#ccc' }}>{u.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setDetail({ open: false }); openEdit(detail.task) }}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ color: '#9945FF', background: 'rgba(153,69,255,0.1)' }}>
                    Edit
                  </button>
                  <button onClick={() => setDetail({ open: false })} className="text-[#555] hover:text-white text-xl leading-none px-2">×</button>
                </div>
              </div>
              {detail.task.description && <p className="text-[#777] text-sm mt-3 leading-relaxed">{detail.task.description}</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Comments ({comments.length})</h3>
              {cLoading ? [1,2].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />) :
               comments.length === 0 ? <p className="text-[#444] text-sm text-center py-6">No comments yet.</p> :
               comments.map(c => (
                <div key={c.id} className="p-4 rounded-xl group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: avatarGrad(c.user.id) }}>
                        {c.user.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-[#ccc]">{c.user.name}</span>
                      <span className="text-xs text-[#444]">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    {(c.user_id === user?.id || user?.role === 'admin') && (
                      <button onClick={() => deleteComment(c.id)}
                        className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-300">
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-[#888] text-sm leading-relaxed">{c.content}</p>
                </div>
               ))}
            </div>

            <form onSubmit={postComment} className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-3">
                <input style={IS} className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm placeholder-[#444] focus:outline-none"
                  placeholder="Add a comment…" value={newComment} onChange={e => setNewComment(e.target.value)}
                  onFocus={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor='rgba(153,69,255,0.25)')} />
                <button type="submit" disabled={posting || !newComment.trim()}
                  className="glow-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg,#9945FF,#14F195)' }}>
                  {posting ? '…' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
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
