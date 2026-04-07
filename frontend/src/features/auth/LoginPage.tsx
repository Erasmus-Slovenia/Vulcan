import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try { await login(name, password); }
    catch { setError('Invalid credentials'); }
    finally { setSubmitting(false); }
  }

  const IS = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(153,69,255,0.25)' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)', boxShadow: '0 0 40px rgba(153,69,255,0.4)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 17L12 7L21 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 17H17" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-1">Vulcan</h1>
          <p className="text-[#555] text-sm">Sign in to your workspace</p>
        </div>

        <div className="sol-card rounded-2xl p-8" style={{ boxShadow: '0 0 40px rgba(153,69,255,0.2)' }}>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm text-center">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#aaa] mb-2">Username</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                style={IS} className="w-full px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#aaa] mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" style={IS}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                required />
            </div>
            <button type="submit" disabled={submitting}
              className="glow-btn w-full text-white font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-[#333] text-xs mt-6">Secured with Laravel Sanctum</p>
      </div>
    </div>
  );
}
