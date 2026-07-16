import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
  Cloud,
  Activity,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Home,
  Search,
  Maximize2,
  Minimize2,
  Settings,
  User,
  Info,
  AlertTriangle,
  X,
  CheckCircle,
} from "lucide-react";

export default function Landing({
  setProjectModal,
  setLoginModal,
  setSignInModal,
}: {
  setProjectModal: (value: boolean) => void;
  setLoginModal: (value: boolean) => void;
  setSignInModal: (value: boolean) => void;
}) {
  // Mockup IDE State
  const [activeTab, setActiveTab] = useState<"dracula" | "index">("index");

  // Auto-typing animation for the preview code
  const indexJsCode = `// anc/index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    status: "online",
    message: "Welcome to Kanvas Cloud IDE! 🎨",
    heartbeat: "active"
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;

  const packageJsonCode = `{
  "name": "kanvas-workspace-project",
  "version": "1.0.0",
  "description": "Hosted on AWS EC2 ASG Pre-warmed VM Pool",
  "main": "index.js",
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5"
  }
}`;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] font-sans overflow-x-hidden selection:bg-amber-600/30 selection:text-amber-200">
      {/* Background Radial Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-600/10 via-purple-900/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      <Navbar
        setProjectModal={setProjectModal}
        setSignInModal={setSignInModal}
        setLoginModal={setLoginModal}
      />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 max-w-6xl mx-auto">


        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight leading-tight max-w-5xl bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-400">
          Code from <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">anywhere.</span>
          <br />
          Ship from <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">everywhere.</span>
        </h1>

        <p className="mt-8 text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed">
          Kanvas spins up instant, AWS EC2-backed VS Code workspaces in the cloud. No resource drain, no complex setups — just click and build.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 w-full justify-center">
          <button
            onClick={() => setSignInModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all duration-300 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.55)] hover:scale-105 cursor-pointer"
          >
            <span>Launch Free Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("features");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-300 hover:text-white px-8 py-4 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <span>See Architecture</span>
          </button>
        </div>

        {/* Realistic Interactive VS Code Web Workspace Mockup */}
        <div className="mt-20 w-full max-w-5xl rounded-2xl border border-zinc-800/80 bg-[#1e1e1e] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col">
          <img
            src="/landing.png"
            alt="Kanvas Editor Workspace Mockup"
            className="w-full h-auto object-contain block"
          />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-32 max-w-6xl mx-auto relative border-t border-zinc-900/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent blur-[100px] pointer-events-none" />

        <p className="text-center text-amber-500 text-xs uppercase tracking-widest font-semibold mb-3">
          Platform Architecture
        </p>
        <h2 className="text-center text-3xl md:text-5xl font-extrabold mb-16 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
          Engineered for cloud IDE scale
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-6 h-6 text-amber-500" />,
              title: "Pre-Warmed Pool Scaling",
              desc: "AWS Auto Scaling Groups maintain a standby layer of warm EC2 instances, reducing workspace allocation latency down to milliseconds.",
            },
            {
              icon: <Cloud className="w-6 h-6 text-blue-500" />,
              title: "EC2-Backed Workspaces",
              desc: "Every workspace runs inside dedicated cloud virtual machines equipped with custom proxy-exposed ports, code-server, and Docker layers.",
            },
            {
              icon: <Activity className="w-6 h-6 text-purple-500" />,
              title: "Active-Heartbeat Sweep",
              desc: "Intelligent background daemon monitors user interaction. When you close the browser, our system automatically claims back unused resources.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="relative overflow-hidden group bg-zinc-950/40 border border-zinc-900/80 hover:border-amber-500/20 rounded-2xl p-8 hover:bg-zinc-900/10 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-white text-lg font-bold mb-3 group-hover:text-amber-500 transition-colors">
                {f.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Runtimes Section */}
      <section className="px-6 py-24 border-t border-zinc-900/60 max-w-6xl mx-auto">
        <p className="text-center text-zinc-500 text-sm mb-10 uppercase tracking-widest font-mono">
          Ready-To-Code Runtimes
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Node.js", desc: "Express, TypeScript, NPM", badge: "v20" },
            { name: "React", desc: "Vite, Tailwind, Router", badge: "v19" },
            { name: "Python", desc: "FastAPI, Pipenv, NumPy", badge: "v3.11" },
            { name: "Java", desc: "Java, SDK", badge: "v17" },
          ].map((r) => (
            <div
              key={r.name}
              className="bg-zinc-950/30 border border-zinc-900/80 rounded-xl p-5 hover:border-zinc-800 transition-colors text-left"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold">{r.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  {r.badge}
                </span>
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Innovation Panel */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-orange-950/10 to-zinc-950/60 p-8 md:p-12 shadow-[0_10px_40px_rgba(245,158,11,0.05)]">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-mono uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Zero Cost Waste</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                Save 90% cloud bill with Active-Heartbeat Hibernation
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                When you close your workspace tab, our background lifecycle agent detects the connection loss. The system automatically terminates the EC2 instance, preserving project state in EBS snapshots so you pay only for active coding time.
              </p>
            </div>
            <div className="flex flex-col gap-2 items-center bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 min-w-[240px]">
              <div className="text-zinc-500 text-xs font-mono mb-2 uppercase">Lifecycle status</div>
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Saved to EBS</span>
              </div>
              <div className="text-2xl font-black text-white mt-1">Idle Sleep</div>
              <div className="text-[10px] text-zinc-500 mt-1">Automatic ASG scale-down</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-32 flex flex-col items-center text-center relative border-t border-zinc-900/60 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Ready to launch your workspace?
        </h2>
        <p className="mt-4 text-zinc-400 max-w-md text-sm md:text-base leading-relaxed">
          Spin up your next project in Node.js, React, or Python and experience seamless cloud compilation.
        </p>
        <button
          onClick={() => setSignInModal(true)}
          className="mt-10 bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-8 py-4 rounded-xl text-sm transition-all duration-300 hover:scale-105 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.15)]"
        >
          Create Free Account
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 px-8 py-8 bg-zinc-950/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-zinc-500 text-xs">
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 bg-gradient-to-r from-amber-600 to-orange-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="text-white font-bold text-base">Kanvas</span>
          </div>
          <span className="text-zinc-600 font-mono">
            Designed for developers. Backed by ☁️ AWS ASG & code-server.
          </span>
        </div>
      </footer>
    </div>
  );
}
