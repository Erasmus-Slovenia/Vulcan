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
            setNewUser({ name: '', email: '', password: '', password_confirmation: '', role: 'user' })
        } catch (error) {
            setCreateUserError(error instanceof Error ? error.message : 'Failed to create user')
        } finally {
            setCreatingUser(false)
        }
    }

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center sol-card rounded-2xl p-12">
                    <div className="text-5xl font-bold gradient-text mb-4">403</div>
                    <p className="text-[#888] mb-8">You don't have permission to access this page.</p>
                    <Link to="/dashboard"
                        className="glow-btn px-6 py-3 rounded-xl font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    const inputStyle = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(153,69,255,0.25)',
    }

    return (
        <div className="min-h-screen text-white">
            {/* Top nav */}
            <nav className="sticky top-0 z-50 border-b"
                style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(153,69,255,0.15)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/dashboard" className="text-2xl font-bold gradient-text">Vulcan</Link>
                        <div className="flex items-center gap-2 text-[#555]">
                            <span>/</span>
                            <span className="text-sm font-medium text-[#aaa]">Admin Panel</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)' }}>
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm text-[#ccc]">{user?.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="text-sm px-4 py-2 rounded-lg text-[#888] hover:text-white transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            Log out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-1">Create User</h2>
                    <p className="text-[#555] text-sm">Add a new member to your workspace</p>
                </div>

                <div className="sol-card rounded-2xl p-8" style={{ boxShadow: '0 0 40px rgba(153,69,255,0.1)' }}>
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateUser}>
                        {createUserError && (
                            <div className="md:col-span-2 bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">
                                {createUserError}
                            </div>
                        )}
                        {createUserSuccess && (
                            <div className="md:col-span-2 rounded-xl px-4 py-3 text-sm font-medium"
                                style={{ color: '#14F195', background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.3)' }}>
                                {createUserSuccess}
                            </div>
                        )}

                        <input
                            style={inputStyle}
                            className="px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
                            placeholder="Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                            required
                        />
                        <input
                            style={inputStyle}
                            className="px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
                            placeholder="Email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                            required
                        />
                        <input
                            style={inputStyle}
                            className="px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
                            placeholder="Password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))}
                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                            required
                        />
                        <input
                            style={inputStyle}
                            className="px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
                            placeholder="Confirm Password"
                            type="password"
                            value={newUser.password_confirmation}
                            onChange={(e) => setNewUser(p => ({ ...p, password_confirmation: e.target.value }))}
                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                            required
                        />
                        <select
                            style={inputStyle}
                            className="px-4 py-3 rounded-xl text-white focus:outline-none transition-all"
                            value={newUser.role}
                            onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value }))}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>

                        <button
                            type="submit"
                            disabled={creatingUser}
                            className="glow-btn md:col-span-2 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}
                        >
                            {creatingUser ? 'Creating…' : 'Create User'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default AdminPanel
