import { useState, useEffect, useRef } from 'react'
import { tasksApi, projectsApi, type Task, type Project } from '../lib/api'
import Layout from '../components/Layout'

const COLS: { key: Task['status']; label: string; color: string; bg: string; glow: string }[] = [
  { key: 'todo',        label: 'Pending',     color: '#00C2FF', bg: 'rgba(0,194,255,0.08)',   glow: 'rgba(0,194,255,0.15)' },
  { key: 'in_progress', label: 'In Progress', color: '#f0a500', bg: 'rgba(240,165,0,0.08)',   glow: 'rgba(240,165,0,0.15)' },
  { key: 'done',        label: 'Completed',   color: '#14F195', bg: 'rgba(20,241,149,0.08)',  glow: 'rgba(20,241,149,0.15)' },
]
const PC: Record<string, string> = { high: '#FF6B6B', medium: '#f0a500', low: '#14F195' }

export default function KanbanPage() {
  const [tasks, setTasks]       = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [projectId, setProjectId] = useState(0)

  // drag state
  const draggingId  = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<Task['status'] | null>(null)

  const load = (pid = projectId) =>
    tasksApi.list({ project_id: pid || undefined }).then(setTasks)

  useEffect(() => {
    Promise.all([load(), projectsApi.list().then(setProjects)]).finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (!loading) load() }, [projectId])

  function cols() {
    return COLS.map(col => ({
      ...col,
      tasks: tasks.filter(t => t.status === col.key),
    }))
  }

  function onDragStart(id: number) { draggingId.current = id }

  async function onDrop(status: Task['status']) {
    const id = draggingId.current
    if (id === null) return
    draggingId.current = null
    setDragOver(null)

    const task = tasks.find(t => t.id === id)
    if (!task || task.status === status) return

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))

    try {
      await tasksApi.update(id, { status })
    } catch {
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: task.status } : t))
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Kanban Board</h1>
            <p className="text-[#555] text-sm">Drag cards between columns to update status</p>
          </div>
          <select value={projectId}
            onChange={e => setProjectId(Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl text-sm text-[#aaa] focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option value={0}>All projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            {COLS.map(col => (
              <div key={col.key} className="sol-card rounded-2xl p-4 space-y-3">
                <div className="h-6 rounded bg-white/10 animate-pulse mb-4" />
                {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cols().map(col => (
              <div key={col.key}
                className="rounded-2xl transition-all"
                style={{
                  background: dragOver === col.key ? col.bg : 'rgba(19,17,28,0.7)',
                  border: `1px solid ${dragOver === col.key ? col.color + '55' : 'rgba(153,69,255,0.18)'}`,
                  boxShadow: dragOver === col.key ? `0 0 30px ${col.glow}` : 'none',
                  minHeight: '480px',
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => onDrop(col.key)}>

                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-4"
                  style={{ borderBottom: `1px solid ${col.color}22` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color, boxShadow: `0 0 8px ${col.color}` }} />
                    <span className="text-sm font-semibold" style={{ color: col.color }}>{col.label}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ color: col.color, background: col.bg }}>
                    {col.tasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-3">
                  {col.tasks.length === 0 && (
                    <div className="text-center py-8 text-[#333] text-sm border-2 border-dashed rounded-xl"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      Drop here
                    </div>
                  )}
                  {col.tasks.map(task => {
                    const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
                    return (
                      <div key={task.id}
                        draggable
                        onDragStart={() => onDragStart(task.id)}
                        className="p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                        {/* Priority bar */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: PC[task.priority] }} />
                          <span className="text-xs" style={{ color: PC[task.priority] }}>{task.priority}</span>
                          {overdue && <span className="text-xs text-red-400 ml-auto">Overdue</span>}
                        </div>

                        <h4 className="text-sm font-semibold text-white mb-2 leading-tight">{task.title}</h4>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-[#444]">{task.project.name}</span>
                          {task.users.length > 0 && (
                            <div className="flex items-center -space-x-1">
                              {task.users.slice(0, 3).map(u => (
                                <div key={u.id} title={u.name}
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-[#0a0a0a]"
                                  style={{ background: 'linear-gradient(135deg,#9945FF,#14F195)', fontSize: '9px' }}>
                                  {u.name[0].toUpperCase()}
                                </div>
                              ))}
                              {task.users.length > 3 && (
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs ring-1 ring-[#0a0a0a]"
                                  style={{ background: 'rgba(255,255,255,0.1)', fontSize: '9px' }}>
                                  +{task.users.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {task.due_date && (
                          <div className={`text-xs mt-2 ${overdue ? 'text-red-400' : 'text-[#444]'}`}>
                            Due {task.due_date}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
