import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { passwordResetApi } from '../../lib/api';

const IS = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(153,69,255,0.25)' };

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', token: '', password: '', password_confirmation: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.'); return;
    }
    setError(''); setLoading(true);
    try {
      await passwordResetApi.reset(form.email, form.token, form.password, form.password_confirmation);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-[#aaa] mb-2">{label}</label>
      <input type={type} value={form[key]} placeholder={placeholder}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        style={IS} className="w-full px-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.7)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.25)')}
        required />
    </div>
  );

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
          <p className="text-[#555] text-sm">Set a new password</p>
        </div>

        <div className="sol-card rounded-2xl p-8" style={{ boxShadow: '0 0 40px rgba(153,69,255,0.2)' }}>
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full mx-auto"
                style={{ background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.3)' }}>
                <svg className="w-7 h-7" style={{ color: '#14F195' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold">Password reset!</h2>
              <p className="text-[#555] text-sm">Redirecting you to sign in…</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
              )}
              {field('Email', 'email', 'email', 'you@example.com')}
              {field('Reset token', 'token', 'text', 'Paste your token here')}
              {field('New password', 'password', 'password', '••••••••')}
              {field('Confirm new password', 'password_confirmation', 'password', '••••••••')}
              <button type="submit" disabled={loading}
                className="glow-btn w-full text-white font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 mt-2"
                style={{ background: 'linear-gradient(90deg, #9945FF, #14F195)' }}>
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
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
