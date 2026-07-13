'use client';
import { useEffect, useState, memo } from 'react';

const BOOT_LINES = [
  '[  0.000000] Linux version 6.8.0-webos (WebLinuxOS)',
  '[  0.032415] BIOS-provided physical RAM map',
  '[  0.048122] ACPI: RSDP 0x00000000000F0490 000024 (v02 BOCHS)',
  '[  0.071839] PCI: Using configuration type 1 for base access',
  '[  0.095033] kernel: NOHZ: Precise Tick Timer enabled',
  '[  0.112847] initrd: init=/sbin/init',
  '[  0.138490] Mounted root filesystem successfully',
  '[  0.165772] Starting systemd...',
  '[  OK  ] Started D-Bus User Message Bus.',
  '[  OK  ] Started Network Manager.',
  '[  OK  ] Started WebLinux Desktop Manager.',
  '[  OK  ] Reached target Multi-User System.',
];

export default memo(function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'loading' | 'kernel' | 'done'>('logo');
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('loading'), 700);
    const t2 = setTimeout(() => setPhase('kernel'), 2000);
    const t3 = setTimeout(() => { setPhase('done'); onComplete(); }, 4200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  // Progress bar
  useEffect(() => {
    if (phase !== 'loading') return;
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) { p = 100; clearInterval(iv); }
      setProgress(p);
    }, 110);
    return () => clearInterval(iv);
  }, [phase]);

  // Kernel lines
  useEffect(() => {
    if (phase !== 'kernel') return;
    let i = 0;
    const iv = setInterval(() => {
      if (i >= BOOT_LINES.length) { clearInterval(iv); return; }
      setVisibleLines((prev) => [...prev, BOOT_LINES[i]]);
      i++;
    }, 140);
    return () => clearInterval(iv);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(124,77,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,77,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Logo phase */}
      {(phase === 'logo' || phase === 'loading') && (
        <div className="flex flex-col items-center gap-8 z-10">
          {/* Animated logo */}
          <div className="relative">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl font-black"
              style={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #00BCD4 100%)', boxShadow: '0 0 48px rgba(124,77,255,0.6)' }}
            >
              <span style={{ fontFamily: 'monospace' }}>λ</span>
            </div>
            {/* Orbiting ring */}
            <div
              className="absolute -inset-3 rounded-full border border-purple-500/40"
              style={{ animation: 'spin-slow 8s linear infinite' }}
            />
            <div
              className="absolute -inset-6 rounded-full border border-purple-500/20"
              style={{ animation: 'spin-slow 14s linear infinite reverse' }}
            />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-[0.3em]" style={{ fontFamily: 'monospace' }}>
              WebLinuxOS
            </h1>
            <p className="text-purple-400 text-sm mt-1 tracking-widest">v2.0.0 — Cloud Desktop</p>
          </div>

          {phase === 'loading' && (
            <div className="w-64 flex flex-col gap-2">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7C4DFF, #00BCD4)' }}
                />
              </div>
              <p className="text-purple-400/60 text-xs text-center tracking-widest">
                {progress < 35 ? 'LOADING KERNEL...' : progress < 70 ? 'INITIALIZING SERVICES...' : 'PREPARING DESKTOP...'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Kernel log phase */}
      {phase === 'kernel' && (
        <div
          className="w-full max-w-2xl mx-auto p-6 font-mono text-xs leading-5 z-10"
          style={{ color: '#22c55e' }}
        >
          {visibleLines.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span style={{ color: line.startsWith('[  OK') ? '#22c55e' : '#6b7280' }}>
                {line}
              </span>
            </div>
          ))}
          <div className="mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-4 bg-green-400" style={{ animation: 'bootPulse 0.8s ease infinite' }} />
          </div>
        </div>
      )}
    </div>
  );
});
