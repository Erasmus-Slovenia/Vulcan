import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { projectsApi, tasksApi, type Project, type Task } from '../lib/api'

function Dashboard() {
    const { user, logout } = useAuth()
    const [projects, setProjects] = useState<Project[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [taskFilter, setTaskFilter] = useState('all')

    useEffect(() => {
        Promise.all([projectsApi.list(), tasksApi.list()])
            .then(([p, t]) => { setProjects(p); setTasks(t) })
            .finally(() => setLoading(false))
    }, [])

    const activeProjects = projects.filter(p => p.status === 'active').length
    const totalTasks = tasks.length
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length
    const myTasks = tasks.length // all tasks in your projects

    const filteredTasks = taskFilter === 'all'
        ? tasks
        : tasks.filter(t => t.status === taskFilter)

    const statCards = [
        { label: 'Active Projects', value: activeProjects, color: '#9945FF', glow: 'rgba(153,69,255,0.25)' },
        { label: 'Total Tasks',     value: totalTasks,     color: '#14F195', glow: 'rgba(20,241,149,0.2)' },
        { label: 'Overdue',         value: overdueTasks,   color: '#FF6B6B', glow: 'rgba(255,107,107,0.2)' },
        { label: 'My Tasks',        value: myTasks,        color: '#00C2FF', glow: 'rgba(0,194,255,0.2)' },
    ]

    const priorityColor: Record<string, string> = {
        high: '#FF6B6B', medium: '#f0a500', low: '#14F195',
    }
    const statusColor: Record<string, { color: string; bg: string }> = {
        todo:        { color: '#00C2FF', bg: 'rgba(0,194,255,0.1)' },
        in_progress: { color: '#f0a500', bg: 'rgba(240,165,0,0.1)' },
        done:        { color: '#14F195', bg: 'rgba(20,241,149,0.1)' },
    }
    const statusLabel: Record<string, string> = {
        todo: 'To Do', in_progress: 'In Progress', done: 'Done',
    }

    return (
        <div className="min-h-screen text-white">
            {/* Top nav */}
            <nav className="sticky top-0 z-50 border-b"
                style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(153,69,255,0.15)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-2xl font-bold gradient-text">Vulcan</span>
                        <div className="hidden md:flex items-center gap-1">
                            <Link to="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{ color: '#9945FF', background: 'rgba(153,69,255,0.1)' }}>
                                Dashboard
                            </Link>
                            <Link to="/projects" className="px-4 py-2 rounded-lg text-sm font-medium text-[#888] hover:text-white transition-all">
                                Projects
                            </Link>
                            <Link to="/tasks" className="px-4 py-2 rounded-lg text-sm font-medium text-[#888] hover:text-white transition-all">
                                Tasks
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="text-sm px-4 py-2 rounded-lg border transition-all font-medium"
                                style={{ color: '#9945FF', borderColor: 'rgba(153,69,255,0.4)', background: 'rgba(153,69,255,0.08)' }}>
                                Admin
                            </Link>
                        )}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)' }}>
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm text-[#ccc]">{user?.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ color: '#14F195', background: 'rgba(20,241,149,0.1)' }}>
                                {user?.role}
                            </span>
                        </div>
                        <button onClick={logout}
                            className="text-sm px-4 py-2 rounded-lg text-[#888] hover:text-white transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            Log out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold mb-1">
                        Welcome back, <span className="gradient-text">{user?.name}</span>
                    </h2>
                    <p className="text-[#555] text-sm">Here's what's happening across your projects.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map(({ label, value, color, glow }) => (
                        <div key={label} className="sol-card rounded-2xl p-6 transition-all hover:scale-[1.02]"
                            style={{ boxShadow: `0 0 30px ${glow}` }}>
                            {loading
                                ? <div className="h-8 w-12 rounded bg-white/10 animate-pulse mb-1" />
                                : <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
                            }
                            <div className="text-[#666] text-sm">{label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Projects panel */}
                    <div className="sol-card rounded-2xl p-6" style={{ boxShadow: '0 0 40px rgba(153,69,255,0.08)' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #9945FF, #14F195)' }} />
                            <h3 className="text-lg font-semibold">My Projects</h3>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1,2].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-[#444] text-sm mb-3">No projects yet</p>
                                <Link to="/projects"
                                    className="text-xs font-medium px-4 py-2 rounded-lg"
                                    style={{ color: '#9945FF', background: 'rgba(153,69,255,0.1)' }}>
                                    Create one →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {projects.slice(0, 4).map(p => (
                                    <div key={p.id} className="p-4 rounded-xl transition-all hover:scale-[1.01]"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(153,69,255,0.12)' }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-sm text-white">{p.name}</h4>
                                            <span className="text-xs px-2 py-0.5 rounded-full"
                                                style={{
                                                    color: p.status === 'active' ? '#14F195' : p.status === 'paused' ? '#f0a500' : '#9945FF',
                                                    background: p.status === 'active' ? 'rgba(20,241,149,0.1)' : p.status === 'paused' ? 'rgba(240,165,0,0.1)' : 'rgba(153,69,255,0.1)',
                                                }}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <span className="text-xs" style={{ color: '#00C2FF' }}>
                                            {p.tasks_count} task{p.tasks_count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link to="/projects" className="mt-4 flex items-center gap-1 text-xs font-medium transition-all hover:opacity-80"
                            style={{ color: '#9945FF' }}>
                            View all projects →
                        </Link>
                    </div>

                    {/* Tasks panel */}
                    <div className="lg:col-span-2 sol-card rounded-2xl p-6" style={{ boxShadow: '0 0 40px rgba(153,69,255,0.08)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #9945FF, #14F195)' }} />
                                <h3 className="text-lg font-semibold">Tasks</h3>
                            </div>
                            <select value={taskFilter} onChange={e => setTaskFilter(e.target.value)}
                                className="text-sm px-3 py-1.5 rounded-lg text-[#aaa] focus:outline-none"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <option value="all">All</option>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            {loading ? (
                                [1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)
                            ) : filteredTasks.length === 0 ? (
                                <div className="text-center py-12 text-[#444] text-sm">No tasks found</div>
                            ) : (
                                filteredTasks.slice(0, 8).map(task => {
                                    const s = statusColor[task.status]
                                    const pc = priorityColor[task.priority]
                                    const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
                                    return (
                                        <div key={task.id} className="p-4 rounded-xl transition-all hover:scale-[1.005]"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div className="flex gap-3 items-start">
                                                <div className="shrink-0 w-1 h-10 rounded-full mt-0.5" style={{ background: pc }} />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-white text-sm mb-1 truncate">{task.title}</h4>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs" style={{ color: '#888' }}>{task.project.name}</span>
                                                        <span className="text-xs px-2 py-0.5 rounded-full"
                                                            style={{ color: s?.color, background: s?.bg }}>
                                                            {statusLabel[task.status]}
                                                        </span>
                                                        {task.due_date && (
                                                            <span className={`text-xs ${overdue ? 'text-red-400' : 'text-[#555]'}`}>
                                                                {task.due_date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <Link to="/tasks" className="mt-4 flex items-center gap-1 text-xs font-medium transition-all hover:opacity-80"
                            style={{ color: '#9945FF' }}>
                            View all tasks →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
