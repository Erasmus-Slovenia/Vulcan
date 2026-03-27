import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'

function AdminPanel() {
    const { user, logout } = useAuth()
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
    })
    const [creatingUser, setCreatingUser] = useState(false)
    const [createUserError, setCreateUserError] = useState('')
    const [createUserSuccess, setCreateUserSuccess] = useState('')

    async function handleCreateUser(e: FormEvent) {
        e.preventDefault()
        setCreateUserError('')
        setCreateUserSuccess('')

        if (newUser.password !== newUser.password_confirmation) {
            setCreateUserError('Passwords do not match')
            return
        }

        setCreatingUser(true)

        try {
            await api('/users', {
                method: 'POST',
                body: JSON.stringify(newUser),
            })

            setCreateUserSuccess('User created successfully')
            setNewUser({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: 'user',
            })
        } catch (error) {
            setCreateUserError(error instanceof Error ? error.message : 'Failed to create user')
        } finally {
            setCreatingUser(false)
        }
    }

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-900 to-[#006633] p-8 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">403 - Forbidden</h1>
                    <p className="mb-8">You do not have permission to access this page.</p>
                    <Link to="/dashboard" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl transition-all">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 to-[#006633] p-8 text-white">
            <nav className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 rounded-3xl px-8 py-6 mb-8 shadow-2xl shadow-green-500/10 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="text-3xl font-bold bg-linear-to-r from-[#008F4D] to-[#006633] bg-clip-text text-transparent">
                            Vulcan
                        </Link>
                        <span className="text-xl font-semibold text-gray-300">Admin Panel</span>
                    </div>
                    <div className="flex items-center gap-4">
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
                    <h3 className="text-2xl font-semibold mb-6">Create new user</h3>

                    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateUser}>
                        {createUserError && (
                            <div className="md:col-span-2 bg-red-500/10 border border-red-500/50 rounded-xl px-4 py-3 text-red-400 text-sm">
                                {createUserError}
                            </div>
                        )}

                        {createUserSuccess && (
                            <div className="md:col-span-2 bg-green-500/10 border border-green-500/50 rounded-xl px-4 py-3 text-green-400 text-sm">
                                {createUserSuccess}
                            </div>
                        )}

                        <input
                            className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                            placeholder="Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        <input
                            className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                            placeholder="Email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                            required
                        />
                        <input
                            className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                            placeholder="Password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                            required
                        />
                        <input
                            className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                            placeholder="Confirm Password"
                            type="password"
                            value={newUser.password_confirmation}
                            onChange={(e) => setNewUser((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                            required
                        />
                        <select
                            className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                            value={newUser.role}
                            onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>

                        <button
                            type="submit"
                            disabled={creatingUser}
                            className="md:col-span-2 bg-linear-to-r from-[#008F4D] to-[#006633] hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creatingUser ? 'Creating...' : 'Create user'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default AdminPanel
