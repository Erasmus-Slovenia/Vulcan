import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectsApi, tasksApi, type Project, type Task } from '../lib/api'
import Layout from '../components/Layout'

const S_COLOR: Record<string, { color: string; bg: string }> = {
  todo:        { color: '#00C2FF', bg: 'rgba(0,194,255,0.1)' },
  in_progress: { color: '#f0a500', bg: 'rgba(240,165,0,0.1)' },
  done:        { color: '#14F195', bg: 'rgba(20,241,149,0.1)' },
}
const S_LABEL: Record<string, string> = { todo: 'Pending', in_progress: 'In Progress', done: 'Completed' }
const P_COLOR: Record<string, string> = { high: '#FF6B6B', medium: '#f0a500', low: '#14F195' }

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks]       = useState<Task[]>([])
  const [loading, setLoading]   = useState(true)
  const [taskFilter, setTaskFilter] = useState('all')

  useEffect(() => {
    Promise.all([projectsApi.list(), tasksApi.list()])
      .then(([p, t]) => { setProjects(p); setTasks(t) })
      .finally(() => setLoading(false))
  }, [])

  const activeProjects = projects.filter(p => p.status === 'active').length
  const pendingTasks   = tasks.filter(t => t.status === 'todo').length
  const overdueTasks   = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length
  const myTasks        = tasks.filter(t => t.users.some(u => u.id === user?.id)).length

  const filtered = taskFilter === 'all' ? tasks : tasks.filter(t => t.status === taskFilter)

  const Skeleton = () => <div className="h-4 rounded bg-white/5 animate-pulse" />

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h2>
          <p className="text-[#555] text-sm">Here's what's happening across your projects.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Projects', value: activeProjects, color: '#9945FF', glow: 'rgba(153,69,255,0.25)' },
            { label: 'Pending Tasks',   value: pendingTasks,   color: '#14F195', glow: 'rgba(20,241,149,0.2)' },
            { label: 'Overdue',         value: overdueTasks,   color: '#FF6B6B', glow: 'rgba(255,107,107,0.2)' },
            { label: 'Assigned to Me',  value: myTasks,        color: '#00C2FF', glow: 'rgba(0,194,255,0.2)' },
          ].map(({ label, value, color, glow }) => (
            <div key={label} className="sol-card rounded-2xl p-6 transition-all hover:scale-[1.02]"
              style={{ boxShadow: `0 0 30px ${glow}` }}>
              {loading
                ? <div className="h-8 w-10 rounded bg-white/10 animate-pulse mb-1" />
                : <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>}
              <div className="text-[#666] text-sm">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects */}
          <div className="sol-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#9945FF,#14F195)' }} />
              <h3 className="text-lg font-semibold">My Projects</h3>
            </div>
            {loading
              ? [1,2].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse mb-3" />)
              : projects.length === 0
                ? <div className="text-center py-8 text-[#444] text-sm">
                    {user?.role === 'admin'
                      ? <>No projects yet — <Link to="/projects" className="underline" style={{ color: '#9945FF' }}>create one</Link></>
                      : 'No projects yet'}
                  </div>
                : projects.slice(0, 5).map(p => (
                    <Link key={p.id} to={`/projects/${p.id}`}
                      className="block p-3 rounded-xl mb-2 transition-all hover:scale-[1.01]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(153,69,255,0.12)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ color: p.status === 'active' ? '#14F195' : '#9945FF', background: p.status === 'active' ? 'rgba(20,241,149,0.1)' : 'rgba(153,69,255,0.1)' }}>
                          {p.status}
                        </span>
                      </div>
                      <span className="text-xs mt-1 block" style={{ color: '#00C2FF' }}>{p.tasks_count} tasks</span>
                    </Link>
                  ))}
            <Link to="/projects" className="mt-3 flex items-center gap-1 text-xs font-medium hover:opacity-80" style={{ color: '#9945FF' }}>
              View all →
            </Link>
          </div>

          {/* Tasks */}
          <div className="lg:col-span-2 sol-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#9945FF,#14F195)' }} />
                <h3 className="text-lg font-semibold">Tasks</h3>
              </div>
              <select value={taskFilter} onChange={e => setTaskFilter(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-lg text-[#aaa] focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="all">All</option>
                <option value="todo">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {loading
                ? [1,2,3].map(i => <div key={i}><Skeleton /></div>)
                : filtered.length === 0
                  ? <div className="text-center py-12 text-[#444] text-sm">No tasks found</div>
                  : filtered.slice(0, 10).map(task => {
                      const s = S_COLOR[task.status]
                      const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
                      return (
                        <div key={task.id} className="p-3 rounded-xl transition-all hover:scale-[1.005]"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex gap-3 items-center">
                            <div className="shrink-0 w-1 h-8 rounded-full" style={{ background: P_COLOR[task.priority] }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-white truncate">{task.title}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: s?.color, background: s?.bg }}>{S_LABEL[task.status]}</span>
                                {task.due_date && <span className={`text-xs ${overdue ? 'text-red-400' : 'text-[#555]'}`}>{task.due_date}</span>}
                              </div>
                              <span className="text-xs text-[#555]">{task.project.name}{task.users.length > 0 && ` · ${task.users.map(u => u.name).join(', ')}`}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
            </div>
            <Link to="/tasks" className="mt-3 flex items-center gap-1 text-xs font-medium hover:opacity-80" style={{ color: '#9945FF' }}>
              View all tasks →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
