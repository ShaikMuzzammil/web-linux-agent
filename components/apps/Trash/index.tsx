"use client";
import { useState } from "react";

interface TrashItem {
  name: string;
  type: string;
  deletedAt: string;
  size: string;
  icon: string;
}

const DEFAULT_TRASH: TrashItem[] = [
  { name: "old-readme.md", type: "document", deletedAt: "Jun 30, 2025", size: "2.1 KB", icon: "📖" },
  { name: "node_modules_backup.zip", type: "archive", deletedAt: "Jun 28, 2025", size: "124 MB", icon: "📦" },
  { name: "debug.log", type: "log", deletedAt: "Jun 25, 2025", size: "45 KB", icon: "📄" },
  { name: ".env.backup", type: "config", deletedAt: "Jun 20, 2025", size: "1.2 KB", icon: "🔒" },
];

export default function Trash({ windowId }: { windowId: string }) {
  const [items, setItems] = useState<TrashItem[]>(DEFAULT_TRASH);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  const deleteItem = (name: string) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
    setSelected(null);
  };

  const emptyTrash = () => {
    setItems([]);
    setConfirmEmpty(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#1a1a2e", color: "#e6edf3" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗑️</span>
          <span className="text-white font-medium">Trash</span>
          <span className="text-white/40 text-sm">({items.length} item{items.length !== 1 ? "s" : ""})</span>
        </div>
        <div className="flex gap-2">
          {selected && (
            <>
              <button onClick={() => deleteItem(selected!)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                Delete Permanently
              </button>
              <button onClick={() => setSelected(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-colors border border-white/10 hover:bg-white/10">
                Restore
              </button>
            </>
          )}
          {items.length > 0 && !selected && (
            <button onClick={() => setConfirmEmpty(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
              Empty Trash
            </button>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmEmpty && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-red-500/30 flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.08)" }}>
          <span className="text-red-400 text-sm">⚠️ Permanently delete all {items.length} items?</span>
          <div className="flex gap-2">
            <button onClick={emptyTrash} className="px-3 py-1 rounded text-xs text-white bg-red-500 hover:bg-red-600 transition-colors">Delete All</button>
            <button onClick={() => setConfirmEmpty(false)} className="px-3 py-1 rounded text-xs text-white/60 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <div className="text-7xl mb-4">🗑️</div>
            <div className="text-lg font-medium mb-1">Trash is Empty</div>
            <div className="text-sm">No deleted items</div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 px-3 text-xs text-white/30 uppercase tracking-widest pb-1 border-b border-white/10">
              <span>Name</span>
              <span>Type</span>
              <span>Deleted</span>
              <span>Size</span>
            </div>
            {items.map((item) => (
              <div key={item.name}
                onClick={() => setSelected(selected === item.name ? null : item.name)}
                className="grid grid-cols-4 gap-4 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm"
                style={{
                  background: selected === item.name ? "rgba(233,84,32,0.12)" : "rgba(255,255,255,0.03)",
                  border: selected === item.name ? "1px solid rgba(233,84,32,0.3)" : "1px solid transparent",
                }}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="text-white/80 truncate">{item.name}</span>
                </div>
                <span className="text-white/50 capitalize">{item.type}</span>
                <span className="text-white/50">{item.deletedAt}</span>
                <span className="text-white/50">{item.size}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 text-xs text-white/30 border-t border-white/10 flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.2)" }}>
        {items.length > 0 ? `${items.length} deleted item${items.length !== 1 ? "s" : ""} · Select to restore or delete` : "Trash is empty"}
      </div>
    </div>
  );
}
