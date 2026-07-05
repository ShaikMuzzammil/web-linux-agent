"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center" style={{ background: "#1e1e1e" }}>
      <div className="text-white/30 text-sm">Loading editor…</div>
    </div>
  ),
});

interface FileNode {
  name: string;
  type: "file" | "folder";
  icon: string;
  language?: string;
  content?: string;
  children?: FileNode[];
}

const ROOT: FileNode[] = [
  {
    name: "web-linux-agent", type: "folder", icon: "📁",
    children: [
      {
        name: "app", type: "folder", icon: "📂",
        children: [
          { name: "page.tsx",    type: "file", icon: "⚛️", language: "typescript",
            content: `"use client";\nimport { useDesktopStore } from "@/store/desktopStore";\nimport BootScreen from "@/components/boot/BootScreen";\nimport LockScreen from "@/components/boot/LockScreen";\nimport Desktop  from "@/components/desktop/Desktop";\n\nexport default function Home() {\n  const { isBooting, isLocked } = useDesktopStore();\n  if (isBooting)  return <BootScreen />;\n  if (isLocked)   return <LockScreen />;\n  return <Desktop />;\n}` },
          { name: "layout.tsx", type: "file", icon: "⚛️", language: "typescript",
            content: `import type { Metadata } from "next";\nimport { Ubuntu } from "next/font/google";\nimport "./globals.css";\n\nexport const metadata: Metadata = {\n  title: "Shaik Muzzammil | Web Linux Agent",\n};\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}` },
          { name: "globals.css",type: "file", icon: "🎨", language: "css",
            content: `@import "tailwindcss";\n\n@theme {\n  --font-ubuntu: "Ubuntu", sans-serif;\n  --color-ubuntu-orange: #E95420;\n}\n\n/* Ubuntu 22.04 desktop styles */` },
        ],
      },
      {
        name: "components", type: "folder", icon: "📂",
        children: [
          { name: "boot/BootScreen.tsx", type: "file", icon: "⚛️", language: "typescript", content: `"use client";\n// Ubuntu boot animation\nexport default function BootScreen() {\n  return <div>Booting…</div>;\n}` },
          { name: "desktop/Desktop.tsx", type: "file", icon: "⚛️", language: "typescript", content: `"use client";\n// Main Ubuntu desktop\nexport default function Desktop() {\n  return <div>Desktop</div>;\n}` },
          { name: "desktop/Dock.tsx",    type: "file", icon: "⚛️", language: "typescript", content: `"use client";\n// Vertical dock (left sidebar)\nexport default function Dock() {\n  return <div>Dock</div>;\n}` },
        ],
      },
      {
        name: "lib", type: "folder", icon: "📂",
        children: [
          { name: "prisma.ts", type: "file", icon: "🗄️", language: "typescript",
            content: `import { PrismaClient } from "@prisma/client";\nconst g = globalThis as { prisma?: PrismaClient };\nexport const prisma = g.prisma ?? new PrismaClient();\nif (process.env.NODE_ENV !== "production") g.prisma = prisma;` },
          { name: "auth.ts",   type: "file", icon: "🔐", language: "typescript",
            content: `import NextAuth from "next-auth";\nimport Credentials from "next-auth/providers/credentials";\nexport const { handlers, auth, signIn, signOut } = NextAuth({\n  providers: [Credentials({})],\n  session: { strategy: "jwt" },\n});\nexport const { GET, POST } = handlers;` },
          { name: "resend.ts", type: "file", icon: "📧", language: "typescript",
            content: `import { Resend } from "resend";\nexport const resend = new Resend(process.env.RESEND_API_KEY);\nexport const OWNER_EMAIL = "muzzammil160806@gmail.com";` },
        ],
      },
      {
        name: "prisma", type: "folder", icon: "📂",
        children: [
          { name: "schema.prisma", type: "file", icon: "🗄️", language: "prisma",
            content: `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n}\n\nmodel User {\n  id          String  @id @default(cuid())\n  email       String  @unique\n  name        String?\n  password    String?\n  preferences UserPreferences?\n}` },
        ],
      },
      { name: "package.json",  type: "file", icon: "📦", language: "json",
        content: `{\n  "name": "web-linux-agent",\n  "version": "2.0.0",\n  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" }\n}` },
      { name: "README.md",     type: "file", icon: "📖", language: "markdown",
        content: `# 🐧 Web Linux Agent v2\n\nInteractive Ubuntu 22.04 portfolio by **Shaik Muzzammil**\n\n## Stack\nNext.js 16 · TypeScript · Tailwind v4 · Neon PostgreSQL · Prisma · NextAuth v5 · Resend` },
    ],
  },
];

function getAllFiles(nodes: FileNode[], acc: FileNode[] = []): FileNode[] {
  for (const n of nodes) {
    if (n.type === "file") acc.push(n);
    if (n.children) getAllFiles(n.children, acc);
  }
  return acc;
}

function FileIcon({ node }: { node: FileNode }) {
  return <span className="text-sm">{node.icon}</span>;
}

function TreeItem({
  node, depth, selected, expanded, onSelect, onToggle,
}: {
  node: FileNode; depth: number; selected: string; expanded: Set<string>;
  onSelect: (n: FileNode) => void; onToggle: (name: string) => void;
}) {
  const isExp = expanded.has(node.name);
  if (node.type === "folder") {
    return (
      <>
        <div
          className="flex items-center gap-1 py-0.5 cursor-pointer hover:bg-white/8 text-sm"
          style={{ paddingLeft: 8 + depth * 14 }}
          onClick={() => onToggle(node.name)}
        >
          <span className="text-white/35 text-xs w-3">{isExp ? "▾" : "▸"}</span>
          <FileIcon node={node} />
          <span className="text-white/70 ml-1">{node.name}</span>
        </div>
        {isExp && node.children?.map((c) => (
          <TreeItem key={c.name} node={c} depth={depth + 1}
            selected={selected} expanded={expanded} onSelect={onSelect} onToggle={onToggle} />
        ))}
      </>
    );
  }
  return (
    <div
      className="flex items-center gap-1 py-0.5 cursor-pointer text-sm"
      style={{
        paddingLeft: 22 + depth * 14,
        background: selected === node.name ? "rgba(233,84,32,0.15)" : "transparent",
        borderLeft: selected === node.name ? "2px solid #E95420" : "2px solid transparent",
      }}
      onClick={() => onSelect(node)}
    >
      <FileIcon node={node} />
      <span style={{ color: selected === node.name ? "#e6edf3" : "rgba(255,255,255,0.55)" }} className="ml-1">
        {node.name}
      </span>
    </div>
  );
}

export default function VSCode({ windowId }: { windowId: string }) {
  const allFiles = getAllFiles(ROOT);
  const [selected, setSelected] = useState<FileNode>(allFiles[0]);
  const [tabs, setTabs] = useState<FileNode[]>([allFiles[0]]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["web-linux-agent", "app", "lib"]));
  const [edits, setEdits] = useState<Record<string, string>>({});

  const selectFile = useCallback((node: FileNode) => {
    setSelected(node);
    setTabs((prev) => prev.find((t) => t.name === node.name) ? prev : [...prev, node]);
  }, []);

  const toggleFolder = useCallback((name: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  }, []);

  const closeTab = (e: React.MouseEvent, node: FileNode) => {
    e.stopPropagation();
    const rest = tabs.filter((t) => t.name !== node.name);
    setTabs(rest);
    if (selected.name === node.name && rest.length > 0) setSelected(rest.at(-1)!);
  };

  const content = edits[selected.name] ?? selected.content ?? "";

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#1e1e1e", color: "#cccccc" }}>
      {/* Activity bar */}
      <div className="flex flex-col items-center py-2 gap-3 w-11 flex-shrink-0" style={{ background: "#333" }}>
        {["📁", "🔍", "🌿", "🐛", "🧩"].map((ic, i) => (
          <button key={i} title={ic} className={`w-9 h-9 rounded flex items-center justify-center text-lg hover:bg-white/10 transition-colors ${i === 0 ? "" : "opacity-40"}`}>{ic}</button>
        ))}
      </div>

      {/* Explorer */}
      <div className="flex flex-col overflow-hidden flex-shrink-0 border-r border-white/10" style={{ width: 210, background: "#252526" }}>
        <div className="px-3 py-2 text-[11px] text-white/35 uppercase tracking-widest font-semibold border-b border-white/10">
          Explorer
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {ROOT.map((n) => (
            <TreeItem key={n.name} node={n} depth={0}
              selected={selected.name} expanded={expanded}
              onSelect={selectFile} onToggle={toggleFolder} />
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex items-end overflow-x-auto flex-shrink-0 border-b border-black/40" style={{ background: "#2d2d2d" }}>
          {tabs.map((tab) => (
            <div
              key={tab.name}
              className="flex items-center gap-1.5 px-4 py-2 text-xs cursor-pointer border-r border-black/25 flex-shrink-0 group"
              style={{
                background: selected.name === tab.name ? "#1e1e1e" : "#2d2d2d",
                color: selected.name === tab.name ? "#cccccc" : "#888",
                borderTop: selected.name === tab.name ? "1px solid #E95420" : "1px solid transparent",
              }}
              onClick={() => setSelected(tab)}
            >
              <FileIcon node={tab} />
              <span>{tab.name}</span>
              <span
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 ml-0.5"
                onClick={(e) => closeTab(e, tab)}
              >×</span>
            </div>
          ))}
        </div>

        {/* Monaco */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language={selected.language ?? "typescript"}
            value={content}
            onChange={(v) => setEdits((p) => ({ ...p, [selected.name]: v ?? "" }))}
            theme="vs-dark"
            options={{
              fontSize: 13,
              fontFamily: "'Ubuntu Mono','Fira Code','Courier New',monospace",
              minimap: { enabled: true, scale: 1 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              lineNumbers: "on",
              folding: true,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              padding: { top: 10 },
            }}
          />
        </div>

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-3 py-0.5 text-xs flex-shrink-0 text-white"
          style={{ background: "#007ACC" }}
        >
          <span>🌿 main · ⚠ 0 · ⛔ 0</span>
          <span>{(selected.language ?? "TypeScript").toUpperCase()} · UTF-8 · LF</span>
        </div>
      </div>
    </div>
  );
}
