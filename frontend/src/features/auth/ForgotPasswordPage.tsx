import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetApi } from '../../lib/api';

const IS = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(153,69,255,0.25)' };

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [token, setToken]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await passwordResetApi.forgot(email);
      setToken(res.token);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

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
          <p className="text-[#555] text-sm">Reset your password</p>
        </div>

        <div className="sol-card rounded-2xl p-8" style={{ boxShadow: '0 0 40px rgba(153,69,255,0.2)' }}>
          {!submitted ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <p className="text-[#666] text-sm">Enter your registered email address and we'll generate a reset token for you.</p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#aaa] mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  style={IS} className="w-full px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
                  placeholder="you@example.com" required />
              </div>
              <button type="submit" disabled={loading}
                className="glow-btn w-full text-white font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                {loading ? 'Generating…' : 'Generate reset token'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.25)' }}>
                <svg className="w-5 h-5 shrink-0" style={{ color: '#14F195' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm" style={{ color: '#14F195' }}>Token generated for <strong>{email}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Your reset token — copy this</label>
                <div className="relative">
                  <input readOnly value={token}
                    className="w-full px-4 py-3 rounded-xl text-xs font-mono focus:outline-none pr-20"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(153,69,255,0.3)', color: '#ccc' }} />
                  <button type="button"
                    onClick={() => navigator.clipboard.writeText(token)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'rgba(153,69,255,0.2)', color: '#9945FF' }}>
                    Copy
                  </button>
                </div>
              </div>

              <p className="text-[#555] text-xs">This token expires in 60 minutes. Use it on the reset password page together with your email.</p>

              <Link to="/reset-password"
                className="glow-btn block w-full text-center text-white font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                Go to reset password
              </Link>
            </div>
          )}
        </div>

        <p className="text-center mt-6">
          <Link to="/login" className="text-sm hover:opacity-80 transition-all" style={{ color: '#9945FF' }}>
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
