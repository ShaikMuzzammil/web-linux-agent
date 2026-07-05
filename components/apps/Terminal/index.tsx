"use client";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useSession } from "next-auth/react";

interface HistoryLine {
  type: "input" | "output" | "error" | "info";
  content: string;
}

const FILES: Record<string, string> = {
  "/home/muzzammil/readme.txt": `Welcome to Shaik Muzzammil's Web Linux Terminal!
========================================
Type 'help' to see available commands.
Type 'about' to learn about me.
Type 'projects' to see my projects.
Type 'skills' to see my technical skills.
`,
  "/home/muzzammil/resume.txt": `SHAIK MUZZAMMIL
========================
CSE Student @ Amrita Vishwa Vidyapeetham (2024-2028)
Full Stack Developer | Chennai, India
Email: muzzammil160806@gmail.com
GitHub: ShaikMuzzammil
LinkedIn: shaik-muzzammil
`,
  "/home/muzzammil/projects/cortexcart.md": `# CortexCart
Multi-portal e-commerce platform built with Next.js, TypeScript, and PostgreSQL.
Features: Customer portal, Admin dashboard, Host management, AI recommendations.
`,
  "/home/muzzammil/projects/smart-query-optimizer.md": `# Smart Query Optimizer
AI-powered SQL workspace with natural language to SQL conversion.
Built with Next.js, Prisma ORM, PostgreSQL, Monaco Editor.
`,
};

const DIRS: Record<string, string[]> = {
  "/": ["home", "etc", "usr", "var", "tmp"],
  "/home": ["muzzammil"],
  "/home/muzzammil": ["readme.txt", "resume.txt", "projects", "documents", "downloads"],
  "/home/muzzammil/projects": ["cortexcart.md", "smart-query-optimizer.md", "omnipoll.md", "agrowave.md"],
  "/home/muzzammil/documents": [],
  "/home/muzzammil/downloads": [],
};

export default function Terminal({ windowId }: { windowId: string }) {
  const { data: session } = useSession();
  const username = session?.user?.name?.split(" ")[0]?.toLowerCase() || "guest";
  const hostname = "muzzammil-pc";
  const [history, setHistory] = useState<HistoryLine[]>([
    { type: "info", content: `Ubuntu 22.04.3 LTS - Web Linux Agent v2.0` },
    { type: "info", content: `Built by Shaik Muzzammil | Type 'help' for commands` },
    { type: "info", content: `Last login: ${new Date().toDateString()}` },
    { type: "output", content: "" },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/home/muzzammil");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const addOutput = (lines: string[], type: HistoryLine["type"] = "output") => {
    setHistory((prev) => [
      ...prev,
      ...lines.map((content) => ({ type, content })),
    ]);
  };

  const prompt = `${username}@${hostname}:${cwd.replace("/home/muzzammil", "~")}$ `;

  const processCommand = (cmd: string) => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    addOutput([`${prompt}${cmd}`], "input");

    switch (command) {
      case "":
        break;

      case "help":
        addOutput([
          "  AVAILABLE COMMANDS",
          "  ─────────────────────────────────────────",
          "  Navigation:    ls, cd, pwd, mkdir, rm, cp, mv",
          "  View:          cat, echo, clear, history",
          "  Info:          whoami, uname, date, uptime, neofetch",
          "  Portfolio:     about, skills, projects, education, contact",
          "  Network:       ping, curl, wget (simulated)",
          "  Process:       ps, top, kill",
          "  Fun:           cowsay, fortune, matrix, sl",
          "  Other:         sudo, apt, git, node, python3",
        ]);
        break;

      case "about":
        addOutput([
          "",
          "  ╔═══════════════════════════════════════╗",
          "  ║      SHAIK MUZZAMMIL                  ║",
          "  ║      Full Stack Developer              ║",
          "  ╚═══════════════════════════════════════╝",
          "",
          "  👨‍💻  3rd Year CSE Student @ Amrita Vishwa Vidyapeetham",
          "  📍  Chennai, India",
          "  📧  muzzammil160806@gmail.com",
          "  🔗  github.com/ShaikMuzzammil",
          "  🔗  linkedin.com/in/shaik-muzzammil",
          "",
          "  Building scalable full-stack apps, REST APIs,",
          "  and database-driven systems. Interested in",
          "  Software Engineering and backend development.",
          "",
        ]);
        break;

      case "neofetch":
        addOutput([
          "",
          "          .-/+oossssoo+/-.               \x1b[1;37mmuzzammil\x1b[0m@\x1b[1;37mmuzzammil-pc",
          "        ':+ssssssssssssssss+:`           ─────────────────────",
          "      -+ssssssssssssssssss+:-           \x1b[1;33mOS\x1b[0m: Ubuntu 22.04.3 LTS",
          "    .ossssssssssssssssssss/`             \x1b[1;33mHost\x1b[0m: Web Linux Agent",
          `   /sssssssssssssssssssss+               \x1b[1;33mKernel\x1b[0m: 5.15.0-91-generic`,
          "  +sssssssssssssssssssssss.              \x1b[1;33mUptime\x1b[0m: ${Math.floor(Date.now()/3600000 % 24)}h ${Math.floor(Date.now()/60000 % 60)}m",
          " `sssssssssssssssssssssssss`             \x1b[1;33mShell\x1b[0m: bash 5.1.16",
          " .sssssssssssssssssssssssss.             \x1b[1;33mResolution\x1b[0m: 1920x1080",
          " +ssss################sssss+             \x1b[1;33mDE\x1b[0m: GNOME 42.5",
          " +ssss################sssss+             \x1b[1;33mTerminal\x1b[0m: Web Terminal",
          " .sssssssssssssssssssssssss.             \x1b[1;33mCPU\x1b[0m: Intel i7-12700H",
          " `sssssssssssssssssssssssss`             \x1b[1;33mMemory\x1b[0m: 2.1GiB / 16GiB",
          "  +sssssssssssssssssssssss.              ",
          "   /sssssssssssssssssssss+               \x1b[30m████\x1b[31m████\x1b[32m████\x1b[33m████",
          "    .ossssssssssssssssssss/`             \x1b[34m████\x1b[35m████\x1b[36m████\x1b[37m████",
          "      -+ssssssssssssssssss+:-",
          "        ':+ssssssssssssssss+:`",
          "          .-/+oossssoo+/-.   ",
          "",
        ]);
        break;

      case "skills":
        addOutput([
          "",
          "  TECHNICAL SKILLS",
          "  ──────────────────────────────────────",
          "  Languages  │ Python  ████████░░ 80%",
          "             │ Java    ███████░░░ 70%",
          "             │ C       ██████░░░░ 60%",
          "  ──────────────────────────────────────",
          "  Web        │ JavaScript  █████████░ 90%",
          "             │ TypeScript  ████████░░ 80%",
          "             │ React.js    ████████░░ 80%",
          "             │ Next.js     ████████░░ 80%",
          "             │ Node.js     ███████░░░ 70%",
          "  ──────────────────────────────────────",
          "  Databases  │ PostgreSQL  ████████░░ 80%",
          "             │ Prisma ORM  ████████░░ 80%",
          "  ──────────────────────────────────────",
          "  DevOps     │ Git         ████████░░ 80%",
          "             │ Docker      ██████░░░░ 60%",
          "             │ Linux       ███████░░░ 70%",
          "  ──────────────────────────────────────",
          "  Exploring  │ AI/ML, LLMs, System Design",
          "",
        ]);
        break;

      case "projects":
        addOutput([
          "",
          "  MY PROJECTS",
          "  ─────────────────────────────────────────────────",
          "",
          "  1. CortexCart — E-Commerce Platform",
          "     Next.js · TypeScript · PostgreSQL · Prisma",
          "     Multi-portal platform with Customer, Admin & Host apps",
          "     🔗 github.com/ShaikMuzzammil/cortexcart",
          "",
          "  2. Smart Query Optimizer — SQL Workspace",
          "     Next.js · Monaco Editor · AI · PostgreSQL",
          "     AI-powered SQL tool with natural language conversion",
          "     🔗 github.com/ShaikMuzzammil/smart-query-optimizer",
          "",
          "  3. OmniPoll — Real-Time Polling",
          "     React · TypeScript · WebSockets · PostgreSQL",
          "     Live polling with WebSocket sync & leaderboards",
          "     🔗 github.com/ShaikMuzzammil/omnipoll",
          "",
          "  4. AgroWave — Agriculture Dashboard",
          "     Next.js · Tailwind CSS · Charts",
          "     Analytics dashboard with 95+ Lighthouse score",
          "     🔗 github.com/ShaikMuzzammil/agrowave",
          "",
        ]);
        break;

      case "education":
        addOutput([
          "",
          "  EDUCATION",
          "  ──────────────────────────────────────────",
          "  🎓 Amrita Vishwa Vidyapeetham, Chennai",
          "     B.Tech in Computer Science & Engineering",
          "     Expected Graduation: 2028",
          "",
          "  CERTIFICATIONS",
          "  ──────────────────────────────────────────",
          "  ✓ JPMorgan Chase & Co. — Software Engineering",
          "  ✓ Vista Equity Partners — AI in Action",
          "  ✓ Databricks — Generative AI Fundamentals",
          "  ✓ Google — Gemini for University Students",
          "",
        ]);
        break;

      case "contact":
        addOutput([
          "",
          "  CONTACT",
          "  ──────────────────────────────────────",
          "  📧 Email:    muzzammil160806@gmail.com",
          "  📱 Phone:    +91 9100128504",
          "  🐙 GitHub:   github.com/ShaikMuzzammil",
          "  💼 LinkedIn: linkedin.com/in/shaik-muzzammil",
          "  📍 Location: Chennai, Tamil Nadu, India",
          "",
          "  Or open the Contact app from the dock!",
          "",
        ]);
        break;

      case "ls": {
        const path = args[0] ? (args[0].startsWith("/") ? args[0] : `${cwd}/${args[0]}`) : cwd;
        const contents = DIRS[path];
        if (contents !== undefined) {
          if (contents.length === 0) {
            addOutput(["(empty directory)"]);
          } else {
            const formatted = contents.map((item) => {
              const isDir = DIRS[`${path}/${item}`] !== undefined || DIRS[`/${item}`] !== undefined;
              return isDir ? `\x1b[1;34m${item}/\x1b[0m` : item;
            });
            addOutput([formatted.join("  ")]);
          }
        } else {
          addOutput([`ls: cannot access '${path}': No such file or directory`], "error");
        }
        break;
      }

      case "cd": {
        const target = args[0] || "/home/muzzammil";
        const newPath = target === "~" ? "/home/muzzammil" :
          target === ".." ? cwd.split("/").slice(0, -1).join("/") || "/" :
          target.startsWith("/") ? target : `${cwd}/${target}`;
        if (DIRS[newPath] !== undefined) {
          setCwd(newPath);
        } else {
          addOutput([`bash: cd: ${target}: No such file or directory`], "error");
        }
        break;
      }

      case "pwd":
        addOutput([cwd]);
        break;

      case "cat": {
        if (!args[0]) { addOutput(["cat: missing operand"], "error"); break; }
        const filePath = args[0].startsWith("/") ? args[0] : `${cwd}/${args[0]}`;
        const content = FILES[filePath];
        if (content) {
          addOutput(content.split("\n"));
        } else {
          addOutput([`cat: ${args[0]}: No such file or directory`], "error");
        }
        break;
      }

      case "echo":
        addOutput([args.join(" ")]);
        break;

      case "whoami":
        addOutput([username]);
        break;

      case "date":
        addOutput([new Date().toString()]);
        break;

      case "uname":
        addOutput([args.includes("-a") ? "Linux muzzammil-pc 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux" : "Linux"]);
        break;

      case "uptime": {
        const now = new Date();
        addOutput([` ${now.toLocaleTimeString()} up ${Math.floor(Math.random() * 48 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")},  1 user,  load average: 0.12, 0.08, 0.09`]);
        break;
      }

      case "ps":
        addOutput([
          "  PID TTY          TIME CMD",
          "    1 ?        00:00:01 systemd",
          " 1234 pts/0    00:00:00 bash",
          " 5678 pts/0    00:00:00 node",
          " 9012 pts/0    00:00:00 ps",
        ]);
        break;

      case "top":
        addOutput([
          "top - " + new Date().toLocaleTimeString(),
          "Tasks: 142 total, 1 running, 141 sleeping",
          "Cpu(s): 2.3%us, 0.8%sy, 0.0%ni, 96.5%id",
          "MiB Mem: 16384.0 total, 8192.0 free, 4096.0 used",
          "  PID USER    PR  NI  VIRT   RES SHR  S  %CPU %MEM  TIME+ COMMAND",
          " 1234 muzzam  20   0  512M  128M  32M  S   1.2  0.8  0:12.34 node",
          " 5678 muzzam  20   0  256M   64M  16M  S   0.3  0.4  0:02.11 bash",
        ]);
        break;

      case "clear":
        setHistory([]);
        break;

      case "history":
        addOutput(cmdHistory.map((c, i) => `  ${String(i + 1).padStart(4)} ${c}`));
        break;

      case "ping": {
        const host = args[0] || "google.com";
        addOutput([
          `PING ${host} (142.250.195.46) 56(84) bytes of data.`,
          `64 bytes from ${host}: icmp_seq=1 ttl=115 time=12.3 ms`,
          `64 bytes from ${host}: icmp_seq=2 ttl=115 time=11.8 ms`,
          `64 bytes from ${host}: icmp_seq=3 ttl=115 time=12.1 ms`,
          `--- ${host} ping statistics ---`,
          `3 packets transmitted, 3 received, 0% packet loss`,
          `rtt min/avg/max/mdev = 11.8/12.1/12.3/0.2 ms`,
        ]);
        break;
      }

      case "mkdir":
        if (!args[0]) { addOutput(["mkdir: missing operand"], "error"); break; }
        addOutput([`Directory '${args[0]}' created.`]);
        break;

      case "git":
        if (args[0] === "status") {
          addOutput([
            "On branch main",
            "Your branch is up to date with 'origin/main'.",
            "nothing to commit, working tree clean",
          ]);
        } else if (args[0] === "log") {
          addOutput([
            "commit a3f8e12 (HEAD -> main)",
            "Author: Shaik Muzzammil <muzzammil160806@gmail.com>",
            "Date:   " + new Date().toDateString(),
            "",
            "    feat: complete web linux agent with full features",
          ]);
        } else {
          addOutput([`git: '${args[0]}' subcommand simulated`]);
        }
        break;

      case "node":
        addOutput(["Node.js v18.19.0 (simulated)"]);
        break;

      case "python3":
        if (args[0]) {
          addOutput([`python3: Running ${args[0]} (simulated)`]);
        } else {
          addOutput(["Python 3.11.6 (simulated REPL - type 'exit' to quit)"]);
        }
        break;

      case "sudo":
        addOutput(["[sudo] password for muzzammil:", "Sorry, try again. (simulated)"]);
        break;

      case "apt":
        if (args[0] === "update") {
          addOutput(["Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease", "Reading package lists... Done"]);
        } else if (args[0] === "install") {
          addOutput([`Installing ${args.slice(1).join(" ")}... Done (simulated)`]);
        } else {
          addOutput(["apt: simulated package manager"]);
        }
        break;

      case "cowsay": {
        const msg = args.join(" ") || "Moo!";
        addOutput([
          ` ${"_".repeat(msg.length + 2)}`,
          `< ${msg} >`,
          ` ${"─".repeat(msg.length + 2)}`,
          "        \\   ^__^",
          "         \\  (oo)\\_______",
          "            (__)\\       )\\/\\",
          "                ||----w |",
          "                ||     ||",
        ]);
        break;
      }

      case "fortune":
        addOutput([
          `"The best way to predict the future is to invent it." — Alan Kay`,
        ]);
        break;

      case "matrix":
        addOutput([
          "\x1b[32mEntering the Matrix...\x1b[0m",
          "\x1b[32m01001000 01100101 01101100 01101100 01101111\x1b[0m",
          "\x1b[32m01010111 01101111 01110010 01101100 01100100\x1b[0m",
          "\x1b[32m[Matrix simulation complete — wake up, Muzzammil!]\x1b[0m",
        ]);
        break;

      case "sl":
        addOutput([
          "     ====        ________                ___________    ",
          " _D _|  |_______/        \\__I_I_____===__|_________|   ",
          "  |(_)---  |   H\\________/ |   |        =|___ ___|     ",
          "  /     |  |   H  |  |     |   |         ||_| |_||     ",
          " |      |  |   H  |__--------------------| [___] |     ",
          " | ________|___H__/__|_____/[][]~\\_______|       |    ",
          " |/ |   |-----------I_____I [][] []  D   |=======|__  ",
          "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__  ",
          " |/-=|___|=O=====O=====O=====O|_____/~\\___/  (choo choo!)",
          "  \\_/      \\__/  \\__/  \\__/  \\__/       \\_\\_",
        ]);
        break;

      default:
        addOutput([`bash: ${command}: command not found`, `Type 'help' to see available commands.`], "error");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cmd = input.trim();
      if (cmd) setCmdHistory((prev) => [cmd, ...prev]);
      processCommand(input);
      setInput("");
      setHistoryIdx(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(newIdx);
      setInput(cmdHistory[newIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(newIdx);
      setInput(newIdx === -1 ? "" : cmdHistory[newIdx]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Basic tab completion
      const cmds = ["help", "about", "skills", "projects", "education", "contact", "ls", "cd", "pwd", "cat", "echo", "whoami", "neofetch", "clear", "history", "git", "node", "python3"];
      const match = cmds.find((c) => c.startsWith(input));
      if (match) setInput(match);
    } else if (e.key === "l" && e.ctrlKey) {
      setHistory([]);
    }
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: "#300A24", fontFamily: "'Ubuntu Mono', 'Courier New', monospace", fontSize: 14 }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Menu bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 text-xs text-white/50 border-b border-white/10"
        style={{ background: "rgba(0,0,0,0.3)" }}>
        <span className="hover:text-white cursor-pointer">File</span>
        <span className="hover:text-white cursor-pointer">Edit</span>
        <span className="hover:text-white cursor-pointer">View</span>
        <span className="hover:text-white cursor-pointer">Terminal</span>
        <span className="hover:text-white cursor-pointer">Help</span>
      </div>

      {/* Terminal output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {history.map((line, i) => (
          <div key={i} className="leading-5">
            {line.type === "input" ? (
              <span className="text-green-400">{line.content}</span>
            ) : line.type === "error" ? (
              <span className="text-red-400">{line.content}</span>
            ) : line.type === "info" ? (
              <span className="text-blue-300">{line.content}</span>
            ) : (
              <span className="text-gray-200">{line.content}</span>
            )}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center">
          <span className="text-green-400 mr-1 flex-shrink-0">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none caret-white text-sm"
            style={{ fontFamily: "inherit", fontSize: "inherit" }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
