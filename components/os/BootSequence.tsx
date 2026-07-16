'use client';
import { useEffect, useState, memo } from 'react';

// ── Ubuntu circle-of-friends logo (inline SVG) ─────────────
function UbuntuLogo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="9"  r="9"  fill="#E95420" />
      <circle cx="14" cy="71" r="9"  fill="#E95420" />
      <circle cx="86" cy="71" r="9"  fill="#E95420" />
      <path d="M50 18 A32 32 0 0 1 77.7 64" stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M77.7 64 A32 32 0 0 1 22.3 64" stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M22.3 64 A32 32 0 0 1 50 18"  stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <circle cx="50" cy="9"  r="4" fill="white"/>
      <circle cx="14" cy="71" r="4" fill="white"/>
      <circle cx="86" cy="71" r="4" fill="white"/>
    </svg>
  );
}

// ── Steps config ──────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Initializing Kernel',       sub: 'Loading core modules…'          },
  { id: 2, label: 'Starting Services',          sub: 'Network · Storage · Auth…'      },
  { id: 3, label: 'Loading Desktop Environment', sub: 'Applying theme & preferences…' },
  { id: 4, label: 'Syncing Cloud Data',         sub: 'Almost ready…'                 },
] as const;

const STEP_DURATION  = 900;   // ms each step stays active
const TOTAL_DURATION = 4800;  // ms before onComplete fires

export default memo(function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [step,     setStep]     = useState(0);   // 0 = logo-only, 1-4 = active step
  const [progress, setProgress] = useState(0);
  const [fadeOut,  setFadeOut]  = useState(false);

  // ── Boot timeline ────────────────────────────────────────────
  useEffect(() => {
    // Progress bar
    const start  = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / (TOTAL_DURATION - 400)) * 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(iv);
    }, 40);

    // Step advances
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStep(1), 400));
    timers.push(setTimeout(() => setStep(2), 400 + STEP_DURATION * 1));
    timers.push(setTimeout(() => setStep(3), 400 + STEP_DURATION * 2));
    timers.push(setTimeout(() => setStep(4), 400 + STEP_DURATION * 3));
    // Fade out then complete
    timers.push(setTimeout(() => setFadeOut(true), TOTAL_DURATION - 500));
    timers.push(setTimeout(() => onComplete(),     TOTAL_DURATION));

    return () => { clearInterval(iv); timers.forEach(clearTimeout); };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#0a0808] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        transition: 'opacity 500ms ease',
        opacity: fadeOut ? 0 : 1,
      }}
    >

      {/* ── Subtle dot grid ─────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(233,84,32,0.13) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.6,
        }}
      />

      {/* ── Deep radial glow ─────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(233,84,32,0.10) 0%, transparent 65%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-55%)',
        }}
      />

      {/* ── Main content ──────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-10">

        {/* Spinning rings + logo */}
        <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>

          {/* Outer slow ring */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 0,
              border: '1px solid rgba(233,84,32,0.18)',
              animation: 'wlos-spin 14s linear infinite',
            }}
          />

          {/* Dashed mid ring */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 18,
              border: '1.5px dashed rgba(233,84,32,0.28)',
              animation: 'wlos-spin 9s linear infinite reverse',
            }}
          />

          {/* Inner fast solid ring */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 36,
              border: '1.5px solid rgba(233,84,32,0.50)',
              animation: 'wlos-spin 4.5s linear infinite',
            }}
          />

          {/* Progress arc overlay (SVG) */}
          <svg
            className="absolute"
            style={{ inset: 0, width: '100%', height: '100%' }}
            viewBox="0 0 180 180"
          >
            <circle
              cx="90" cy="90" r="72"
              fill="none"
              stroke="rgba(233,84,32,0.08)"
              strokeWidth="2"
            />
            <circle
              cx="90" cy="90" r="72"
              fill="none"
              stroke="#E95420"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 72}`}
              strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress / 100)}`}
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 0.1s ease', filter: 'drop-shadow(0 0 5px rgba(233,84,32,0.8))' }}
            />
          </svg>

          {/* Logo pill */}
          <div
            className="relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #2C1810 0%, #180d08 100%)',
              boxShadow: '0 0 48px rgba(233,84,32,0.50), 0 0 90px rgba(233,84,32,0.18), 0 0 0 1px rgba(233,84,32,0.3)',
            }}
          >
            <UbuntuLogo size={60} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="font-bold text-white tracking-[0.25em]"
            style={{ fontSize: 30, fontFamily: '"Ubuntu", system-ui, sans-serif', letterSpacing: '0.22em' }}
          >
            WebLinuxOS
          </h1>
          <p className="text-[11px] mt-1 tracking-[0.35em] uppercase" style={{ color: 'rgba(233,84,32,0.65)' }}>
            v2.0.0 · Cloud Desktop
          </p>
        </div>

        {/* ── Steps ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3" style={{ width: 300 }}>

          {/* Step indicators */}
          <div className="flex items-center gap-0 w-full mb-1">
            {STEPS.map((s, i) => {
              const done    = step > s.id;
              const active  = step === s.id;
              return (
                <div key={s.id} className="flex items-center" style={{ flex: 1 }}>
                  {/* Dot */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-500"
                    style={{
                      width: 22, height: 22,
                      background: done
                        ? '#E95420'
                        : active
                          ? 'rgba(233,84,32,0.25)'
                          : 'rgba(255,255,255,0.05)',
                      border: active
                        ? '1.5px solid #E95420'
                        : done
                          ? 'none'
                          : '1.5px solid rgba(255,255,255,0.12)',
                      boxShadow: active ? '0 0 12px rgba(233,84,32,0.6)' : 'none',
                    }}
                  >
                    {done ? (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span
                        className="text-[9px] font-bold"
                        style={{ color: active ? '#E95420' : 'rgba(255,255,255,0.25)' }}
                      >{s.id}</span>
                    )}
                  </div>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="flex-1 h-px transition-all duration-700"
                      style={{
                        background: done
                          ? 'linear-gradient(90deg, #E95420, rgba(233,84,32,0.4))'
                          : 'rgba(255,255,255,0.07)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Active step label */}
          <div className="text-center" style={{ minHeight: 36 }}>
            {step >= 1 && step <= 4 && (
              <>
                <p
                  className="text-[13px] font-semibold transition-all duration-400"
                  style={{ color: 'rgba(255,255,255,0.88)' }}
                >
                  {STEPS[step - 1]?.label}
                </p>
                <p
                  className="text-[11px] mt-0.5 transition-all duration-400"
                  style={{ color: 'rgba(233,84,32,0.60)', fontFamily: 'monospace' }}
                >
                  {STEPS[step - 1]?.sub}
                </p>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #8B3A20, #E95420, #FF7043)',
                transition: 'width 0.08s ease',
                boxShadow: '0 0 10px rgba(233,84,32,0.85)',
              }}
            />
          </div>

          {/* Progress % */}
          <p
            className="text-[10px] tabular-nums"
            style={{ color: 'rgba(233,84,32,0.45)', fontFamily: 'monospace' }}
          >
            {Math.floor(progress)}%
          </p>
        </div>
      </div>

      {/* ── Bottom Ubuntu badge ────────────────────── */}
      <div
        className="absolute bottom-6 flex items-center gap-2"
        style={{ opacity: 0.28, fontSize: 11, color: 'white', fontFamily: 'system-ui, sans-serif' }}
      >
        <UbuntuLogo size={13} />
        <span>Ubuntu 24.04 LTS compatible</span>
      </div>
    </div>
  );
});
