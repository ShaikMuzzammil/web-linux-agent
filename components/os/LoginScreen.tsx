'use client';
import { useState, useCallback, memo } from 'react';
import { signIn } from 'next-auth/react';
import { Github, Chrome, User, Eye, EyeOff, Loader2, Lock, Mail, UserPlus, LogIn } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';

type Mode = 'login' | 'register';

export default memo(function LoginScreen() {
  const login = useOSStore((s) => s.login);
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleCredentials = useCallback(async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    if (mode === 'register' && !name) { setError('Please enter your name'); return; }
    setLoading(true); setError('');
    try {
      const res = await signIn('credentials', {
        redirect: false, email, password, name,
        action: mode,
      });
      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error);
      } else if (res?.ok) {
        // Session will update via useSession in parent
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally { setLoading(false); }
  }, [email, password, name, mode]);

  const handleOAuth = useCallback(async (provider: string) => {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: '/' });
  }, []);

  const handleGuest = useCallback(() => {
    login({
      isAuthenticated: false, isGuest: true, userId: null,
      userName: 'Guest', userEmail: null, userImage: null,
    });
  }, [login]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCredentials();
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
      {/* Blur overlay */}
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(24px)', background: 'rgba(0,0,0,0.55)' }} />

      {/* Login card */}
      <div
        className="relative z-10 w-[380px] rounded-2xl p-8 flex flex-col items-center gap-5"
        style={{ background: 'rgba(20,20,35,0.9)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', border: '1px solid rgba(233,84,32,0.25)', animation: 'loginEnter 400ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Ubuntu Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2C1810 0%, #1a0f0a 100%)', boxShadow: '0 0 32px rgba(233,84,32,0.55)', border: '1px solid rgba(233,84,32,0.3)' }}
        >
          <svg width="44" height="44" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-white tracking-wide">WebLinuxOS</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(233,84,32,0.7)' }}>Cloud-Synced Desktop</p>
        </div>

        {/* Mode toggle */}
        <div className="flex w-full gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5"
              style={{
                background: mode === m ? 'rgba(233,84,32,0.3)' : 'transparent',
                color: mode === m ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
              }}
            >
              {m === 'login' ? <LogIn size={13} /> : <UserPlus size={13} />}
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="w-full px-3 py-2 rounded-lg text-sm text-red-400 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Form fields */}
        <div className="flex flex-col gap-3 w-full">
          {mode === 'register' && (
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400/50" />
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#E95420' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(233,84,32,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
          )}

          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400/50" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#E95420' }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(233,84,32,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400/50" />
            <input
              type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Password" onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#E95420' }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(233,84,32,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400/50 hover:text-orange-400">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <button
            onClick={handleCredentials} disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #E95420, #5B33CC)', boxShadow: '0 4px 15px rgba(233,84,32,0.3)' }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : mode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or continue with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* OAuth */}
        <div className="flex gap-3 w-full">
          {[
            { id: 'github', icon: <Github size={16} />, label: 'GitHub' },
            { id: 'google', icon: <Chrome size={16} />, label: 'Google' },
          ].map((p) => (
            <button
              key={p.id} onClick={() => handleOAuth(p.id)} disabled={!!oauthLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            >
              {oauthLoading === p.id ? <Loader2 size={15} className="animate-spin" /> : p.icon}
              {p.label}
            </button>
          ))}
        </div>

        {/* Guest */}
        <button
          onClick={handleGuest}
          className="text-xs text-orange-400/50 hover:text-orange-400/80 transition-colors flex items-center gap-1.5"
        >
          <User size={11} />
          Continue as Guest (no sync)
        </button>

        <p className="text-[10px] text-white/20 text-center">
          Your data is encrypted and synced across devices
        </p>
      </div>
    </div>
  );
});
