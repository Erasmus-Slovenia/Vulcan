import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(name, password);
        } catch {
            setError('Invalid credentials');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 to-[#006633] flex items-center justify-center p-4 text-white">
            <div className="w-full max-w-md">
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-green-500/10">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold bg-linear-to-r from-[#008F4D] to-[#006633] bg-clip-text text-transparent mb-2">
                            Vulcan
                        </h1>
                        <p className="text-gray-400 text-sm">Welcome back. Sign in to your account.</p>
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-linear-to-r from-[#008F4D] to-[#006633] hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
