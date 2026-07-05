"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

const CONTACT_INFO = [
  { icon: "📧", label: "Email", value: "muzzammil160806@gmail.com", link: "mailto:muzzammil160806@gmail.com" },
  { icon: "🐙", label: "GitHub", value: "github.com/ShaikMuzzammil", link: "https://github.com/ShaikMuzzammil" },
  { icon: "💼", label: "LinkedIn", value: "linkedin.com/in/shaik-muzzammil", link: "https://linkedin.com/in/shaik-muzzammil" },
  { icon: "📱", label: "Phone", value: "+91 9100128504", link: "tel:+919100128504" },
  { icon: "📍", label: "Location", value: "Chennai, Tamil Nadu, India", link: null },
];

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact({ windowId }: { windowId: string }) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("sent");
        setForm((f) => ({ ...f, subject: "", message: "" }));
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0d1117", color: "#e6edf3" }}>
      {/* Header */}
      <div className="relative overflow-hidden px-7 py-6 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #2C001E, #3d1a4e, #1a1a3a)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, rgba(233,84,32,0.4) 0%, transparent 60%)" }} />
        <div className="relative">
          <div className="text-3xl mb-1">📬</div>
          <h1 className="text-xl font-bold text-white">Get in Touch</h1>
          <p className="text-white/50 text-sm mt-1">I respond within 24–48 hours. All messages go to my inbox.</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-6" style={{ minHeight: "calc(100% - 110px)" }}>
        {/* Contact form */}
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Send a Message</h2>

          {status === "sent" ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl text-center"
              style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-white font-semibold text-lg mb-2">Message Sent!</h3>
              <p className="text-white/60 text-sm mb-4">Thanks for reaching out. I'll get back to you soon — check your email for a confirmation.</p>
              <button onClick={() => setStatus("idle")}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: "#E95420" }}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block font-medium">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Shaik Muzzammil"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-colors focus:ring-1"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block font-medium">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Internship Inquiry / Collaboration / Project..."
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-colors resize-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {status === "error" && (
                <div className="text-red-400 text-xs p-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: status === "sending" ? "#666" : "linear-gradient(135deg, #E95420, #772953)" }}>
                {status === "sending" ? (
                  <>
                    <span className="inline-block animate-spin">⟳</span>
                    Sending...
                  </>
                ) : (
                  <>📤 Send Message</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Contact info panel */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Contact Info</h2>

          {CONTACT_INFO.map((info) => (
            <div key={info.label} className="flex items-start gap-3 p-3.5 rounded-xl transition-all hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-2xl flex-shrink-0">{info.icon}</span>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wide mb-0.5">{info.label}</div>
                {info.link ? (
                  <a href={info.link} target="_blank" rel="noreferrer"
                    className="text-sm text-white/80 hover:text-orange-400 transition-colors hover:underline">
                    {info.value}
                  </a>
                ) : (
                  <span className="text-sm text-white/80">{info.value}</span>
                )}
              </div>
            </div>
          ))}

          {/* Availability badge */}
          <div className="mt-6 p-4 rounded-xl"
            style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-semibold">Available for Opportunities</span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
              Open to internships, freelance projects, and full-time roles after graduation (2028).
            </p>
          </div>

          {/* Response time */}
          <div className="p-4 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Avg Response Time</div>
            <div className="text-white font-semibold">⚡ Within 24 hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}
