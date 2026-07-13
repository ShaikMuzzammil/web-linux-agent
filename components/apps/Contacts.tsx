'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Trash2, Mail, Phone, MapPin, Building, Globe, X, Edit2, User } from 'lucide-react';
import { useOSStore } from '@/hooks/useOSStore';
import type { Contact } from '@/types';
import { generateId } from '@/lib/utils';

function load(): Contact[] { try { return JSON.parse(localStorage.getItem('wlos_contacts') || '[]'); } catch { return []; } }
function save(c: Contact[]) { localStorage.setItem('wlos_contacts', JSON.stringify(c)); }

const EMPTY = { name: '', email: '', phone: '', company: '', address: '', website: '', notes: '' };

export default function Contacts({ windowId }: { windowId: string }) {
  const { theme, auth } = useOSStore();
  const [contacts, setContacts] = useState<Contact[]>(load);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    fetch('/api/sync/contacts').then(r => r.json()).then(d => { if (d.contacts?.length) { setContacts(d.contacts); save(d.contacts); } }).catch(() => {});
  }, [auth]);

  const sync = useCallback((updated: Contact[]) => {
    if (!auth.isAuthenticated || auth.isGuest) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/sync/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contacts: updated }) }).catch(() => {});
    }, 1500);
  }, [auth]);

  const submit = () => {
    if (!form.name.trim()) return;
    const now = Date.now();
    if (editId) {
      const u = contacts.map(c => c.id === editId ? { ...c, ...form, tags: c.tags, updatedAt: now } : c);
      setContacts(u); save(u); sync(u);
      setSelected(u.find(c => c.id === editId) || null);
    } else {
      const nc: Contact = { id: generateId(), ...form, tags: [], createdAt: now, updatedAt: now };
      const u = [nc, ...contacts]; setContacts(u); save(u); sync(u);
    }
    setShowForm(false); setEditId(null); setForm(EMPTY);
  };

  const del = (id: string) => {
    const u = contacts.filter(c => c.id !== id); setContacts(u); save(u); sync(u);
    if (selected?.id === id) setSelected(null);
  };

  const filtered = contacts.filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.email?.toLowerCase().includes(query.toLowerCase()) || c.company?.toLowerCase().includes(query.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarColors = ['#7C4DFF','#2196F3','#4CAF50','#FF6D00','#E91E63'];
  const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="flex h-full" style={{ background: theme.mode === 'dark' ? '#0d0d1a' : '#f5f5fb', color: theme.mode === 'dark' ? '#e2e8f0' : '#1e1e2e' }}>
      {/* List */}
      <div className="w-56 flex flex-col border-r flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-2 flex gap-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="relative flex-1">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="w-full pl-6 pr-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.06)', caretColor: theme.accent }} />
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }} className="p-1.5 rounded-lg text-white" style={{ background: theme.accent }}><Plus size={13} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 opacity-30"><User size={24} /><p className="text-xs mt-1">No contacts</p></div>
          ) : filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(c)} className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all"
              style={{ background: selected?.id === c.id ? `${theme.accent}20` : 'transparent' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: getColor(c.name) }}>{initials(c.name)}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{c.name}</p>
                <p className="text-[10px] opacity-40 truncate">{c.company || c.email || 'No details'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-y-auto p-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: getColor(selected.name) }}>{initials(selected.name)}</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{selected.name}</h2>
              {selected.company && <p className="text-sm opacity-50">{selected.company}</p>}
            </div>
            <button onClick={() => { setForm({ name: selected.name, email: selected.email || '', phone: selected.phone || '', company: selected.company || '', address: selected.address || '', website: selected.website || '', notes: selected.notes || '' }); setEditId(selected.id); setShowForm(true); }} className="p-2 rounded-lg hover:bg-white/10"><Edit2 size={14} /></button>
            <button onClick={() => del(selected.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
          </div>
          <div className="space-y-2">
            {[
              { icon: <Mail size={13} />, label: 'Email', value: selected.email },
              { icon: <Phone size={13} />, label: 'Phone', value: selected.phone },
              { icon: <Building size={13} />, label: 'Company', value: selected.company },
              { icon: <MapPin size={13} />, label: 'Address', value: selected.address },
              { icon: <Globe size={13} />, label: 'Website', value: selected.website },
            ].filter(f => f.value).map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="opacity-40">{icon}</span>
                <div><p className="text-[10px] opacity-40">{label}</p><p className="text-xs">{value}</p></div>
              </div>
            ))}
            {selected.notes && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-[10px] opacity-40 mb-1">Notes</p>
                <p className="text-xs">{selected.notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-3">
          <User size={40} /><p className="text-sm">Select a contact</p>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-80 rounded-2xl p-5 flex flex-col gap-3" style={{ background: theme.mode === 'dark' ? '#1a1a2e' : '#fff', border: `1px solid ${theme.accent}30` }}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold">{editId ? 'Edit Contact' : 'New Contact'}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }}><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(form).map(([k, v]) => (
                <div key={k} className={k === 'notes' ? 'col-span-2' : ''}>
                  <p className="text-[10px] opacity-50 mb-0.5 capitalize">{k}{k === 'name' ? ' *' : ''}</p>
                  <input value={v} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={`Enter ${k}`}
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', caretColor: theme.accent }} />
                </div>
              ))}
            </div>
            <button onClick={submit} disabled={!form.name.trim()} className="py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: theme.accent }}>
              {editId ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
