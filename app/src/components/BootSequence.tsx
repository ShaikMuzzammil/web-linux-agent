// ============================================================
// BootSequence — Premium animated boot with error safety
// ============================================================

import { useEffect, useState, memo } from 'react';

const PHASES = { LOGO: 0, LOADING: 1, TRANSITION: 2, REVEAL: 3, DONE: 4 };

const LOADING_STEPS = [
  { at: 0,   text: 'Starting kernel...' },
  { at: 20,  text: 'Initializing services...' },
  { at: 45,  text: 'Loading desktop environment...' },
  { at: 70,  text: 'Mounting file systems...' },
  { at: 85,  text: 'Preparing desktop...' },
  { at: 97,  text: 'Almost ready...' },
];

const BootSequence = memo(function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(PHASES.LOGO);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Starting kernel...');

  useEffect(() => {
    const timers: (ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>)[] = [];

    const t1 = setTimeout(() => setPhase(PHASES.LOADING), 600);
    timers.push(t1);

    const t2 = setTimeout(() => {
      let p = 0;
      const iv = setInterval(() => {
        p += Math.random() * 12 + 4;
        if (p >= 100) { p = 100; clearInterval(iv); }
        setProgress(Math.min(p, 100));
        const step = [...LOADING_STEPS].reverse().find(s => p >= s.at);
        if (step) setLoadingText(step.text);
      }, 100);
      timers.push(iv);
    }, 600);
    timers.push(t2);

    const t3 = setTimeout(() => setPhase(PHASES.TRANSITION), 2400);
    timers.push(t3);

    const t4 = setTimeout(() => setPhase(PHASES.REVEAL), 3100);
    timers.push(t4);

    const t5 = setTimeout(() => {
      setPhase(PHASES.DONE);
      onComplete();
    }, 3900);
    timers.push(t5);

    return () => timers.forEach(t => {
      clearTimeout(t as ReturnType<typeof setTimeout>);
      clearInterval(t as ReturnType<typeof setInterval>);
    });
  }, [onComplete]);

  if (phase === PHASES.DONE) return null;

  const show = phase === PHASES.LOGO || phase === PHASES.LOADING;
  const fadeOut = phase === PHASES.TRANSITION;
  const reveal = phase === PHASES.REVEAL;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{
        background: reveal ? 'transparent' : '#0A0A0A',
        transition: reveal ? 'opacity 600ms ease' : undefined,
        opacity: reveal ? 0 : 1,
      }}
    >
      {/* Wallpaper peek during transition */}
      {(phase === PHASES.TRANSITION || phase === PHASES.REVEAL) && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/wallpaper-default.jpg)', opacity: 0.6 }}
        />
      )}

      {/* Boot content */}
      {(show || fadeOut) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            opacity: fadeOut ? 0 : 1,
            transform: fadeOut ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity 600ms ease, transform 600ms ease',
          }}
        >
          {/* Logo */}
          <div
            style={{
              opacity: phase >= PHASES.LOGO ? 1 : 0,
              transform: phase >= PHASES.LOGO ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(12px)',
              transition: 'all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              marginBottom: 20,
              animation: phase === PHASES.LOADING ? 'bootPulse 2s ease-in-out infinite' : undefined,
            }}
          >
            {/* Ubuntu-style logo */}
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="44" cy="44" r="44" fill="#1A1A1A" />
              <circle cx="44" cy="44" r="38" fill="none" stroke="#E95420" strokeWidth="3.5" opacity="0.9" />
              {/* Three Ubuntu dots */}
              <circle cx="44" cy="14" r="8" fill="#E95420" />
              <circle cx="18" cy="57" r="8" fill="#E95420" />
              <circle cx="70" cy="57" r="8" fill="#E95420" />
              {/* Connecting arcs (simplified) */}
              <line x1="44" y1="22" x2="25" y2="50" stroke="#E95420" strokeWidth="2.5" opacity="0.5" />
              <line x1="44" y1="22" x2="63" y2="50" stroke="#E95420" strokeWidth="2.5" opacity="0.5" />
              <line x1="25" y1="57" x2="62" y2="57" stroke="#E95420" strokeWidth="2.5" opacity="0.5" />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 26,
              fontWeight: 300,
              letterSpacing: '0.18em',
              color: '#E0E0E0',
              textTransform: 'uppercase',
              marginBottom: 32,
              opacity: phase >= PHASES.LOGO ? 1 : 0,
              transform: phase >= PHASES.LOGO ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 500ms ease 300ms',
            }}
          >
            WebLinuxOS
          </h1>

          {/* Progress bar */}
          {phase >= PHASES.LOADING && (
            <div style={{ opacity: 1, transition: 'opacity 300ms ease', marginBottom: 12 }}>
              <div
                style={{
                  width: 220,
                  height: 2,
                  borderRadius: 2,
                  background: 'rgba(233,84,32,0.2)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #E95420, #FF8A65)',
                    borderRadius: 2,
                    transition: 'width 80ms linear',
                    boxShadow: '0 0 8px rgba(233,84,32,0.6)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Loading text */}
          {phase >= PHASES.LOADING && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
              {loadingText}
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes bootPulse {
          0%,100% { opacity: 1; filter: drop-shadow(0 0 0px rgba(233,84,32,0)); }
          50%      { opacity: 0.85; filter: drop-shadow(0 0 12px rgba(233,84,32,0.5)); }
        }
      `}</style>
    </div>
  );
});

export default BootSequence;
