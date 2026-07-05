"use client";
import { useState, useRef } from "react";

const DEFAULT_FILES = [
  { name: "notes.txt", content: `# My Notes\n\nThis is a text editor built into the Web Linux Agent.\nYou can type here, create new files, and save your work.\n\n## Today's Tasks\n- [ ] Complete portfolio\n- [ ] Push to GitHub\n- [ ] Deploy on Vercel\n- [x] Build Web Linux Agent\n\n## Ideas\n- Add more terminal commands\n- Improve window animations\n- Dark mode customization\n` },
  { name: "about.md", content: `# Shaik Muzzammil\n\n## CSE Student & Full Stack Developer\n\n- 📍 Chennai, India\n- 📧 muzzammil160806@gmail.com\n- 🐙 github.com/ShaikMuzzammil\n\n## Tech Stack\nNext.js · TypeScript · PostgreSQL · Prisma · React\n` },
];

export default function TextEditor({ windowId }: { windowId: string }) {
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState(DEFAULT_FILES[0].name);
  const [unsaved, setUnsaved] = useState<Set<string>>(new Set());
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentFile = files.find((f) => f.name === activeFile)!;

  const handleEdit = (val: string) => {
    setFiles((prev) => prev.map((f) => f.name === activeFile ? { ...f, content: val } : f));
    setUnsaved((prev) => new Set(prev).add(activeFile));
  };

  const handleSave = () => {
    const next = new Set(unsaved);
    next.delete(activeFile);
    setUnsaved(next);
  };

  const handleNewFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.endsWith(".txt") || newFileName.endsWith(".md") ? newFileName : newFileName + ".txt";
    setFiles((prev) => [...prev, { name, content: "" }]);
    setActiveFile(name);
    setShowNewFile(false);
    setNewFileName("");
  };

  const closeTab = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const remaining = files.filter((f) => f.name !== name);
    if (remaining.length === 0) return;
    setFiles(remaining);
    if (activeFile === name) setActiveFile(remaining[0].name);
  };

  const wordCount = currentFile?.content.trim().split(/\s+/).filter(Boolean).length || 0;
  const lineCount = currentFile?.content.split("\n").length || 0;
  const charCount = currentFile?.content.length || 0;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#1e1e2e", color: "#cdd6f4" }}>
      {/* Menu bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 text-xs border-b border-white/10 flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.2)" }}>
        {[
          { label: "File", actions: ["New", "Open", "Save", "Save As...", "Close"] },
          { label: "Edit", actions: ["Undo", "Redo", "Cut", "Copy", "Paste", "Select All"] },
          { label: "View", actions: ["Zoom In", "Zoom Out", "Word Wrap"] },
          { label: "Help", actions: ["Keyboard Shortcuts", "About"] },
        ].map((menu) => (
          <div key={menu.label} className="relative group">
            <button className="text-white/60 hover:text-white transition-colors px-1 py-0.5 rounded hover:bg-white/10">
              {menu.label}
            </button>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowNewFile(true)}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/10">
            ＋ New File
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-all"
            style={{ background: unsaved.has(activeFile) ? "#E95420" : "rgba(255,255,255,0.1)", color: "white" }}>
            💾 {unsaved.has(activeFile) ? "Save*" : "Saved"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-end overflow-x-auto flex-shrink-0 border-b border-black/30"
        style={{ background: "#181825" }}>
        {files.map((file) => (
          <div key={file.name}
            className="flex items-center gap-2 px-4 py-2 text-xs cursor-pointer border-r border-black/20 flex-shrink-0 group"
            style={{
              background: activeFile === file.name ? "#1e1e2e" : "#181825",
              color: activeFile === file.name ? "#cdd6f4" : "#7f849c",
              borderTop: activeFile === file.name ? "1px solid #E95420" : "1px solid transparent",
            }}
            onClick={() => setActiveFile(file.name)}>
            <span>{file.name.endsWith(".md") ? "📖" : "📄"}</span>
            <span>{file.name}</span>
            {unsaved.has(file.name) && <span className="text-orange-400">●</span>}
            <span onClick={(e) => closeTab(e, file.name)}
              className="opacity-0 group-hover:opacity-100 hover:text-white ml-1">×</span>
          </div>
        ))}
      </div>

      {/* New file dialog */}
      {showNewFile && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 flex-shrink-0"
          style={{ background: "rgba(233,84,32,0.1)" }}>
          <span className="text-xs text-white/60">New file name:</span>
          <input value={newFileName} onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleNewFile(); if (e.key === "Escape") setShowNewFile(false); }}
            className="flex-1 bg-transparent border-b border-orange-500 outline-none text-white text-xs pb-0.5"
            placeholder="filename.txt" autoFocus />
          <button onClick={handleNewFile} className="text-xs text-orange-400 hover:text-orange-300">Create</button>
          <button onClick={() => setShowNewFile(false)} className="text-xs text-white/40 hover:text-white/60">Cancel</button>
        </div>
      )}

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers */}
        <div className="py-4 px-2 text-right text-xs leading-relaxed flex-shrink-0 overflow-hidden select-none"
          style={{ background: "#181825", color: "#585b70", minWidth: 40, fontFamily: "'Ubuntu Mono', monospace" }}>
          {currentFile?.content.split("\n").map((_, i) => (
            <div key={i} className="leading-[22px]">{i + 1}</div>
          ))}
        </div>

        {/* Text area */}
        <textarea
          ref={textareaRef}
          value={currentFile?.content || ""}
          onChange={(e) => handleEdit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "s" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(); }
            if (e.key === "Tab") { e.preventDefault(); const s = e.currentTarget.selectionStart; const en = e.currentTarget.selectionEnd; handleEdit(currentFile.content.slice(0, s) + "  " + currentFile.content.slice(en)); setTimeout(() => { if (textareaRef.current) { textareaRef.current.selectionStart = textareaRef.current.selectionEnd = s + 2; } }); }
          }}
          className="flex-1 p-4 bg-transparent outline-none resize-none text-sm leading-[22px]"
          style={{
            color: "#cdd6f4",
            fontFamily: "'Ubuntu Mono', 'Courier New', monospace",
            fontSize: 13,
            caretColor: "#E95420",
          }}
          spellCheck={false}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1 text-xs flex-shrink-0"
        style={{ background: "#181825", borderTop: "1px solid rgba(255,255,255,0.08)", color: "#585b70" }}>
        <div className="flex gap-4">
          <span>Line {lineCount}</span>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
        <div className="flex gap-3">
          <span>UTF-8</span>
          <span>{activeFile.endsWith(".md") ? "Markdown" : "Plain Text"}</span>
          {unsaved.has(activeFile) && <span className="text-orange-400">● Unsaved changes</span>}
        </div>
      </div>
    </div>
  );
}
