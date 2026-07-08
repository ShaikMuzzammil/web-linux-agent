"use client";
import { useState, useEffect } from "react";

const LOG_LINES: string[] = [
  "[    0.000000] Linux version 5.15.0-91-generic (buildd@lcy02-amd64-017)",
  "[    0.000100] ACPI: RSDP 0x00F0580 000024 (v02 BOCHS )",
  "[    0.000210] PCI: Using configuration type 1 for base access",
  "[    0.001234] clocksource: tsc-early: mask: 0xffffffffffffffff",
  "[    0.003456] NET: Registered PF_INET6 protocol family",
  "[    0.004112] Initializing XFRM netlink socket",
  "[    0.006213] Loaded X.509 cert 'Canonical Ltd. Kernel Module Signing Key'",
  "[    0.008901] AppArmor: AppArmor sha256 policy hashing enabled",
  "[    0.010234] Loading initial ramdisk ...",
  "[    0.015443] Mounted devtmpfs on /dev",
  "[    0.018901] EXT4-fs (sda1): mounted filesystem with ordered data mode",
  "[    0.021234] systemd[1]: systemd 249.11-0ubuntu3.9 running in system mode",
  "[  OK  ] Started Network Name Resolution.",
  "[  OK  ] Started Network Manager.",
  "[  OK  ] Reached target Network.",
  "[  OK  ] Started GNOME Display Manager.",
  "[  OK  ] Reached target Graphical Interface.",
  "[  OK  ] Started Session 1 of User muzzammil.",
];

type Phase = "boot" | "logo" | "splash";

export default function BootScreen() {
  const [phase, setPhase]           = useState<Phase>("boot");
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [dots, setDots]             = useState(0);

  // Scroll log stream — guard against out-of-bounds undefined
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < LOG_LINES.length) {
        const line = LOG_LINES[i];
        if (line !== undefined) {
          setVisibleLogs((p) => [...p, line]);
        }
        i++;
      } else {
        clearInterval(id);
      }
    }, 70);
    return () => clearInterval(id);
  }, []);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"),   1400);
    const t2 = setTimeout(() => setPhase("splash"), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Loading dots
  useEffect(() => {
    if (phase !== "splash") return;
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 350);
    return () => clearInterval(id);
  }, [phase]);

  /* ── Phase: boot log ── */
  if (phase === "boot") {
    return (
      <div className="fixed inset-0 bg-black overflow-hidden font-mono text-xs leading-relaxed p-4"
        style={{ color: "#aaffa4" }}>
        {visibleLogs.map((line, i) => {
          // Null-safe startsWith — prevents "can't access property startsWith" crash
          const isOk = typeof line === "string" && line.startsWith("[  OK  ]");
          return (
            <div key={i} style={{ color: isOk ? "#00ff88" : "#aaffa4" }}>
              {isOk
                ? <><span style={{ color: "#00ff88" }}>[  OK  ]</span>{line.slice(8)}</>
                : line}
            </div>
          );
        })}
        <div className="mt-1 opacity-75">_</div>
      </div>
    );
  }

  /* ── Phase: Ubuntu logo ── */
  if (phase === "logo") {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-8">
        {/* Ubuntu circle-of-friends SVG logo */}
        <svg width="90" height="90" viewBox="0 0 90 90"
          style={{ animation: "bootPulse 1.5s ease-in-out infinite" }}>
          <circle cx="45" cy="45" r="42" fill="none" stroke="#E95420" strokeWidth="3" />
          {[0, 120, 240].map((deg) => {
            const rad = (deg - 90) * (Math.PI / 180);
            const cx  = 45 + 28 * Math.cos(rad);
            const cy  = 45 + 28 * Math.sin(rad);
            return <circle key={deg} cx={cx} cy={cy} r="9" fill="#E95420" />;
          })}
          <circle cx="45" cy="45" r="14" fill="#E95420" />
        </svg>
        <p className="text-white/40 text-sm tracking-widest uppercase">Ubuntu 22.04 LTS</p>
      </div>
    );
  }

  /* ── Phase: splash / loading dots ── */
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-10"
      style={{ background: "linear-gradient(135deg,#2C001E 0%,#3b0f2f 50%,#1a0a12 100%)" }}>
      <svg width="80" height="80" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="42" fill="none" stroke="#E95420" strokeWidth="3" opacity=".7" />
        {[0, 120, 240].map((deg) => {
          const rad = (deg - 90) * (Math.PI / 180);
          return (
            <circle key={deg}
              cx={45 + 28 * Math.cos(rad)}
              cy={45 + 28 * Math.sin(rad)}
              r="9" fill="#E95420" />
          );
        })}
        <circle cx="45" cy="45" r="14" fill="#E95420" />
      </svg>

      <p className="text-white text-xl font-light tracking-widest">
        Web Linux Agent <span className="text-orange-400 font-semibold">v2</span>
      </p>

      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: dots > i ? "#E95420" : "rgba(255,255,255,0.2)",
              transition: "background 0.3s",
            }} />
        ))}
      </div>

      <p className="text-white/30 text-xs tracking-widest absolute bottom-8">
        © 2025 Shaik Muzzammil · Ubuntu 22.04 LTS
      </p>
    </div>
  );
}
