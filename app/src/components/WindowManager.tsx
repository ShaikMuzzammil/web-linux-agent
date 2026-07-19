// ============================================================
// WindowManager — Renders all windows + taskbar for minimized
// ============================================================

import { memo, useCallback } from 'react';
import { useOS } from '@/hooks/useOSStore';
import WindowFrame from './WindowFrame';
import AppRouter from '@/apps/AppRouter';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const DynamicIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : null;
};

const WindowManager = memo(function WindowManager() {
  const { state, dispatch } = useOS();

  const handleRestoreClick = useCallback((windowId: string) => {
    dispatch({ type: 'FOCUS_WINDOW', windowId });
    dispatch({ type: 'RESTORE_WINDOW', windowId });
  }, [dispatch]);

  const visibleWindows = state.windows.filter(w => w.state !== 'minimized');
  const minimizedWindows = state.windows.filter(w => w.state === 'minimized');

  return (
    <>
      {/* Render all non-minimized windows */}
      {visibleWindows.map(win => (
        <WindowFrame key={win.id} window={win}>
          <AppRouter appId={win.appId} windowId={win.id} />
        </WindowFrame>
      ))}

      {/* Minimized windows strip (top-left, just below TopPanel) */}
      {minimizedWindows.length > 0 && (
        <div
          className="fixed z-[190] flex items-center gap-1 px-2"
          style={{
            top: 32,
            left: 4,
            pointerEvents: 'auto',
          }}
        >
          {minimizedWindows.map(win => (
            <button
              key={win.id}
              onClick={() => handleRestoreClick(win.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all group"
              style={{
                background: 'rgba(28,28,28,0.88)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                animation: 'taskbarBounce 300ms ease',
                maxWidth: 160,
              }}
              title={`Restore: ${win.title}`}
            >
              <DynamicIcon
                name={win.icon}
                size={12}
                style={{ color: 'var(--accent-primary)', flexShrink: 0 }}
              />
              <span
                className="text-[10px] font-medium text-white/70 group-hover:text-white/90 transition-colors truncate"
                style={{ maxWidth: 100 }}
              >
                {win.title}
              </span>
              <div
                className="w-1 h-1 rounded-full shrink-0"
                style={{ background: 'rgba(255,255,255,0.3)' }}
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
});

export default WindowManager;
