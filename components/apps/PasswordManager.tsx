'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Eye, EyeOff, Copy, Trash2, Search, Lock, Key, Globe, X, Check, RefreshCw, Shield } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { PasswordEntry } from '@/types';
import { generateId } from '@/lib/utils';

const CATEGORIES = ['General', 'Social', 'Banking', 'Shopping', 'Work', 'Email', 'Gaming'];
function load(): PasswordEntry[] { try { return JSON.parse(localStorage.getItem('wlos_passwords') || '[]'); } catch { return []; } }
function save(p: PasswordEntry[]) { localStorage.setItem('wlos_passwords', JSON.stringify(p)); }
function genPassword(len = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function PasswordManager({ windowId }: { windowId: string }) {
  const { theme, auth } = useOSStore();
  const [entries, setEntries] = useState<PasswordEntry[]>(load);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ siteName: '', siteUrl: '', username: '', password: '', notes: '', category: 'General' });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    fetch('/api/sync/passwords').then(r => r.json()).then(d => { if (d.passwords?.length) { setEntries(d.passwords); save(d.passwords); } }).catch(() => {});
  }, [auth]);

  const sync = useCallback((updated: PasswordEntry[]) => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/sync/passwords', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passwords: updated }) }).catch(() => {});
    }, 1500);
  }, [auth]);

  const add = () => {
    if (!form.siteName || !form.username || !form.password) return;
    const e: PasswordEntry = { id: generateId(), ...form, createdAt: Date.now(), updatedAt: Date.now() };
    const u = [e, ...entries]; setEntries(u); save(u); sync(u);
    setForm({ siteName: '', siteUrl: '', username: '', password: '', notes: '', category: 'General' }); setShowForm(false);
  };

  const del = (id: string) => { const u = entries.filter(e => e.id !== id); setEntries(u); save(u); sync(u); };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const toggleVisible = (id: string) => setVisibleIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = entries.filter(e => {
    const mq = !query || e.siteName.toLowerCase().includes(query.toLowerCase()) || e.username.toLowerCase().includes(query.toLowerCase());
    const mc = category === 'All' || e.category === category;
    return mq && mc;
  });

  return (
    <div className="flex flex-col h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2"><Shield size={16} style={{ color: theme.accent }} /><span className="font-bold">Password Vault</span><span className="text-xs opacity-40">({entries.length})</span></div>
          <button onClick={() => setShowForm(v => !v)} className="px-3 py-1.5 rounded-xl text-xs text-white" style={{ background: theme.accent }}><Plus size={12} className="inline mr-1" />Add</button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="w-full pl-7 pr-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.07)', caretColor: theme.accent }} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.07)', color: 'inherit' }}>
            <option>All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="p-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="grid grid-cols-2 gap-2">
            {[['siteName','Site Name *'],['siteUrl','URL'],['username','Username *'],['notes','Notes']].map(([k,l]) => (
              <div key={k}><p className="text-[10px] opacity-50 mb-0.5">{l}</p>
                <input value={form[k as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={l.replace(' *','')} className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.07)', caretColor: theme.accent }} /></div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <div className="flex-1"><p className="text-[10px] opacity-50 mb-0.5">Password *</p>
              <div className="flex gap-1.5">
                <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} type="text" placeholder="Password" className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none font-mono" style={{ background: 'rgba(255,255,255,0.07)', caretColor: theme.accent }} />
                <button onClick={() => setForm(f => ({ ...f, password: genPassword() }))} className="px-2 py-1.5 rounded-lg text-xs hover:bg-white/10" title="Generate"><RefreshCw size={12} /></button>
              </div>
            </div>
            <div><p className="text-[10px] opacity-50 mb-0.5">Category</p>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="px-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.07)', color: 'inherit' }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={add} disabled={!form.siteName || !form.username || !form.password} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40" style={{ background: theme.accent }}>Save Entry</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded-xl text-xs hover:bg-white/10"><X size={12} /></button>
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-30"><Lock size={32} /><p className="text-sm mt-2">No passwords saved</p></div>
        ) : filtered.map(e => (
          <div key={e.id} className="p-3 rounded-xl group" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${theme.accent}20` }}>
                <Globe size={16} style={{ color: theme.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{e.siteName}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${theme.accent}20`, color: theme.accent }}>{e.category}</span>
                </div>
                <p className="text-[11px] opacity-50">{e.username}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-mono text-[11px]">{visibleIds.has(e.id) ? e.password : '••••••••••'}</span>
                  <button onClick={() => toggleVisible(e.id)} className="text-white/30 hover:text-white/60">{visibleIds.has(e.id) ? <EyeOff size={11} /> : <Eye size={11} />}</button>
                  <button onClick={() => copyText(e.password, e.id)} className="text-white/30 hover:text-white/60">{copied === e.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}</button>
                </div>
              </div>
              <button onClick={() => del(e.id)} className="opacity-0 group-hover:opacity-100 text-red-400"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
