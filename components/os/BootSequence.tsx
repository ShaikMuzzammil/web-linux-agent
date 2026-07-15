'use client';
import { useEffect, useState, memo } from 'react';

const BOOT_LINES: string[] = [
  '[    0.000000] Linux version 6.8.0-webos (gcc 14.2.0) #1 SMP PREEMPT',
  '[    0.000000] BIOS-provided physical RAM map:',
  '[    0.000000] ACPI: RSDP 0x00000000000F0490 000024 (v02 BOCHS )',
  '[    0.032415] PCI: Using configuration type 1 for base access',
  '[    0.048122] kernel: clocksource: tsc-early: mask: 0xffffffff',
  '[    0.071839] ACPI: IRQ0 used by override.',
  '[    0.095033] kernel: NOHZ: Precise Tick Timer enabled',
  '[    0.112847] initrd: init=/sbin/init cp=/proc/cmdline',
  '[    0.138490] Mounted root filesystem (ext4) successfully',
  '[    0.165772] Starting systemd (version 255.4-1ubuntu8.4)...',
  '[    0.198000] systemd[1]: Inserted module \'autofs4\'',
  '[    0.223000] systemd[1]: systemd 255.4-1ubuntu8.4 running in system mode',
  '[  OK  ] Finished Kernel Module Loader.',
  '[  OK  ] Finished Load/Save Random Seed.',
  '[  OK  ] Started D-Bus User Message Bus.',
  '[  OK  ] Started Network Manager.',
  '[  OK  ] Reached target Network.',
  '[  OK  ] Started OpenSSH server daemon.',
  '[  OK  ] Started WebLinuxOS Cloud Sync.',
  '[  OK  ] Started WebLinux Desktop Manager (v2.0.0).',
  '[  OK  ] Reached target Graphical Interface.',
  '[  OK  ] Reached target Multi-User System.',
];

// Ubuntu circle-of-friends SVG (inline, no external dep)
function UbuntuLogo({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Three people (circles) */}
      <circle cx="50" cy="9"  r="9"  fill="#E95420" />
      <circle cx="14" cy="71" r="9"  fill="#E95420" />
      <circle cx="86" cy="71" r="9"  fill="#E95420" />

      {/* Arms connecting them — thicker arcs */}
      <path
        d="M50 18 A32 32 0 0 1 77.7 64"
        stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"
      />
      <path
        d="M77.7 64 A32 32 0 0 1 22.3 64"
        stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"
      />
      <path
        d="M22.3 64 A32 32 0 0 1 50 18"
        stroke="#E95420" strokeWidth="6" fill="none" strokeLinecap="round"
      />

      {/* Inner white dots (people's faces) */}
      <circle cx="50" cy="9"  r="4"  fill="white" />
      <circle cx="14" cy="71" r="4"  fill="white" />
      <circle cx="86" cy="71" r="4"  fill="white" />
    </svg>
  );
}

export default memo(function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'loading' | 'kernel' | 'done'>('logo');
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('loading'), 800);
    const t2 = setTimeout(() => setPhase('kernel'), 2200);
    const t3 = setTimeout(() => { setPhase('done'); onComplete(); }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  // Progress bar fill
  useEffect(() => {
    if (phase !== 'loading') return;
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 14 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); }
      setProgress(p);
    }, 100);
    return () => clearInterval(iv);
  }, [phase]);

  // Kernel log lines — safe access with index guard
  useEffect(() => {
    if (phase !== 'kernel') return;
    setVisibleLines([]);
    let i = 0;
    const iv = setInterval(() => {
      if (i >= BOOT_LINES.length) { clearInterval(iv); return; }
      const line = BOOT_LINES[i];
      if (typeof line === 'string') {
        setVisibleLines((prev) => [...prev, line]);
      }
      i++;
    }, 120);
    return () => clearInterval(iv);
  }, [phase]);

  if (phase === 'done') return null;

  const logoLabel = phase === 'loading'
    ? (progress < 35 ? 'LOADING KERNEL…' : progress < 70 ? 'INITIALISING SERVICES…' : 'PREPARING DESKTOP…')
    : 'STARTING WEBLINUXOS…';

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden select-none">

      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(233,84,32,1) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(233,84,32,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial glow behind logo */}
      <div
        className="absolute"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(233,84,32,0.12) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── LOGO + LOADING PHASE ── */}
      {(phase === 'logo' || phase === 'loading') && (
        <div className="flex flex-col items-center gap-10 z-10">

          {/* Spinning rings + Ubuntu logo */}
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>

            {/* Outer slow ring */}
            <div
              className="absolute rounded-full"
              style={{
                inset: 0,
                border: '1.5px solid rgba(233,84,32,0.25)',
                animation: 'wlos-spin 12s linear infinite',
              }}
            />
            {/* Dashed mid ring */}
            <div
              className="absolute rounded-full"
              style={{
                inset: 14,
                border: '1.5px dashed rgba(233,84,32,0.35)',
                animation: 'wlos-spin 8s linear infinite reverse',
              }}
            />
            {/* Inner fast ring */}
            <div
              className="absolute rounded-full"
              style={{
                inset: 28,
                border: '1.5px solid rgba(233,84,32,0.5)',
                animation: 'wlos-spin 4s linear infinite',
              }}
            />

            {/* Ubuntu logo pill */}
            <div
              className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #2C1810 0%, #1a0f0a 100%)',
                boxShadow: '0 0 40px rgba(233,84,32,0.55), 0 0 80px rgba(233,84,32,0.2)',
                border: '1px solid rgba(233,84,32,0.4)',
              }}
            >
              <UbuntuLogo size={52} />
            </div>
          </div>

          {/* Text */}
          <div className="text-center flex flex-col items-center gap-1.5">
            <h1
              className="text-white font-bold tracking-[0.28em]"
              style={{ fontSize: 28, fontFamily: 'system-ui, "Ubuntu", sans-serif' }}
            >
              WebLinuxOS
            </h1>
            <p className="text-[11px] tracking-widest" style={{ color: '#E95420', opacity: 0.8 }}>
              v2.0.0 — Cloud Desktop
            </p>
          </div>

          {/* Progress bar */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center gap-3" style={{ width: 260 }}>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #AE4E1E, #E95420, #FF7043)',
                    transition: 'width 0.1s ease',
                    boxShadow: '0 0 8px rgba(233,84,32,0.8)',
                  }}
                />
              </div>
              <p
                className="text-[10px] tracking-[0.2em]"
                style={{ color: 'rgba(233,84,32,0.65)', fontFamily: 'monospace' }}
              >
                {logoLabel}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── KERNEL LOG PHASE ── */}
      {phase === 'kernel' && (
        <div
          className="w-full max-w-2xl mx-auto px-6 py-4 z-10 overflow-hidden"
          style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: '1.6' }}
        >
          {visibleLines.map((line, idx) => {
            // Safe null/undefined guard
            if (typeof line !== 'string') return null;
            const isOk    = line.startsWith('[  OK  ]');
            const isError = line.startsWith('[FAILED]');
            const color   = isOk ? '#4ADE80' : isError ? '#F87171' : '#6B7280';
            return (
              <div key={idx} className="flex">
                <span style={{ color }}>{line}</span>
              </div>
            );
          })}
          {/* Blinking cursor */}
          <div className="flex items-center gap-1 mt-1">
            <span
              className="inline-block"
              style={{
                width: 7, height: 14,
                background: '#4ADE80',
                animation: 'bootPulse 0.8s ease infinite',
              }}
            />
          </div>
        </div>
      )}

      {/* Ubuntu-style bottom badge */}
      <div
        className="absolute bottom-6 flex items-center gap-2 opacity-30"
        style={{ fontSize: 11, color: 'white', fontFamily: 'system-ui, sans-serif' }}
      >
        <UbuntuLogo size={14} />
        <span>Ubuntu 24.04 LTS compatible</span>
      </div>
    </div>
  );
});
