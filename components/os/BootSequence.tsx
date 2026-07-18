'use client';
import { useState, useEffect, memo } from 'react';
import { Cpu, Wifi, Monitor, Cloud, Check, Shield, HardDrive, Zap } from 'lucide-react';

const STEPS = [
  { id: 'kernel',   Icon: Cpu,       label: 'Loading Kernel',      sub: 'Initializing system core',    color: '#E95420', delay: 0 },
  { id: 'storage',  Icon: HardDrive, label: 'Mounting Storage',    sub: 'Neon DB · Cloud filesystem',  color: '#7C4DFF', delay: 600 },
  { id: 'network',  Icon: Wifi,      label: 'Network Stack',       sub: 'Establishing cloud tunnel',   color: '#22c55e', delay: 1200 },
  { id: 'security', Icon: Shield,    label: 'Security Layer',      sub: 'NextAuth · Prisma layer',     color: '#f59e0b', delay: 1800 },
  { id: 'display',  Icon: Monitor,   label: 'Display Server',      sub: 'Next.js · WebGL compositor',  color: '#60a5fa', delay: 2400 },
  { id: 'power',    Icon: Zap,       label: 'Services Online',     sub: '54 apps ready',               color: '#a78bfa', delay: 2900 },
  { id: 'sync',     Icon: Cloud,     label: 'Cloud Sync Active',   sub: 'Session authenticated',       color: '#34d399', delay: 3300 },
];

export default memo(function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [activeStep, setActiveStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    STEPS.forEach((step, idx) => {
      const t = setTimeout(() => {
        setActiveStep(idx);
        setProgress(Math.round(((idx + 0.5) / STEPS.length) * 100));
      }, step.delay);
      const done = setTimeout(() => {
        setDoneSteps(prev => new Set([...prev, idx]));
        setProgress(Math.round(((idx + 1) / STEPS.length) * 100));
      }, step.delay + 480);
      return () => { clearTimeout(t); clearTimeout(done); };
    });

    const finish = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(onComplete, 600);
      }, 500);
    }, STEPS[STEPS.length - 1].delay + 900);

    return () => clearTimeout(finish);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0e0520 0%, #050208 60%, #000 100%)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(124,77,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,77,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          animation: 'gridScroll 20s linear infinite',
        }} />
        {/* Ambient orbs */}
        {[
          { x: '20%', y: '30%', c: '#E95420', s: 300 },
          { x: '75%', y: '60%', c: '#7C4DFF', s: 400 },
          { x: '50%', y: '80%', c: '#22c55e', s: 250 },
        ].map((o, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              left: o.x, top: o.y,
              width: o.s, height: o.s,
              background: `radial-gradient(circle, ${o.c}15, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
              animation: `orbPulse ${3 + i}s ease-in-out infinite alternate`,
            }} />
        ))}
      </div>

      {/* Logo */}
      <div className="relative mb-10 z-10">
        <div className="relative w-20 h-20">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full animate-spin"
            style={{ border: '1.5px solid transparent', borderTopColor: '#E95420', animationDuration: '3s' }} />
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full animate-spin"
            style={{ border: '1px solid transparent', borderTopColor: '#7C4DFF', animationDuration: '2s', animationDirection: 'reverse' }} />
          {/* Logo center */}
          <div className="absolute inset-4 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(233,84,32,0.15)', border: '1px solid rgba(233,84,32,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 100 100">
              <circle cx="50" cy="9"  r="9"  fill="#E95420"/>
              <circle cx="14" cy="71" r="9"  fill="#E95420"/>
              <circle cx="86" cy="71" r="9"  fill="#E95420"/>
              <path d="M50 18 A32 32 0 0 1 77.7 64" stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <path d="M77.7 64 A32 32 0 0 1 22.3 64" stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <path d="M22.3 64 A32 32 0 0 1 50 18" stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        {/* Glow */}
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(233,84,32,0.2) 0%, transparent 70%)', filter: 'blur(20px)' }} />
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-white mb-1 z-10 tracking-wide"
        style={{ textShadow: '0 0 30px rgba(233,84,32,0.5)' }}>
        WebLinuxOS
      </h1>
      <p className="text-[11px] text-white/30 mb-10 z-10 tracking-[0.2em] uppercase">
        Cloud Desktop Environment v3
      </p>

      {/* Steps */}
      <div className="flex flex-col gap-2.5 w-80 z-10 mb-8">
        {STEPS.map((step, idx) => {
          const isDone = doneSteps.has(idx);
          const isActive = activeStep === idx && !isDone;
          const isPending = idx > activeStep;
          return (
            <div key={step.id}
              className="flex items-center gap-3 transition-all duration-300"
              style={{ opacity: isPending ? 0.25 : 1, transform: isPending ? 'translateX(-8px)' : 'translateX(0)' }}>

              {/* Icon bubble */}
              <div className="relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  background: isDone ? `${step.color}25` : isActive ? `${step.color}20` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isDone ? step.color + '50' : isActive ? step.color + '40' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isDone ? `0 0 12px ${step.color}25` : isActive ? `0 0 8px ${step.color}20` : 'none',
                }}>
                {isDone
                  ? <Check size={13} style={{ color: step.color }} strokeWidth={2.5} />
                  : <step.Icon size={13}
                      style={{ color: isActive ? step.color : 'rgba(255,255,255,0.3)' }}
                      className={isActive ? 'animate-pulse' : ''} />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold leading-tight"
                  style={{ color: isDone ? 'rgba(255,255,255,0.85)' : isActive ? 'white' : 'rgba(255,255,255,0.3)' }}>
                  {step.label}
                </p>
                <p className="text-[9px] leading-tight"
                  style={{ color: isActive ? step.color : 'rgba(255,255,255,0.2)' }}>
                  {isActive ? '▸ ' : isDone ? '✓ ' : ''}{step.sub}
                </p>
              </div>

              {/* Active spinner */}
              {isActive && (
                <div className="w-3 h-3 rounded-full border-2 border-transparent flex-shrink-0 animate-spin"
                  style={{ borderTopColor: step.color }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-80 z-10">
        <div className="flex justify-between text-[9px] mb-1.5">
          <span className="text-white/25 uppercase tracking-widest">Boot Progress</span>
          <span className="font-mono" style={{ color: '#E95420' }}>{progress}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #E95420, #7C4DFF, #22c55e)',
              boxShadow: '0 0 8px rgba(233,84,32,0.6)',
            }} />
        </div>
      </div>

      {/* Version tag */}
      <p className="absolute bottom-6 text-[9px] text-white/15 z-10 tracking-widest">
        WebLinuxOS 3.0 LTS · Next.js 14 · Neon DB
      </p>

      <style>{`
        @keyframes gridScroll {
          from { backgroundPosition: 0 0; }
          to   { backgroundPosition: 60px 60px; }
        }
        @keyframes orbPulse {
          from { opacity: 0.4; transform: translate(-50%, -50%) scale(0.95); }
          to   { opacity: 0.9; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
});
