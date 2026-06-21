import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created! Welcome to Tambola 🎯');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
      <div className="auth-orb" style={{
        top: '-15%', right: '-8%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 70%)',
        animation: 'orb-pulse 5s ease-in-out infinite',
      }} />
      <div className="auth-orb" style={{
        bottom: '-15%', left: '-8%', width: '450px', height: '450px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
        animation: 'orb-pulse 5s ease-in-out infinite',
        animationDelay: '2s',
      }} />

      {/* Floating number decorations */}
      {[12, 45, 90, 33, 7].map((num, i) => (
        <div key={num} className="floating-num" style={{
          width: 44 + i * 7,
          height: 44 + i * 7,
          fontSize: `${0.7 + i * 0.08}rem`,
          background: `linear-gradient(135deg, rgba(168,85,247,${0.14 + i * 0.03}), rgba(99,102,241,0.1))`,
          border: `1px solid rgba(168,85,247,${0.18 + i * 0.04})`,
          color: '#c084fc',
          top: `${8 + i * 14}%`,
          right: `${4 + (i % 3) * 7}%`,
          animation: `${i % 2 === 0 ? 'float' : 'floatReverse'} ${3.5 + i * 0.7}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
        }}>
          {num}
        </div>
      ))}
      {[60, 22, 81].map((num, i) => (
        <div key={`r${num}`} className="floating-num" style={{
          width: 38 + i * 6,
          height: 38 + i * 6,
          fontSize: '0.68rem',
          background: `linear-gradient(135deg, rgba(99,102,241,${0.1 + i * 0.03}), rgba(59,130,246,0.08))`,
          border: `1px solid rgba(99,102,241,${0.12 + i * 0.04})`,
          color: '#818cf8',
          top: `${15 + i * 22}%`,
          left: `${3 + i * 4}%`,
          animation: `${i % 2 === 0 ? 'floatReverse' : 'float'} ${4.5 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.9}s`,
        }}>
          {num}
        </div>
      ))}

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.5s ease' }}>
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '20px',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.25rem', margin: '0 auto 1rem',
            boxShadow: '0 12px 40px rgba(168,85,247,0.4), 0 0 0 1px rgba(168,85,247,0.3)',
            animation: 'float 4s ease-in-out infinite',
          }}>
            🎲
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: '2rem', color: '#e2e8f0', margin: '0 0 0.3rem',
            letterSpacing: '-0.02em',
          }}>
            Create Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Join <span style={{ color: '#c084fc', fontWeight: 600 }}>Tambola</span> and start playing
          </p>
        </div>

        {/* Card */}
        <div style={{
          position: 'relative',
          borderRadius: '1.35rem',
          padding: '2px',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(99,102,241,0.3), rgba(59,130,246,0.2))',
        }}>
          <div className="glass" style={{ borderRadius: '1.25rem', padding: '1.75rem', border: 'none' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Username */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.02em' }}>USERNAME</label>
                <div style={{ position: 'relative' }}>
                  <FiUser style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#7c3aed' }} size={16} />
                  <input id="reg-username" className="input-field" style={{ paddingLeft: '2.6rem' }} type="text" placeholder="coolplayer" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.02em' }}>EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <FiMail style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#7c3aed' }} size={16} />
                  <input id="reg-email" className="input-field" style={{ paddingLeft: '2.6rem' }} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.02em' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#7c3aed' }} size={16} />
                  <input id="reg-password" className="input-field" style={{ paddingLeft: '2.6rem', paddingRight: '2.8rem' }} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: '4px' }}>
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.02em' }}>CONFIRM PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#7c3aed' }} size={16} />
                  <input id="reg-confirm" className="input-field" style={{ paddingLeft: '2.6rem' }} type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" />
                </div>
              </div>

              <button id="reg-submit" type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', marginTop: '0.25rem', fontSize: '1rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #a855f7, #6366f1)' }} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating...</> : '🎲 Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#c084fc', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
