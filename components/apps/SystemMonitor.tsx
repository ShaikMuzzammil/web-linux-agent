'use client';
import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, MemoryStick, Activity, Square, RefreshCw } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Metrics { cpu: number; mem: number; disk: number; net: number }

const genMetric = (prev: number, min = 5, max = 95, drift = 8) =>
  Math.min(max, Math.max(min, prev + (Math.random() - 0.5) * drift));

const PROCESSES = [
  { name: 'node', pid: 1234, cpu: 12.4, mem: 2.1, user: 'user', status: 'running' },
  { name: 'next-server', pid: 2345, cpu: 8.2, mem: 4.7, user: 'user', status: 'running' },
  { name: 'prisma', pid: 3456, cpu: 1.1, mem: 1.2, user: 'user', status: 'sleeping' },
  { name: 'systemd', pid: 1, cpu: 0.1, mem: 0.3, user: 'root', status: 'running' },
  { name: 'dbus', pid: 567, cpu: 0.0, mem: 0.1, user: 'user', status: 'sleeping' },
  { name: 'weblinux-ui', pid: 8901, cpu: 3.5, mem: 6.8, user: 'user', status: 'running' },
];

export default function SystemMonitor({ windowId }: { windowId: string }) {
  const { theme, windows } = useOSStore();
  const [history, setHistory] = useState<(Metrics & { t: number })[]>(
    Array.from({ length: 30 }, (_, i) => ({ cpu: 20 + Math.random() * 30, mem: 40 + Math.random() * 20, disk: 15 + Math.random() * 10, net: 5 + Math.random() * 40, t: Date.now() - (30 - i) * 1000 }))
  );
  const [tab, setTab] = useState<'overview' | 'processes' | 'resources'>('overview');

  useEffect(() => {
    const iv = setInterval(() => {
      setHistory((prev) => {
        const last = prev[prev.length - 1];
        const next = { cpu: genMetric(last.cpu), mem: genMetric(last.mem, 30, 80, 5), disk: genMetric(last.disk, 5, 40, 2), net: genMetric(last.net, 0, 100, 20), t: Date.now() };
        return [...prev.slice(-59), next];
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const current = history[history.length - 1];

  const MetricCard = ({ icon, label, value, color, unit = '%' }: { icon: React.ReactNode; label: string; value: number; color: string; unit?: string }) => (
    <div className="p-3 rounded-xl flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs opacity-60">{icon}{label}</div>
        <span className="text-sm font-bold" style={{ color }}>{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );

  const chartColor = (k: keyof Metrics) => ({ cpu: '#7C4DFF', mem: '#00BCD4', disk: '#4CAF50', net: '#FF6D00' }[k]);

  return (
    <div className="flex flex-col h-full text-sm" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      {/* Tabs */}
      <div className="flex border-b px-3 flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {(['overview', 'processes', 'resources'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-2 text-xs font-medium capitalize border-b-2 transition-all"
            style={{ borderColor: tab === t ? theme.accent : 'transparent', color: tab === t ? theme.accent : 'inherit', opacity: tab === t ? 1 : 0.5 }}>
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center pr-2">
          <div className="flex items-center gap-1.5 text-[10px] text-green-400">
            <Activity size={11} className="animate-pulse" /> Live
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={<Cpu size={13} />} label="CPU" value={current.cpu} color="#7C4DFF" />
              <MetricCard icon={<MemoryStick size={13} />} label="Memory" value={current.mem} color="#00BCD4" />
              <MetricCard icon={<HardDrive size={13} />} label="Disk I/O" value={current.disk} color="#4CAF50" />
              <MetricCard icon={<Wifi size={13} />} label="Network" value={current.net} color="#FF6D00" />
            </div>

            {/* CPU Chart */}
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-semibold mb-2 opacity-60">CPU History</p>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={history}>
                  <Line type="monotone" dataKey="cpu" stroke="#7C4DFF" strokeWidth={1.5} dot={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, fontSize: 10 }} formatter={(v: number) => [`${v.toFixed(1)}%`, 'CPU']} labelFormatter={() => ''} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* System info */}
            <div className="p-3 rounded-xl grid grid-cols-2 gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                ['OS', 'WebLinuxOS 2.0'],
                ['Kernel', '6.8.0-webos'],
                ['Uptime', `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`],
                ['Open Windows', String(windows.length)],
                ['CPU', 'Intel Core i7 (8 cores)'],
                ['RAM', '8 GB DDR5'],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <span className="text-[10px] opacity-40">{k}</span>
                  <span className="text-xs font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'processes' && (
          <div>
            <table className="w-full text-xs">
              <thead><tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                {['PID', 'Name', 'CPU%', 'MEM%', 'User', 'Status'].map((h) => (
                  <th key={h} className="text-left py-1.5 px-2 font-medium opacity-50">{h}</th>
                ))}
                <th className="w-8" />
              </tr></thead>
              <tbody>
                {PROCESSES.map((p) => (
                  <tr key={p.pid} className="border-b transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <td className="py-1.5 px-2 opacity-40">{p.pid}</td>
                    <td className="py-1.5 px-2 font-medium">{p.name}</td>
                    <td className="py-1.5 px-2" style={{ color: p.cpu > 10 ? '#f59e0b' : 'inherit' }}>{p.cpu.toFixed(1)}</td>
                    <td className="py-1.5 px-2">{p.mem.toFixed(1)}</td>
                    <td className="py-1.5 px-2 opacity-50">{p.user}</td>
                    <td className="py-1.5 px-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px]"
                        style={{ background: p.status === 'running' ? '#4ade8020' : '#94a3b820', color: p.status === 'running' ? '#4ade80' : '#94a3b8' }}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">
                      <button className="opacity-0 hover:opacity-100 text-red-400"><Square size={10} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'resources' && (
          <div className="space-y-4">
            {(['cpu', 'mem', 'net'] as const).map((k) => (
              <div key={k} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between mb-2">
                  <p className="text-xs font-semibold opacity-60 uppercase">{k}</p>
                  <p className="text-xs font-bold" style={{ color: chartColor(k) }}>{current[k].toFixed(1)}%</p>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={history}>
                    <Line type="monotone" dataKey={k} stroke={chartColor(k)} strokeWidth={1.5} dot={false} fill={chartColor(k) + '10'} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8, fontSize: 10 }} formatter={(v: number) => [`${v.toFixed(1)}%`]} labelFormatter={() => ''} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
