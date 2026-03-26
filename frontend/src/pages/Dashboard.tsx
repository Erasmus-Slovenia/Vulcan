import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="bg-gray-800/50 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold bg-linear-to-r from-[#008F4D] to-[#006633] bg-clip-text text-transparent">
                    Vulcan
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">
                        {user?.name} <span className="text-gray-600">({user?.role})</span>
                    </span>
                    <button
                        onClick={logout}
                        className="text-sm text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>
            <main className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
                <p className="text-gray-400">Welcome, {user?.name}.</p>
            </main>
        </div>
    );
}

export default Dashboard;
