"use client";
import { useState, useEffect, useCallback } from "react";
import { useDesktopStore } from "@/store/desktopStore";
import { signIn, useSession } from "next-auth/react";

type Mode = "idle" | "signin" | "signup";

export default function LockScreen() {
  const { setIsLocked } = useDesktopStore();
  const { data: session } = useSession();
  const [time, setTime] = useState(new Date());
  const [mode, setMode] = useState<Mode>("idle");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const unlock = useCallback(() => setIsLocked(false), [setIsLocked]);

  useEffect(() => { if (session) unlock(); }, [session, unlock]);

  useEffect(() => {
    if (mode !== "idle") return;
    const handler = () => setMode("signin");
    window.addEventListener("keydown", handler);
    window.addEventListener("click", handler);
    return () => { window.removeEventListener("keydown", handler); window.removeEventListener("click", handler); };
  }, [mode]);

  const field = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else unlock();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed."); }
      else {
        await signIn("credentials", { email: form.email, password: form.password, redirect: false });
        unlock();
      }
    } catch { setError("Network error. Please try again."); }
    setLoading(false);
  };

  const fmtTime = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg,#2C001E 0%,#3a0a2e 30%,#1a1a3a 70%,#0a0a1a 100%)",
      }}
    >
      {/* Animated background dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${120 + i * 60}px`,
              height: `${120 + i * 60}px`,
              left: `${(i * 17) % 90}%`,
              top: `${(i * 23 + 10) % 85}%`,
              background: "radial-gradient(circle, rgba(233,84,32,0.08) 0%, transparent 70%)",
              animation: `glowPulse ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-[360px] px-6">
        {mode === "idle" ? (
          <div className="text-center cursor-pointer" onClick={() => setMode("signin")}>
            <div className="text-7xl font-thin text-white mb-2 tracking-tight tabular-nums">
              {fmtTime(time)}
            </div>
            <div className="text-lg text-white/60 mb-10">{fmtDate(time)}</div>
            <p className="text-white/35 text-sm animate-bounce">Click or press any key to unlock</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="text-center text-2xl font-light text-white mb-5 tabular-nums">{fmtTime(time)}</div>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 ring-4"
                style={{
                  background: "linear-gradient(135deg,#E95420,#772953)",

                }}
              >
                SM
              </div>
              <p className="text-white font-medium">
                {mode === "signin" ? "Welcome back" : "Create account"}
              </p>
            </div>

            <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-3">
              {mode === "signup" && (
                <input
                  type="text" placeholder="Full Name" required value={form.name}
                  onChange={(e) => field("name", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/35"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
                />
              )}
              <input
                type="email" placeholder="Email address" required value={form.email}
                onChange={(e) => field("email", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/35"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
              />
              <input
                type="password" placeholder="Password" required value={form.password}
                onChange={(e) => field("password", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/35"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
              />

              {error && (
                <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "#E95420" }}
              >
                {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="flex gap-2 mt-3">
              <button
                onClick={unlock}
                className="flex-1 py-2 rounded-xl text-white/60 text-xs hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Guest Mode
              </button>
              <button
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                className="flex-1 py-2 rounded-xl text-white/60 text-xs hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {mode === "signin" ? "Create Account" : "Sign In Instead"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
