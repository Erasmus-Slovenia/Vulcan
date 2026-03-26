function LoginPage() {
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
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-400">
                                <input type="checkbox" className="rounded border-gray-600 text-green-500 focus:ring-green-500 mr-2" />
                                Remember me
                            </label>
                            <a href="#" className="text-green-400 hover:text-green-300 transition-colors">Forgot password?</a>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-linear-to-r from-[#008F4D] to-[#006633] hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            Sign in
                        </button>
                    </form>
                    <p className="text-center mt-6 text-sm text-gray-400">
                        Don't have an account?{' '}
                        <a href="#" className="text-green-400 font-medium hover:text-green-300 transition-colors">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;