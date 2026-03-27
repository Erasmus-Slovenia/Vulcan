export default function ProjectsPage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 to-[#006633] p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-white">Project</h1>
                        <p className="text-gray-400 text-lg">Manage your projects and teams</p>
                    </div>
                    <button className="bg-linear-to-r from-[#008F4D] to-[#006633] px-8 py-4 rounded-3xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl">
                        New project
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-green-500/10 group hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-bold text-white">Vulcan</h3>
                            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-2xl text-sm font-medium">Active</span>
                        </div>
                        <p className="text-gray-400 mb-6">Online task management application</p>
                        <div className="space-y-2 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Tasks:</span>
                                <span className="font-semibold text-white">15</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Members:</span>
                                <span className="font-semibold text-white">5</span>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                            <button className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition-all">View</button>
                            <button className="flex-1 bg-linear-to-r from-[#008F4D] to-[#006633] px-4 py-2 rounded-xl text-sm font-medium">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
