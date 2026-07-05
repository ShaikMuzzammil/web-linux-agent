"use client";
import { useEffect } from "react";
import { useDesktopStore } from "@/store/desktopStore";
import BootScreen from "@/components/boot/BootScreen";
import LockScreen from "@/components/boot/LockScreen";
import Desktop from "@/components/desktop/Desktop";

export default function Home() {
  const { isBooting, isLocked, bootComplete, setIsBooting, setBootComplete } = useDesktopStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
      setBootComplete(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, [setIsBooting, setBootComplete]);

  if (isBooting) return <BootScreen />;
  if (isLocked) return <LockScreen />;
  return <Desktop />;
}
