import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

interface Stats {
    activeProjects: number
    totalTasks: number
    overdueTasks: number
    myTasks: number
}

function Dashboard() {
    const { user, logout } = useAuth()
    const [stats] = useState<Stats>({
        activeProjects: 3,
        totalTasks: 15,
        overdueTasks: 2,
        myTasks: 5
    })
    const [, setActiveView] = useState<'dashboard' | 'projects' | 'tasks'>('dashboard')
    const [] = useState(null)

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 to-[#006633] p-8 text-white">
            <nav className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-3xl px-8 py-6 mb-8 shadow-2xl shadow-green-500/10 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-[#008F4D] to-[#006633] bg-clip-text text-transparent">
                        Vulcan
                    </h1>
                    <div className="flex items-center gap-4">
                        {user?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="text-sm bg-green-600/20 hover:bg-green-600/40 text-green-400 px-4 py-2 rounded-xl border border-green-500/30 transition-all duration-300"
                            >
                                Admin Panel
                            </Link>
                        )}
                        <span className="text-lg font-medium">
                            {user?.name} <span className="text-green-400">({user?.role})</span>
                        </span>
                        <button
                            onClick={logout}
                            className="text-sm bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-xl border border-gray-600/50 hover:border-green-500/50 transition-all duration-300"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto space-y-8">
                <div className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-green-500/10">
                    <h2 className="text-3xl font-bold mb-4">Welcome, {user?.name}</h2>
                    <p className="text-gray-400 text-lg mb-8">Your dashboard - overview of your projects and tasks</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                            <div className="text-2xl font-bold text-green-400">{stats.activeProjects}</div>
                            <div className="text-gray-400 text-sm mt-1">Active projects</div>
                        </div>

                        <div
                            onClick={() => setActiveView('tasks')}
                            className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-linear-to-br hover:from-blue-500/10 hover:to-blue-600/10 transition-all group cursor-pointer"
                        >
                            <div className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 mb-2 transition-all">{stats.totalTasks}</div>
                            <div className="text-gray-400 group-hover:text-gray-300 text-sm mt-1 font-medium transition-all">Total tasks</div>
                        </div>

                        <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                            <div className="text-2xl font-bold text-red-400">{stats.overdueTasks}</div>
                            <div className="text-gray-400 text-sm mt-1">Missed</div>
                        </div>

                        <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                            <div className="text-2xl font-bold text-purple-400">{stats.myTasks}</div>
                            <div className="text-gray-400 text-sm mt-1">My tasks</div>
                        </div>
                    </div>

                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-green-500/10">
                        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-linear-to-b from-[#008F4D] to-[#006633] rounded-full"></div>
                            My projects
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                onClick={() => setActiveView('projects')}>
                                <h4 className="font-semibold text-white mb-1">Vulcan</h4>
                                <p className="text-gray-400 text-sm mb-2">Web application</p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Active</span>
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">12 tasks</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-green-500/10">
                        <div className="flex flex-wrap gap-3 mb-8">
                            <h3 className="text-2xl font-semibold flex-1">Tasks</h3>
                            <select className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-green-500/50">
                                <option>All</option>
                                <option>Open</option>
                                <option>In progress</option>
                            </select>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                                <div className="flex gap-4 items-start">
                                    <div className="shrink-0 w-2 h-12 bg-red-500 rounded-full mt-1"></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-white mb-1 truncate">Dokončaj specifikacijo API-ja</h4>
                                        <p className="text-gray-400 text-sm mb-2">Vulcan</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full">High</span>
                                            <span>29.3.2026</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">In progress</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
