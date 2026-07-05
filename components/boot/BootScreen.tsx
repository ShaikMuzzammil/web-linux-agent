"use client";
import { useEffect, useState } from "react";

const LOG_LINES = [
  "[    0.000000] Linux version 5.15.0-91-generic (buildd@lcy02-amd64-017)",
  "[    0.000001] Command line: BOOT_IMAGE=/vmlinuz-5.15.0-91-generic root=/dev/sda1 ro quiet splash",
  "[    0.000100] ACPI: RSDP 0x000F05B0 000024 (v02 BOCHS )",
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
];

type Phase = "logs" | "logo" | "splash";

export default function BootScreen() {
  const [phase, setPhase] = useState<Phase>("logs");
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);

  // Show log lines
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setVisibleLogs((p) => [...p, LOG_LINES[i]]);
      i++;
      if (i >= LOG_LINES.length) clearInterval(id);
    }, 70);
    return () => clearInterval(id);
  }, []);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"),   1400);
    const t2 = setTimeout(() => setPhase("splash"), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col overflow-hidden"
      style={{ fontFamily: "'Ubuntu Mono', 'Courier New', monospace" }}
    >
      {/* Log phase */}
      {phase === "logs" && (
        <div className="flex-1 p-4 overflow-hidden text-xs leading-5">
          {visibleLogs.map((line, i) => (
            <div key={i}>
              {line.startsWith("[  OK  ]") ? (
                <>
                  <span className="text-green-400">[  OK  ]</span>
                  <span className="text-gray-300">{line.slice(8)}</span>
                </>
              ) : (
                <span className="text-green-600 opacity-80">{line}</span>
              )}
            </div>
          ))}
          <span className="text-green-400 animate-pulse">_</span>
        </div>
      )}

      {/* Logo phase */}
      {phase === "logo" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-10">
          <svg
            viewBox="0 0 100 100"
            className="w-28 h-28"
            style={{ animation: "bootPulse 1.4s ease-in-out infinite" }}
          >
            <circle cx="50" cy="50" r="47" fill="none" stroke="#E95420" strokeWidth="3" opacity="0.4" />
            <circle cx="50" cy="12" r="10" fill="#E95420" />
            <circle cx="14" cy="72" r="10" fill="#E95420" />
            <circle cx="86" cy="72" r="10" fill="#E95420" />
            <path d="M50 22 A28 28 0 0 1 74 62" stroke="#E95420" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M74 62 A28 28 0 0 1 26 62" stroke="#E95420" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M26 62 A28 28 0 0 1 50 22" stroke="#E95420" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
          <LoadingDots />
        </div>
      )}

      {/* Splash phase */}
      {phase === "splash" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <div
              className="text-6xl font-light tracking-[0.3em] text-white mb-2"
              style={{ fontFamily: "Ubuntu, sans-serif" }}
            >
              ubuntu
            </div>
            <div className="text-white/40 text-sm tracking-widest">22.04.3 LTS</div>
          </div>
          <LoadingDots />
          <div className="absolute bottom-6 text-white/25 text-xs tracking-widest">
            SHAIK MUZZAMMIL — WEB LINUX AGENT
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex gap-2.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full"
          style={{
            background: "#E95420",
            animation: `loadingDot 1.2s ease-in-out ${i * 0.16}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes loadingDot {
          0%,80%,100% { transform:scale(0.25); opacity:0.25; }
          40%          { transform:scale(1);    opacity:1;    }
        }
      `}</style>
    </div>
  );
}
