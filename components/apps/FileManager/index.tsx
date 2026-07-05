"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface FSItem {
  name: string;
  type: "folder" | "file" | "image" | "code" | "doc";
  size?: string;
  modified?: string;
  icon?: string;
  children?: FSItem[];
}

const FS_TREE: Record<string, FSItem[]> = {
  "/": [
    { name: "Home", type: "folder", icon: "🏠", modified: "Jul 4, 2025" },
    { name: "Desktop", type: "folder", icon: "🖥️", modified: "Today" },
    { name: "Documents", type: "folder", icon: "📄", modified: "Today" },
    { name: "Downloads", type: "folder", icon: "⬇️", modified: "Today" },
    { name: "Pictures", type: "folder", icon: "🖼️", modified: "Jun 30" },
    { name: "Videos", type: "folder", icon: "🎬", modified: "Jun 25" },
    { name: "Music", type: "folder", icon: "🎵", modified: "Jun 20" },
    { name: "Projects", type: "folder", icon: "💻", modified: "Today" },
  ],
  "/Home": [
    { name: "readme.txt", type: "file", size: "1.2 KB", icon: "📄", modified: "Today" },
    { name: "resume.pdf", type: "doc", size: "156 KB", icon: "📑", modified: "Jul 1" },
    { name: ".bashrc", type: "file", size: "4 KB", icon: "📄", modified: "Jun 20" },
    { name: ".profile", type: "file", size: "807 B", icon: "📄", modified: "Jun 20" },
    { name: "Desktop", type: "folder", icon: "🖥️", modified: "Today" },
    { name: "Documents", type: "folder", icon: "📄", modified: "Today" },
    { name: "Downloads", type: "folder", icon: "⬇️", modified: "Today" },
    { name: "Projects", type: "folder", icon: "💻", modified: "Today" },
  ],
  "/Home/Projects": [
    { name: "web-linux-agent", type: "folder", icon: "💻", modified: "Today" },
    { name: "cortexcart", type: "folder", icon: "🛒", modified: "Jul 2" },
    { name: "smart-query-optimizer", type: "folder", icon: "🔍", modified: "Jun 28" },
    { name: "omnipoll", type: "folder", icon: "📊", modified: "Jun 20" },
    { name: "agrowave", type: "folder", icon: "🌾", modified: "Jun 15" },
  ],
  "/Home/Documents": [
    { name: "Resume - Shaik Muzzammil.pdf", type: "doc", size: "156 KB", icon: "📑", modified: "Jul 1" },
    { name: "Cover Letter.docx", type: "doc", size: "28 KB", icon: "📝", modified: "Jun 30" },
    { name: "Amrita_Marksheet.pdf", type: "doc", size: "420 KB", icon: "📑", modified: "Jun 25" },
    { name: "Notes.txt", type: "file", size: "3.4 KB", icon: "📄", modified: "Today" },
  ],
  "/Home/Downloads": [
    { name: "ubuntu-22.04.3-desktop.iso", type: "file", size: "4.7 GB", icon: "💿", modified: "Jun 10" },
    { name: "nodejs-v18.tar.gz", type: "file", size: "25 MB", icon: "📦", modified: "Jun 15" },
    { name: "postgres-setup.sh", type: "code", size: "2 KB", icon: "📜", modified: "Jun 20" },
  ],
  "/Home/Pictures": [
    { name: "wallpapers", type: "folder", icon: "🖼️", modified: "Jun 30" },
    { name: "screenshots", type: "folder", icon: "📸", modified: "Today" },
    { name: "profile.jpg", type: "image", size: "128 KB", icon: "🖼️", modified: "Jun 25" },
  ],
  "/Desktop": [
    { name: "About Me.lnk", type: "file", icon: "👨‍💻", modified: "Today" },
    { name: "Projects.lnk", type: "file", icon: "💻", modified: "Today" },
  ],
};

const BOOKMARKS = [
  { label: "Home", path: "/Home", icon: "🏠" },
  { label: "Desktop", path: "/Desktop", icon: "🖥️" },
  { label: "Documents", path: "/Home/Documents", icon: "📄" },
  { label: "Downloads", path: "/Home/Downloads", icon: "⬇️" },
  { label: "Pictures", path: "/Home/Pictures", icon: "🖼️" },
  { label: "Projects", path: "/Home/Projects", icon: "💻" },
];

type ViewMode = "grid" | "list";

export default function FileManager({ windowId }: { windowId: string }) {
  const [currentPath, setCurrentPath] = useState("/Home");
  const [history, setHistory] = useState(["/Home"]);
  const [histIdx, setHistIdx] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: session } = useSession();

  const items = FS_TREE[currentPath] || [];
  const filtered = search ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())) : items;

  const navigate = (path: string) => {
    const newHistory = [...history.slice(0, histIdx + 1), path];
    setHistory(newHistory);
    setHistIdx(newHistory.length - 1);
    setCurrentPath(path);
    setSelected(null);
    setSearch("");
  };

  const handleOpen = (item: FSItem) => {
    if (item.type === "folder") {
      const newPath = `${currentPath}/${item.name}`.replace("//", "/");
      if (FS_TREE[newPath]) navigate(newPath);
    }
  };

  const goBack = () => { if (histIdx > 0) { setHistIdx(histIdx - 1); setCurrentPath(history[histIdx - 1]); }};
  const goForward = () => { if (histIdx < history.length - 1) { setHistIdx(histIdx + 1); setCurrentPath(history[histIdx + 1]); }};
  const goUp = () => { const parts = currentPath.split("/").filter(Boolean); if (parts.length > 0) navigate("/" + parts.slice(0, -1).join("/")); };

  const breadcrumbs = currentPath === "/" ? ["/"] : ["/", ...currentPath.split("/").filter(Boolean)];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#1a1a2e", color: "#e6edf3" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        <button onClick={goBack} disabled={histIdx === 0} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors text-white/80">◀</button>
        <button onClick={goForward} disabled={histIdx >= history.length - 1} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors text-white/80">▶</button>
        <button onClick={goUp} className="p-1.5 rounded hover:bg-white/10 transition-colors text-white/80">▲</button>
        <button onClick={() => navigate(currentPath)} className="p-1.5 rounded hover:bg-white/10 transition-colors text-white/80">↺</button>

        {/* Breadcrumb */}
        <div className="flex-1 flex items-center gap-1 px-3 py-1 rounded-lg text-sm overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-white/30">›</span>}
              <button
                className="hover:text-white text-white/70 transition-colors"
                onClick={() => navigate(i === 0 ? "/" : "/" + breadcrumbs.slice(1, i + 1).join("/"))}
              >
                {crumb}
              </button>
            </span>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <span className="text-white/40">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
            className="bg-transparent outline-none text-white/80 w-32 text-sm placeholder-white/30" />
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          <button onClick={() => setViewMode("grid")} className="px-2 py-1.5 text-sm transition-colors"
            style={{ background: viewMode === "grid" ? "rgba(233,84,32,0.3)" : "transparent", color: viewMode === "grid" ? "#E95420" : "rgba(255,255,255,0.5)" }}>
            ⊞
          </button>
          <button onClick={() => setViewMode("list")} className="px-2 py-1.5 text-sm transition-colors"
            style={{ background: viewMode === "list" ? "rgba(233,84,32,0.3)" : "transparent", color: viewMode === "list" ? "#E95420" : "rgba(255,255,255,0.5)" }}>
            ≡
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar bookmarks */}
        <div className="w-44 flex-shrink-0 border-r border-white/10 overflow-y-auto py-2"
          style={{ background: "rgba(0,0,0,0.2)" }}>
          <div className="px-3 py-1 text-xs text-white/30 uppercase tracking-widest mb-1">Bookmarks</div>
          {BOOKMARKS.map((bm) => (
            <button key={bm.path} onClick={() => navigate(bm.path)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-white/10 transition-colors rounded mx-1"
              style={{ color: currentPath === bm.path ? "#E95420" : "rgba(255,255,255,0.65)", background: currentPath === bm.path ? "rgba(233,84,32,0.1)" : "transparent" }}>
              <span>{bm.icon}</span>
              <span>{bm.label}</span>
            </button>
          ))}

          <div className="border-t border-white/10 mt-3 pt-3 px-3">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-2">Info</div>
            {session ? (
              <div className="text-xs text-white/50">
                <div>👤 {session.user?.name || "User"}</div>
                <div className="mt-1">💾 4.2 GB free</div>
              </div>
            ) : (
              <div className="text-xs text-white/50">💾 4.2 GB free</div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/30">
              <div className="text-4xl mb-2">📂</div>
              <div className="text-sm">Empty folder</div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-5 gap-3">
              {filtered.map((item) => (
                <div key={item.name}
                  onDoubleClick={() => handleOpen(item)}
                  onClick={() => setSelected(item.name)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: selected === item.name ? "rgba(233,84,32,0.15)" : "rgba(255,255,255,0.04)",
                    border: selected === item.name ? "1px solid rgba(233,84,32,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  }}>
                  <span className="text-4xl leading-none">{item.icon || (item.type === "folder" ? "📁" : "📄")}</span>
                  <span className="text-xs text-center text-white/70 leading-tight break-words max-w-full line-clamp-2">{item.name}</span>
                  {item.size && <span className="text-xs text-white/30">{item.size}</span>}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase tracking-wide border-b border-white/10">
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-left pb-2 font-medium w-24">Size</th>
                  <th className="text-left pb-2 font-medium w-28">Modified</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.name}
                    onDoubleClick={() => handleOpen(item)}
                    onClick={() => setSelected(item.name)}
                    className="group cursor-pointer rounded transition-colors"
                    style={{
                      background: selected === item.name ? "rgba(233,84,32,0.12)" : "transparent",
                    }}>
                    <td className="py-1.5 flex items-center gap-2.5">
                      <span>{item.icon || "📄"}</span>
                      <span className="text-white/80 group-hover:text-white">{item.name}</span>
                    </td>
                    <td className="py-1.5 text-white/40 text-xs">{item.size || "—"}</td>
                    <td className="py-1.5 text-white/40 text-xs">{item.modified || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 text-xs text-white/40 border-t border-white/10 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.2)" }}>
        <span>{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
        {selected && <span>Selected: {selected}</span>}
      </div>
    </div>
  );
}
