"use client";
import { useState } from "react";

const TABS = ["Overview", "Skills", "Projects", "Education", "Certifications"] as const;
type Tab = typeof TABS[number];

const SKILLS = [
  { category: "Languages", items: [{ name: "JavaScript", level: 90 }, { name: "TypeScript", level: 85 }, { name: "Python", level: 80 }, { name: "Java", level: 70 }, { name: "C", level: 60 }] },
  { category: "Frontend", items: [{ name: "React.js", level: 85 }, { name: "Next.js", level: 85 }, { name: "HTML/CSS", level: 90 }, { name: "Tailwind CSS", level: 85 }] },
  { category: "Backend", items: [{ name: "Node.js", level: 75 }, { name: "REST APIs", level: 80 }, { name: "PostgreSQL", level: 80 }, { name: "Prisma ORM", level: 80 }] },
  { category: "Tools", items: [{ name: "Git", level: 85 }, { name: "Docker", level: 60 }, { name: "Linux", level: 75 }, { name: "Postman", level: 80 }] },
];

const PROJECTS = [
  {
    name: "CortexCart",
    desc: "Multi-portal e-commerce platform with Customer, Admin, and Host applications. Built secure role-based workflows and REST APIs for inventory, order, and user management.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Vercel"],
    demo: "https://cortexcart.vercel.app",
    github: "https://github.com/ShaikMuzzammil/cortexcart",
    emoji: "🛒",
    color: "#E95420",
  },
  {
    name: "Smart Query Optimizer",
    desc: "AI-powered SQL workspace supporting natural language to SQL conversion, schema exploration, and query analysis. Built with Monaco Editor.",
    tech: ["Next.js", "Prisma ORM", "PostgreSQL", "AI", "Monaco Editor"],
    demo: "#",
    github: "https://github.com/ShaikMuzzammil",
    emoji: "🔍",
    color: "#3d8af7",
  },
  {
    name: "OmniPoll",
    desc: "Real-time polling platform with Educator and Student portals. Implemented bidirectional WebSockets for instant vote synchronization and live leaderboard updates.",
    tech: ["React", "TypeScript", "WebSockets", "PostgreSQL"],
    demo: "#",
    github: "https://github.com/ShaikMuzzammil",
    emoji: "📊",
    color: "#9C27B0",
  },
  {
    name: "AgroWave",
    desc: "Agriculture analytics dashboard with responsive visualizations for crop and environmental monitoring. Achieved 95+ Lighthouse performance score.",
    tech: ["Next.js", "Tailwind CSS", "Charts", "React"],
    demo: "#",
    github: "https://github.com/ShaikMuzzammil",
    emoji: "🌾",
    color: "#4CAF50",
  },
];

const CERTIFICATIONS = [
  { org: "JPMorgan Chase & Co.", name: "Software Engineering Job Simulation", icon: "🏦", color: "#003087" },
  { org: "Vista Equity Partners", name: "AI in Action Job Simulation", icon: "🤖", color: "#1a1a5e" },
  { org: "Databricks", name: "Generative AI Fundamentals", icon: "🔥", color: "#FF3621" },
  { org: "Google", name: "Gemini for University Students", icon: "🌈", color: "#4285F4" },
];

export default function AboutMe({ windowId }: { windowId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#0d1117", color: "#e6edf3" }}>
      {/* Header */}
      <div className="relative overflow-hidden flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #2C001E 0%, #3d1a4e 50%, #1a1a3a 100%)", padding: "24px 28px 16px" }}>
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 70% 50%, rgba(233,84,32,0.15) 0%, transparent 60%)",
        }} />
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold ring-4 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #E95420, #772953)" }}>
            SM
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Shaik Muzzammil</h1>
            <p className="text-orange-400 font-medium mt-0.5">Full Stack Developer · CSE Student</p>
            <p className="text-white/50 text-sm mt-1">📍 Chennai, India · Amrita Vishwa Vidyapeetham</p>
            <div className="flex gap-3 mt-3">
              <a href="https://github.com/ShaikMuzzammil" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors px-2.5 py-1 rounded-full border border-white/20 hover:border-white/40">
                🐙 GitHub
              </a>
              <a href="https://linkedin.com/in/shaik-muzzammil" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors px-2.5 py-1 rounded-full border border-white/20 hover:border-white/40">
                💼 LinkedIn
              </a>
              <a href="mailto:muzzammil160806@gmail.com"
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors px-2.5 py-1 rounded-full border border-white/20 hover:border-white/40">
                📧 Email
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 relative">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 text-sm rounded-t-lg transition-colors font-medium"
              style={{
                background: activeTab === tab ? "#0d1117" : "transparent",
                color: activeTab === tab ? "#e6edf3" : "rgba(255,255,255,0.5)",
                borderBottom: activeTab === tab ? "2px solid #E95420" : "2px solid transparent",
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "Overview" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Professional Summary</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                Third-year Computer Science undergraduate at Amrita Vishwa Vidyapeetham with experience building
                scalable full-stack web applications, REST APIs, and database-driven systems. Interested in Software
                Engineering, backend development, and designing clean, maintainable software that solves real-world
                engineering problems.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "University", value: "Amrita Vishwa Vidyapeetham" },
                { label: "Degree", value: "B.Tech CSE (2024–2028)" },
                { label: "Location", value: "Chennai, India" },
                { label: "Status", value: "Available for Internship" },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-white/40 text-xs uppercase tracking-wide mb-1">{label}</div>
                  <div className="text-white text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Currently Exploring</h2>
              <div className="flex flex-wrap gap-2">
                {["Artificial Intelligence", "Machine Learning", "LLMs", "System Design", "Distributed Systems"].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(233,84,32,0.15)", color: "#E95420", border: "1px solid rgba(233,84,32,0.3)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Skills" && (
          <div className="space-y-6 max-w-2xl">
            {SKILLS.map((group) => (
              <div key={group.category}>
                <h3 className="text-white/50 text-xs uppercase tracking-widest mb-3">{group.category}</h3>
                <div className="space-y-2.5">
                  {group.items.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-3">
                      <span className="text-sm text-white/80 w-32 flex-shrink-0">{skill.name}</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${skill.level}%`, background: "linear-gradient(90deg, #E95420, #ff6b35)" }} />
                      </div>
                      <span className="text-white/40 text-xs w-8 text-right">{skill.level}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Projects" && (
          <div className="grid grid-cols-2 gap-4">
            {PROJECTS.map((project) => (
              <div key={project.name} className="rounded-xl overflow-hidden transition-transform hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="p-4" style={{ borderBottom: `2px solid ${project.color}30` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{project.emoji}</span>
                    <h3 className="text-white font-semibold">{project.name}</h3>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">{project.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {project.tech.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-xs"
                        style={{ background: `${project.color}20`, color: project.color }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-2.5 flex gap-3">
                  {project.demo !== "#" && (
                    <a href={project.demo} target="_blank" rel="noreferrer"
                      className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1">
                      🔗 Demo
                    </a>
                  )}
                  <a href={project.github} target="_blank" rel="noreferrer"
                    className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1">
                    🐙 GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Education" && (
          <div className="space-y-4 max-w-xl">
            <div className="p-5 rounded-xl" style={{ background: "rgba(233,84,32,0.08)", border: "1px solid rgba(233,84,32,0.2)" }}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎓</div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Amrita Vishwa Vidyapeetham</h3>
                  <p className="text-orange-400 text-sm mt-0.5">B.Tech in Computer Science and Engineering</p>
                  <p className="text-white/50 text-sm mt-1">📍 Chennai, Tamil Nadu</p>
                  <p className="text-white/50 text-sm">📅 2024 – Expected 2028</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-white/50 text-xs uppercase tracking-widest mb-3">Core Coursework</h3>
              <div className="flex flex-wrap gap-2">
                {["Data Structures & Algorithms", "Object-Oriented Programming", "DBMS", "Operating Systems", "Computer Networks", "System Design"].map(c => (
                  <span key={c} className="px-3 py-1 rounded-lg text-xs text-white/70 border border-white/10 bg-white/5">{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Certifications" && (
          <div className="space-y-3 max-w-xl">
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.name} className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-3xl flex-shrink-0">{cert.icon}</div>
                <div>
                  <div className="text-white font-medium text-sm">{cert.name}</div>
                  <div className="text-white/50 text-xs mt-0.5">{cert.org}</div>
                </div>
                <div className="ml-auto">
                  <span className="text-xs px-2.5 py-1 rounded-full text-green-400"
                    style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
                    Verified ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
