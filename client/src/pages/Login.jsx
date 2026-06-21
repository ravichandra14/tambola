import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎯');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a0a16 0%, #0f0f1a 40%, #0d0a1e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      {/* Floating decorative number balls */}
      {[7, 42, 15, 88, 23].map((num, i) => (
        <div key={num} className="floating-num" style={{
          width: 48 + i * 8,
          height: 48 + i * 8,
          fontSize: `${0.75 + i * 0.1}rem`,
          background: `linear-gradient(135deg, rgba(99,102,241,${0.15 + i * 0.04}), rgba(168,85,247,${0.1 + i * 0.03}))`,
          border: `1px solid rgba(99,102,241,${0.2 + i * 0.05})`,
          color: '#818cf8',
          top: `${10 + i * 15}%`,
          right: `${5 + (i % 3) * 8}%`,
          animation: `${i % 2 === 0 ? 'float' : 'floatReverse'} ${3 + i * 0.8}s ease-in-out infinite`,
          animationDelay: `${i * 0.6}s`,
        }}>
          {num}
        </div>
      ))}
      {[63, 5, 77].map((num, i) => (
        <div key={`l${num}`} className="floating-num" style={{
          width: 40 + i * 6,
          height: 40 + i * 6,
          fontSize: '0.7rem',
          background: `linear-gradient(135deg, rgba(59,130,246,${0.12 + i * 0.03}), rgba(99,102,241,0.08))`,
          border: `1px solid rgba(59,130,246,${0.15 + i * 0.04})`,
          color: '#60a5fa',
          top: `${20 + i * 20}%`,
          left: `${3 + i * 5}%`,
          animation: `${i % 2 === 0 ? 'floatReverse' : 'float'} ${4 + i * 0.6}s ease-in-out infinite`,
          animationDelay: `${i * 0.8}s`,
        }}>
          {num}
        </div>
      ))}

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.5s ease' }}>
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.25rem', margin: '0 auto 1.1rem',
            boxShadow: '0 12px 40px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.3)',
            animation: 'float 4s ease-in-out infinite',
          }}>
            🎯
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: '2rem', color: '#e2e8f0', margin: '0 0 0.3rem',
            letterSpacing: '-0.02em',
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Sign in to continue playing <span style={{ color: '#818cf8', fontWeight: 600 }}>Tambola</span>
          </p>
        </div>

        {/* Glass Card with shimmer border */}
        <div style={{
          position: 'relative',
          borderRadius: '1.35rem',
          padding: '2px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.25), rgba(59,130,246,0.2))',
        }}>
          <div className="glass" style={{ borderRadius: '1.25rem', padding: '2rem', border: 'none' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                  EMAIL OR USERNAME
                </label>
                <div style={{ position: 'relative' }}>
                  <FiMail style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#4f46e5' }} size={16} />
                  <input
                    id="login-email"
                    className="input-field"
                    style={{ paddingLeft: '2.6rem' }}
                    type="text"
                    placeholder="you@example.com or username"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#4f46e5' }} size={16} />
                  <input
                    id="login-password"
                    className="input-field"
                    style={{ paddingLeft: '2.6rem', paddingRight: '2.8rem' }}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: '4px' }}
                  >
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', marginTop: '0.25rem', fontSize: '1rem', borderRadius: '0.75rem' }}
                disabled={loading}
              >
                {loading ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
                ) : '🎯 Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
                Create one →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
