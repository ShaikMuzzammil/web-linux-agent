'use client';
import { memo, lazy, Suspense, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import WindowFrame from './WindowFrame';

// Lazy-load every app so initial bundle stays small
const apps: Record<string, React.LazyExoticComponent<React.ComponentType<{ windowId: string }>>> = {
  terminal:        lazy(() => import('@/components/apps/Terminal')),
  filemanager:     lazy(() => import('@/components/apps/FileManager')),
  texteditor:      lazy(() => import('@/components/apps/TextEditor')),
  codeeditor:      lazy(() => import('@/components/apps/CodeEditor')),
  browser:         lazy(() => import('@/components/apps/Browser')),
  settings:        lazy(() => import('@/components/apps/Settings')),
  calculator:      lazy(() => import('@/components/apps/Calculator')),
  notes:           lazy(() => import('@/components/apps/Notes')),
  todo:            lazy(() => import('@/components/apps/Todo')),
  calendar:        lazy(() => import('@/components/apps/Calendar')),
  contacts:        lazy(() => import('@/components/apps/Contacts')),
  reminders:       lazy(() => import('@/components/apps/Reminders')),
  passwordmanager: lazy(() => import('@/components/apps/PasswordManager')),
  systemmonitor:   lazy(() => import('@/components/apps/SystemMonitor')),
  chat:            lazy(() => import('@/components/apps/Chat')),
  weather:         lazy(() => import('@/components/apps/Weather')),
  musicplayer:     lazy(() => import('@/components/apps/MusicPlayer')),
  imageviewer:     lazy(() => import('@/components/apps/ImageViewer')),
  minesweeper:     lazy(() => import('@/components/apps/Minesweeper')),
  snake:           lazy(() => import('@/components/apps/Snake')),
  tetris:          lazy(() => import('@/components/apps/Tetris')),
  tictactoe:       lazy(() => import('@/components/apps/TicTacToe')),
  game2048:        lazy(() => import('@/components/apps/Game2048')),
  sudoku:          lazy(() => import('@/components/apps/Sudoku')),
  chess:           lazy(() => import('@/components/apps/Chess')),
  memory:          lazy(() => import('@/components/apps/MemoryGame')),
  pong:            lazy(() => import('@/components/apps/Pong')),
  solitaire:       lazy(() => import('@/components/apps/Solitaire')),
  flappybird:      lazy(() => import('@/components/apps/FlappyBird')),
  drawing:         lazy(() => import('@/components/apps/Drawing')),
  jsonformatter:   lazy(() => import('@/components/apps/JsonFormatter')),
  regextester:     lazy(() => import('@/components/apps/RegexTester')),
  markdownpreview: lazy(() => import('@/components/apps/MarkdownPreview')),
  apitester:       lazy(() => import('@/components/apps/ApiTester')),
  base64tool:      lazy(() => import('@/components/apps/Base64Tool')),
  colorpalette:    lazy(() => import('@/components/apps/ColorPalette')),
  colorpicker:     lazy(() => import('@/components/apps/ColorPicker')),
  clock:           lazy(() => import('@/components/apps/Clock')),
  spreadsheet:     lazy(() => import('@/components/apps/Spreadsheet')),
  whiteboard:      lazy(() => import('@/components/apps/Whiteboard')),
  networktools:    lazy(() => import('@/components/apps/NetworkTools')),
  gitclient:       lazy(() => import('@/components/apps/GitClient')),
  email:           lazy(() => import('@/components/apps/Email')),
  rssreader:       lazy(() => import('@/components/apps/RssReader')),
  photoeditor:     lazy(() => import('@/components/apps/PhotoEditor')),
  voicerecorder:   lazy(() => import('@/components/apps/VoiceRecorder')),
  imagegallery:    lazy(() => import('@/components/apps/ImageGallery')),
  asciiart:        lazy(() => import('@/components/apps/AsciiArt')),
  archivemanager:  lazy(() => import('@/components/apps/ArchiveManager')),
  documentviewer:  lazy(() => import('@/components/apps/DocumentViewer')),
  ftpclient:       lazy(() => import('@/components/apps/FtpClient')),
  screenrecorder:  lazy(() => import('@/components/apps/ScreenRecorder')),
  mediaconverter:  lazy(() => import('@/components/apps/MediaConverter')),
  videoplayer:     lazy(() => import('@/components/apps/VideoPlayer')),
};

function AppFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(15,15,25,0.95)' }}>
      <Loader2 size={24} className="animate-spin text-purple-400" />
    </div>
  );
}

export default memo(function WindowManager() {
  const windows = useOSStore((s) => s.windows);
  const { focusWindow, restoreWindow } = useOSStore();

  const minimized = windows.filter(w => w.state === 'minimized');

  return (
    <>
      {/* Minimized window restore strip */}
      {minimized.length > 0 && (
        <div className="fixed z-[190] flex items-center gap-1 px-2" style={{ top: 32, left: 4 }}>
          {minimized.map(win => (
            <button
              key={win.id}
              onClick={() => { focusWindow(win.id); restoreWindow(win.id); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
              style={{
                background: 'rgba(28,28,28,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                maxWidth: 160,
              }}
              title={"Restore: " + win.title}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#E95420' }} />
              <span className="text-[10px] font-medium text-white/70 truncate" style={{ maxWidth: 100 }}>
                {win.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {windows.map((win) => {
        const AppComponent = apps[win.appId];
        return (
          <WindowFrame key={win.id} window={win}>
            {AppComponent ? (
              <Suspense fallback={<AppFallback />}>
                <AppComponent windowId={win.id} />
              </Suspense>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/40">
                <p className="text-4xl">🚧</p>
                <p className="text-sm font-medium">App &quot;{win.appId}&quot; coming soon</p>
              </div>
            )}
          </WindowFrame>
        );
      })}
    </>
  );
});
