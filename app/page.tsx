"use client";
import { useEffect, useState } from "react";
import { useDesktopStore } from "@/store/desktopStore";
import dynamic from "next/dynamic";

const BootScreen  = dynamic(() => import("@/components/boot/BootScreen"),  { ssr: false });
const LockScreen  = dynamic(() => import("@/components/boot/LockScreen"),  { ssr: false });
const Desktop     = dynamic(() => import("@/components/desktop/Desktop"),   { ssr: false });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { isBooting, isLocked, setIsBooting, setBootComplete } = useDesktopStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      setIsBooting(false);
      setBootComplete(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, [mounted, setIsBooting, setBootComplete]);

  // Prevent SSR flash
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
  return <Desktop />;
}
