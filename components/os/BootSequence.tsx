'use client';
import { useEffect, useState, memo } from 'react';

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

// SVG icons for each step
function KernelIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke={active ? '#E95420' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="3" stroke={active ? '#E95420' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5"/>
      <line x1="12" y1="4" x2="12" y2="9" stroke={active ? '#E95420' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="15" x2="12" y2="20" stroke={active ? '#E95420' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4" y1="12" x2="9" y2="12" stroke={active ? '#E95420' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="12" x2="20" y2="12" stroke={active ? '#E95420' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function ServicesIcon({ active }: { active: boolean }) {
  const c = active ? '#E95420' : 'rgba(255,255,255,0.3)';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="20" r="1.5" fill={c}/>
    </svg>
  );
}
function DesktopIcon({ active }: { active: boolean }) {
  const c = active ? '#E95420' : 'rgba(255,255,255,0.3)';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke={c} strokeWidth="1.5"/>
      <path d="M8 21h8M12 17v4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function CloudIcon({ active }: { active: boolean }) {
  const c = active ? '#E95420' : 'rgba(255,255,255,0.3)';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 13v4M10 15l2-2 2 2" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const STEPS = [
  { id: 1, label: 'Initializing Kernel',        sub: 'Loading core modules…',          Icon: KernelIcon  },
  { id: 2, label: 'Starting Services',           sub: 'Network · Storage · Auth…',      Icon: ServicesIcon },
  { id: 3, label: 'Loading Desktop Environment', sub: 'Applying theme & preferences…',  Icon: DesktopIcon  },
  { id: 4, label: 'Syncing Cloud Data',          sub: 'Almost ready…',                  Icon: CloudIcon    },
] as const;

const STEP_DURATION  = 900;
const TOTAL_DURATION = 4200;

export default memo(function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [step,     setStep]     = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeOut,  setFadeOut]  = useState(false);

  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / (TOTAL_DURATION - 400)) * 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(iv);
    }, 40);

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStep(1), 300));
    timers.push(setTimeout(() => setStep(2), 300 + STEP_DURATION));
    timers.push(setTimeout(() => setStep(3), 300 + STEP_DURATION * 2));
    timers.push(setTimeout(() => setStep(4), 300 + STEP_DURATION * 3));
    timers.push(setTimeout(() => setFadeOut(true), TOTAL_DURATION - 500));
    timers.push(setTimeout(() => onComplete(),     TOTAL_DURATION));

    return () => { clearInterval(iv); timers.forEach(clearTimeout); };
  }, [onComplete]);

  const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#080608] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ transition: 'opacity 600ms ease', opacity: fadeOut ? 0 : 1 }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(233,84,32,0.12) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }} />

      {/* Ambient glow */}
      <div className="absolute pointer-events-none"
        style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(233,84,32,0.08) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-55%)' }} />
      <div className="absolute pointer-events-none"
        style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(120,50,200,0.06) 0%, transparent 70%)', top: '30%', left: '60%', transform: 'translate(-50%,-50%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-10">

        {/* Logo ring */}
        <div className="relative flex items-center justify-center" style={{ width: 190, height: 190 }}>
          {/* Outer slow ring */}
          <div className="absolute rounded-full"
            style={{ inset: 0, border: '1px solid rgba(233,84,32,0.15)', animation: 'wlos-spin 16s linear infinite' }} />
          {/* Tick marks on outer ring */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute" style={{
              width: 2, height: i % 3 === 0 ? 8 : 4,
              background: i < (step / 4) * 12 ? 'rgba(233,84,32,0.8)' : 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              top: '50%', left: '50%',
              transformOrigin: '0 -94px',
              transform: `rotate(${i * 30}deg) translateX(-1px) translateY(-94px)`,
              transition: 'background 0.5s',
            }} />
          ))}
          {/* Middle dashed ring */}
          <div className="absolute rounded-full"
            style={{ inset: 20, border: '1.5px dashed rgba(233,84,32,0.22)', animation: 'wlos-spin 10s linear infinite reverse' }} />
          {/* Inner solid ring */}
          <div className="absolute rounded-full"
            style={{ inset: 40, border: '1.5px solid rgba(233,84,32,0.45)', animation: 'wlos-spin 5s linear infinite' }} />

          {/* SVG arc */}
          <svg className="absolute" style={{ inset: 0, width: '100%', height: '100%' }} viewBox="0 0 190 190">
            <circle cx="95" cy="95" r="80" fill="none" stroke="rgba(233,84,32,0.06)" strokeWidth="3" />
            <circle cx="95" cy="95" r="80" fill="none" stroke="#E95420" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
              transform="rotate(-90 95 95)"
              style={{ transition: 'stroke-dashoffset 0.08s ease', filter: 'drop-shadow(0 0 6px rgba(233,84,32,0.9))' }} />
          </svg>

          {/* Logo */}
          <div className="relative z-10 w-24 h-24 rounded-[28px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #2C1810 0%, #130806 100%)',
              boxShadow: '0 0 50px rgba(233,84,32,0.45), 0 0 100px rgba(233,84,32,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
              animation: step >= 1 ? 'bootLogoGlow 2s ease-in-out infinite' : 'none',
            }}>
            <UbuntuLogo size={58} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-bold text-white tracking-[0.25em]"
            style={{ fontSize: 30, fontFamily: '"Ubuntu", system-ui, sans-serif', letterSpacing: '0.22em',
              textShadow: '0 0 40px rgba(233,84,32,0.3)' }}>
            WebLinuxOS
          </h1>
          <p className="text-[11px] mt-1 tracking-[0.35em] uppercase" style={{ color: 'rgba(233,84,32,0.60)' }}>
            v2.0.0 · Cloud Desktop
          </p>
        </div>

        {/* Steps — icon-based */}
        <div className="flex flex-col items-center gap-3" style={{ width: 320 }}>

          {/* Step row */}
          <div className="flex items-center w-full">
            {STEPS.map((s, i) => {
              const done   = step > s.id;
              const active = step === s.id;
              const { Icon } = s;
              return (
                <div key={s.id} className="flex items-center" style={{ flex: 1 }}>
                  {/* Icon bubble */}
                  <div className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-500"
                    style={{
                      width: 34, height: 34,
                      background: done
                        ? 'linear-gradient(135deg, #E95420, #c03d10)'
                        : active
                          ? 'rgba(233,84,32,0.18)'
                          : 'rgba(255,255,255,0.04)',
                      border: active
                        ? '1.5px solid #E95420'
                        : done
                          ? 'none'
                          : '1.5px solid rgba(255,255,255,0.10)',
                      boxShadow: active
                        ? '0 0 0 4px rgba(233,84,32,0.15), 0 0 16px rgba(233,84,32,0.5)'
                        : done
                          ? '0 2px 8px rgba(233,84,32,0.3)'
                          : 'none',
                    }}>
                    {done ? <CheckIcon /> : <Icon active={active} />}
                  </div>
                  {/* Connector */}
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px transition-all duration-700 mx-1"
                      style={{ background: done
                        ? 'linear-gradient(90deg, #E95420 0%, rgba(233,84,32,0.3) 100%)'
                        : 'rgba(255,255,255,0.06)' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step labels below each icon */}
          <div className="flex w-full mt-0.5">
            {STEPS.map((s) => {
              const done   = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center" style={{ minWidth: 0 }}>
                  <span className="text-[9px] text-center leading-tight transition-all duration-300 px-0.5"
                    style={{
                      color: done ? '#E95420' : active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                      fontWeight: active ? 600 : 400,
                    }}>
                    {s.label.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active step description */}
          <div className="text-center mt-1" style={{ minHeight: 36 }}>
            {step >= 1 && step <= 4 && (
              <div style={{ animation: 'bootStepIn 0.4s ease-out' }}>
                <p className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>
                  {STEPS[step - 1]?.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(233,84,32,0.55)', fontFamily: 'monospace' }}>
                  {STEPS[step - 1]?.sub}
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full rounded-full overflow-hidden" style={{ height: 2.5, background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6B1E08, #E95420, #FF7043)',
                transition: 'width 0.08s linear',
                boxShadow: '0 0 12px rgba(233,84,32,0.9)',
              }} />
          </div>
          <p className="text-[10px] tabular-nums" style={{ color: 'rgba(233,84,32,0.40)', fontFamily: 'monospace' }}>
            {Math.floor(progress)}%
          </p>
        </div>
      </div>

      {/* Bottom badge */}
      <div className="absolute bottom-6 flex items-center gap-2"
        style={{ opacity: 0.22, fontSize: 11, color: 'white' }}>
        <UbuntuLogo size={12} />
        <span>Ubuntu 24.04 LTS compatible</span>
      </div>
    </div>
  );
});
