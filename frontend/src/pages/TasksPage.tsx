import { useState } from 'react'

export default function TasksPage() {
    const [] = useState({ status: 'all', priority: 'all', project: 'all' })

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 to-[#006633] p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 mb-8">
                    <button className="hover:text-white">Dashboard</button>
                    <span>/</span>
                    <span className="font-medium text-white">Tasks</span>
                </div>

                <div className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-3xl p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <select className="bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white">
                            <option>All projects</option>
                        </select>
                        <select className="bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white">
                            <option>All status</option>
                            <option>Opwn</option>
                            <option>In progress</option>
                        </select>
                        <select className="bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white">
                            <option>All priorities</option>
                            <option>High</option>
                        </select>
                        <input type="date" className="bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-white" />
                        <button className="bg-linear-to-r from-[#008F4D] to-[#006633] px-6 py-3 rounded-xl font-medium">
                            Filter
                        </button>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-3xl p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead className="sticky top-0 bg-gray-800/50">
                                <tr>
                                    <th className="p-4 text-left font-semibold">Task</th>
                                    <th className="p-4 text-left font-semibold">Project</th>
                                    <th className="p-4 text-left font-semibold">Assigned</th>
                                    <th className="p-4 text-left font-semibold">Deadline</th>
                                    <th className="p-4 text-left font-semibold">Status</th>
                                    <th className="p-4 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-medium">API specification</td>
                                    <td className="p-4">Vulcan</td>
                                    <td className="p-4">Patrik</td>
                                    <td className="p-4 text-red-400">29.3.2026</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">In progress</span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-green-400 hover:text-green-300 mr-2">Edit</button>
                                        <button className="text-red-400 hover:text-red-300">Delete</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
