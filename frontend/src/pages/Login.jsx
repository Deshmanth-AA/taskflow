import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.12) 0%, var(--bg) 70%)'
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ background: 'var(--accent)', borderRadius: 8, padding: 8 }}>
              <Zap size={20} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800 }}>
              Task<span style={{ color: 'var(--accent)' }}>Flow</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Sign in to your workspace</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><div className="spinner" style={{ borderTopColor: 'white' }} />Signing in...</span> : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
              No account? <Link to="/signup" style={{ color: 'var(--accent-2)' }}>Create one →</Link>
            </p>
          </div>

          <div style={{ marginTop: 16, background: 'var(--bg-3)', borderRadius: 8, padding: 12 }}>
            <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demo credentials</p>
            <p style={{ color: 'var(--text-2)', fontSize: 12 }}>admin@taskflow.dev / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
