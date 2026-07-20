'use client';
// ============================================================
// NotificationTrigger — Auto-generates real-time notifications
// ============================================================
import { useEffect, useRef, memo } from 'react';
import { useOSStore } from '@/hooks/useOSStore';

const SYSTEM_NOTIFS = [
  { appId: 'system', appName: 'System', appIcon: 'Monitor', title: 'WebLinuxOS v2.0.0 Ready', message: 'System running normally. 54 apps available.' },
  { appId: 'network', appName: 'Network', appIcon: 'Wifi', title: 'Connected to Network', message: 'Internet connection established.' },
  { appId: 'security', appName: 'Security', appIcon: 'Shield', title: 'Security Scan Complete', message: 'No threats detected. System is secure.' },
  { appId: 'storage', appName: 'Storage', appIcon: 'HardDrive', title: 'Storage: 21 GB / 50 GB', message: 'You have 29 GB of space remaining.' },
  { appId: 'updates', appName: 'Updates', appIcon: 'Download', title: '3 Updates Available', message: 'Package updates ready to install.' },
  { appId: 'chat', appName: 'NEXUS Intelligence', appIcon: 'Bot', title: 'Hello, Nova! 👋', message: 'Your AI assistant is ready. Open Chat to talk.' },
];

const NotificationTrigger = memo(function NotificationTrigger() {
  const { addNotification, auth } = useOSStore();
  const fired = useRef(false);

  useEffect(() => {
    if (!auth.isAuthenticated || fired.current) return;
    fired.current = true;

    const delays = [1500, 3800, 7500, 15000, 30000, 4500];
    const timers: ReturnType<typeof setTimeout>[] = [];

    delays.forEach((delay, i) => {
      const notif = SYSTEM_NOTIFS[i % SYSTEM_NOTIFS.length];
      const t = setTimeout(() => {
        addNotification({
          ...notif,
          isRead: false,
        });
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [auth.isAuthenticated]);

  return null;
});

export default NotificationTrigger;
