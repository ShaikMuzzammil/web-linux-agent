"use client";
import { useEffect, useState, Component, ReactNode } from "react";
import { useDesktopStore } from "@/store/desktopStore";
import dynamic from "next/dynamic";

const BootScreen = dynamic(() => import("@/components/boot/BootScreen"),  { ssr: false });
const LockScreen = dynamic(() => import("@/components/boot/LockScreen"),  { ssr: false });
const Desktop    = dynamic(() => import("@/components/desktop/Desktop"),   { ssr: false });

// ── Inline error boundary so a runtime crash shows a recovery UI
// instead of the full-page "Something went wrong" from app/error.tsx
class DesktopBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err?.message ?? String(err) };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-6"
          style={{ background: "linear-gradient(135deg,#0a0a1a,#1a0a2e,#0a0a1a)" }}>
          <div className="text-6xl">⚠️</div>
          <h2 className="text-white text-xl font-semibold">Something went wrong</h2>
          <p className="text-white/40 text-sm text-center max-w-sm px-4">
            {this.state.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full text-white text-sm font-medium"
            style={{ background: "#E95420" }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { isBooting, isLocked, setIsBooting, setBootComplete } = useDesktopStore();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      setIsBooting(false);
      setBootComplete(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, [mounted, setIsBooting, setBootComplete]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white/20 text-sm" style={{ fontFamily: "Ubuntu, sans-serif" }}>
          Loading…
        </div>
      </div>
    );
  }

  if (isBooting) return <BootScreen />;
  if (isLocked)  return <LockScreen />;

  return (
    <DesktopBoundary>
      <Desktop />
    </DesktopBoundary>
  );
}
