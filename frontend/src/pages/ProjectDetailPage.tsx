import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsApi, tasksApi, type Task } from '../lib/api'
import Layout from '../components/Layout'

const S_COLOR: Record<string, { color: string; bg: string }> = {
  todo:        { color: '#00C2FF', bg: 'rgba(0,194,255,0.1)' },
  in_progress: { color: '#f0a500', bg: 'rgba(240,165,0,0.1)' },
  done:        { color: '#14F195', bg: 'rgba(20,241,149,0.1)' },
}
const S_LABEL: Record<string, string> = { todo: 'Pending', in_progress: 'In Progress', done: 'Completed' }
const P_COLOR: Record<string, { color: string; bg: string }> = {
  high:   { color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  medium: { color: '#f0a500', bg: 'rgba(240,165,0,0.1)' },
  low:    { color: '#14F195', bg: 'rgba(20,241,149,0.1)' },
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<{ id: number; name: string; description: string | null; status: string; tasks_count: number } | null>(null)
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sort, setSort] = useState('created_at')
  const [dir, setDir]   = useState('desc')

  const load = () =>
    Promise.all([
      projectsApi.show(Number(id)),
      tasksApi.list({ project_id: Number(id), status: statusFilter || undefined, priority: priorityFilter || undefined, sort, dir }),
    ]).then(([p, t]) => { setProject(p); setTasks(t) })
     .finally(() => setLoading(false))

  useEffect(() => { load() }, [id])
  useEffect(() => {
    if (!loading) tasksApi.list({ project_id: Number(id), status: statusFilter || undefined, priority: priorityFilter || undefined, sort, dir }).then(setTasks)
  }, [statusFilter, priorityFilter, sort, dir])

  if (loading) return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="sol-card rounded-2xl h-32 animate-pulse mb-6" />
        <div className="sol-card rounded-2xl h-64 animate-pulse" />
      </div>
    </Layout>
  )

  if (!project) return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-[#444]">
        Project not found. <Link to="/projects" className="underline" style={{ color: '#9945FF' }}>Back to projects</Link>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#555]">
          <Link to="/projects" className="hover:text-[#888] transition-all">Projects</Link>
          <span>/</span>
          <span className="text-[#aaa] font-medium">{project.name}</span>
        </div>

        {/* Header card */}
        <div className="sol-card rounded-2xl p-6" style={{ boxShadow: '0 0 40px rgba(153,69,255,0.08)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{project.name}</h1>
              <p className="text-[#666] text-sm">{project.description || 'No description'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 rounded-full font-medium"
                style={project.status === 'active'
                  ? { color: '#14F195', background: 'rgba(20,241,149,0.1)' }
                  : { color: '#9945FF', background: 'rgba(153,69,255,0.1)' }}>
                {project.status}
              </span>
              <Link to={`/tasks?project_id=${project.id}`}
                className="glow-btn text-sm px-4 py-2 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(90deg,#9945FF,#14F195)' }}>
                + New Task
              </Link>
            </div>
          </div>
          <div className="flex gap-6 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label: 'Total', value: tasks.length, color: '#ccc' },
              { label: 'Pending',     value: tasks.filter(t => t.status === 'todo').length,        color: '#00C2FF' },
              { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#f0a500' },
              { label: 'Completed',   value: tasks.filter(t => t.status === 'done').length,        color: '#14F195' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="text-xl font-bold" style={{ color }}>{value}</div>
                <div className="text-xs text-[#555]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="sol-card rounded-2xl p-4">
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'All statuses', value: statusFilter, set: setStatusFilter, opts: [['','All'],['todo','Pending'],['in_progress','In Progress'],['done','Completed']] },
              { label: 'All priorities', value: priorityFilter, set: setPriorityFilter, opts: [['','All'],['high','High'],['medium','Medium'],['low','Low']] },
            ].map(({ value, set, opts }, i) => (
              <select key={i} value={value} onChange={e => set(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm text-[#aaa] focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
            <select value={`${sort}:${dir}`}
              onChange={e => { const [s, d] = e.target.value.split(':'); setSort(s); setDir(d) }}
              className="px-3 py-2 rounded-xl text-sm text-[#aaa] focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="created_at:desc">Newest first</option>
              <option value="created_at:asc">Oldest first</option>
              <option value="due_date:asc">Due date ↑</option>
              <option value="due_date:desc">Due date ↓</option>
              <option value="priority:asc">Priority ↑</option>
              <option value="priority:desc">Priority ↓</option>
            </select>
          </div>
        </div>

        {/* Task list */}
        <div className="sol-card rounded-2xl overflow-hidden">
          {tasks.length === 0 ? (
            <div className="text-center py-16 text-[#444] text-sm">
              No tasks match your filters.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(153,69,255,0.12)', background: 'rgba(153,69,255,0.04)' }}>
                  {['Title','Priority','Status','Assignee','Due Date'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-[#555] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => {
                  const p = P_COLOR[task.priority]
                  const s = S_COLOR[task.status]
                  const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
                  return (
                    <tr key={task.id} className="transition-all hover:bg-white/[0.02]"
                      style={{ borderBottom: i < tasks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                      <td className="px-5 py-4 font-medium text-white">{task.title}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: p.color, background: p.bg }}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: s.color, background: s.bg }}>
                          {S_LABEL[task.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#666]">{task.users.length > 0 ? task.users.map(u => u.name).join(', ') : '—'}</td>
                      <td className={`px-5 py-4 text-xs ${overdue ? 'text-red-400' : 'text-[#555]'}`}>
                        {task.due_date ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
