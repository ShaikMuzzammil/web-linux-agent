'use client';
import { useState, useCallback, memo, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { User, Eye, EyeOff, Loader2, Lock, Mail, UserPlus, LogIn, CheckCircle2, X, Info } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

type Mode = 'login' | 'register';

// Ubuntu SVG logo inline
function UbuntuLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="9"  r="9"  fill="#E95420"/>
      <circle cx="14" cy="71" r="9"  fill="#E95420"/>
      <circle cx="86" cy="71" r="9"  fill="#E95420"/>
      <path d="M50 18 A32 32 0 0 1 77.7 64" stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M77.7 64 A32 32 0 0 1 22.3 64" stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M22.3 64 A32 32 0 0 1 50 18" stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <circle cx="50" cy="9"  r="4" fill="white"/>
      <circle cx="14" cy="71" r="4" fill="white"/>
      <circle cx="86" cy="71" r="4" fill="white"/>
    </svg>
  );
}

// Inline notification banner
function InfoBanner({ mode }: { mode: Mode }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { setVisible(true); }, [mode]);
  if (!visible) return null;

  const content = mode === 'login'
    ? { icon: <Info size={13} />, text: "Don't have an account? Switch to Register to get started — it's free.", color: 'rgba(59,130,246,0.85)' }
    : { icon: <CheckCircle2 size={13} />, text: 'Create your account to sync your desktop across all devices securely.', color: 'rgba(34,197,94,0.85)' };

  return (
    <div
      className="w-full flex items-start gap-2 px-3 py-2 rounded-xl text-xs leading-snug relative"
      style={{
        background: mode === 'register' ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)',
        border: `1px solid ${mode === 'register' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)'}`,
        color: content.color,
      }}
    >
      <span className="mt-0.5 shrink-0">{content.icon}</span>
      <span>{content.text}</span>
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 opacity-40 hover:opacity-80 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={11} />
      </button>
    </div>
  );
}

export default memo(function LoginScreen() {
  const login = useOSStore((s) => s.login);
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Clear messages on mode switch
  const switchMode = (m: Mode) => { setMode(m); setError(''); setSuccess(''); };

  const handleCredentials = useCallback(async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (mode === 'register' && !name.trim()) { setError('Please enter your name.'); return; }
    if (mode === 'register' && password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        action: mode,
      });
      if (res?.error) {
        const msg = res.error === 'CredentialsSignin' ? 'Invalid email or password.' : res.error;
        setError(msg);
      } else if (res?.ok) {
        if (mode === 'register') {
          setSuccess('Account created! Signing you in…');
        }
        // Session update handled by parent via useSession
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, name, mode]);

  const handleGuest = useCallback(() => {
    login({
      isAuthenticated: false, isGuest: true, userId: null,
      userName: 'Guest', userEmail: null, userImage: null,
    });
  }, [login]);

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleCredentials(); };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    caretColor: '#E95420',
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{
        backgroundImage: 'url(/wallpapers/default.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(28px)', background: 'rgba(0,0,0,0.60)' }} />

      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 520, height: 520,
          background: 'radial-gradient(circle, rgba(233,84,32,0.10) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-[360px] rounded-2xl p-7 flex flex-col items-center gap-4"
        style={{
          background: 'rgba(16,14,28,0.92)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(233,84,32,0.18)',
          animation: 'loginEnter 380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Logo */}
        <div
          className="w-[60px] h-[60px] rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #2C1810 0%, #1a0f0a 100%)',
            boxShadow: '0 0 32px rgba(233,84,32,0.50), 0 0 0 1px rgba(233,84,32,0.25)',
          }}
        >
          <UbuntuLogo size={38} />
        </div>

        <div className="text-center -mt-1">
          <h1 className="text-[17px] font-bold text-white tracking-wide">WebLinuxOS</h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(233,84,32,0.7)' }}>Cloud-Synced Desktop</p>
        </div>

        {/* Mode tabs */}
        <div className="flex w-full gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center justify-center gap-1.5"
              style={{
                background: mode === m ? 'rgba(233,84,32,0.25)' : 'transparent',
                color: mode === m ? '#f97316' : 'rgba(255,255,255,0.38)',
                border: mode === m ? '1px solid rgba(233,84,32,0.28)' : '1px solid transparent',
              }}
            >
              {m === 'login' ? <LogIn size={12} /> : <UserPlus size={12} />}
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Info banner */}
        <InfoBanner mode={mode} />

        {/* Error / success */}
        {error && (
          <div className="w-full px-3 py-2 rounded-xl text-[12px] text-red-400 text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="w-full px-3 py-2 rounded-xl text-[12px] text-green-400 text-center"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            {success}
          </div>
        )}

        {/* Fields */}
        <div className="flex flex-col gap-2.5 w-full">
          {mode === 'register' && (
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(233,84,32,0.5)' }} />
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Full name" onKeyDown={handleKey}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] text-white outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(233,84,32,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
          )}

          <div className="relative">
            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(233,84,32,0.5)' }} />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" onKeyDown={handleKey}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] text-white outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(233,84,32,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          <div className="relative">
            <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(233,84,32,0.5)' }} />
            <input
              type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" onKeyDown={handleKey}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-[13px] text-white outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(233,84,32,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <button
              type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'rgba(233,84,32,0.5)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(233,84,32,0.9)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(233,84,32,0.5)')}
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>

          {/* Submit button */}
          <button
            onClick={handleCredentials} disabled={loading}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all flex items-center justify-center gap-2 mt-0.5"
            style={{
              background: loading ? 'rgba(233,84,32,0.5)' : 'linear-gradient(135deg, #E95420 0%, #C53F10 100%)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(233,84,32,0.35)',
              opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : mode === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />
            }
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Guest continue */}
        <button
          onClick={handleGuest}
          className="text-[12px] transition-all flex items-center gap-1.5 px-4 py-2 rounded-xl w-full justify-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
          }}
        >
          <User size={12} />
          Continue as Guest <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10 }}>(no cloud sync)</span>
        </button>

        <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Your data is encrypted end-to-end and synced across devices
        </p>
      </div>
    </div>
  );
});
