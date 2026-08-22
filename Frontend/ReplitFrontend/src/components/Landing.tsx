import {
  Bot,
  Network,
  Server,
  Zap
} from "lucide-react";
import { useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa6";
import Navbar from "./Navbar";
import Pricing from "./Pricing";



export default function Landing({
  setProjectModal,
  setLoginModal,
  setSignInModal,
}: {
  setProjectModal: (value: boolean) => void;
  setLoginModal: (value: boolean) => void;
  setSignInModal: (value: boolean) => void;
}) {
  const [activeFile, setActiveFile] = useState("index.js");

  return (
    <div className="min-h-screen bg-[#080809] text-[#e4e4e7] font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Radial Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[700px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-orange-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Navigation Bar */}
      <Navbar
        setProjectModal={setProjectModal}
        setSignInModal={setSignInModal}
        setLoginModal={setLoginModal}
      />

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 md:px-6 pt-20 pb-16 max-w-5xl mx-auto">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] max-w-4xl text-white">
          Code at the{" "}
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(245,158,11,0.35)]">
            Speed of Thought.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed font-normal">
          Kanvas spins up instant, zero-config cloud environments tailored to your
          programming framework, dependencies, and sample code — just click and code.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full justify-center">
          <button
            onClick={() => setSignInModal(true)}
            className="w-full sm:w-auto inline-flex text-white  bg-amber-700 items-center justify-center gap-3  font-bold px-4 py-3.5 rounded-xl text-sm transition-all duration-300 cursor-pointer"
          >
            <span>Search Free Workspace</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("features");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <span>See Architecture</span>
          </button>
        </div>

        {/* IDE Preview / Workspace Window Mockup */}
        <div className="relative mt-14 w-full max-w-5xl group">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-purple-500/20 rounded-2xl blur-2xl opacity-40 group-hover:opacity-70 transition duration-700 pointer-events-none" />

          {/* Window Container */}
            <div className="relative overflow-hidden w-full h-auto">
              <img
                src="/image.png"
                alt="Kanvas Editor Workspace Mockup"
                className="w-full h-auto object-contain block"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#c3c2b7]/5 to-transparent pointer-events-none opacity-40 group-hover:opacity-10 transition-opacity duration-700" />
            </div>
        </div>
      </section>

      {/* FEATURES SECTION HEADER ("Engineered for cloud IDE scale") */}
      <section id="features" className="px-4 md:px-6 py-20 max-w-6xl mx-auto text-center border-t border-zinc-900/80">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Engineered for cloud IDE scale
        </h2>

        <p className="text-zinc-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed mb-16">
          Our cloud backend dynamically orchestrates complex workspace topologies, ensuring maximum isolation, precise state management, and seamless repository integration for every project and tenant.
        </p>

        {/* 2x2 FEATURES GRID CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto">
          {/* Card 1: AI-Powered Autonomous Agent */}
          <div className="group rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-amber-500/30 p-8 transition-all duration-300 shadow-lg hover:shadow-amber-500/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2 group-hover:text-amber-400 transition-colors">
              AI-Powered Agent Integration
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Built-in intelligent AI assistant that contextually understands your workspace, executes terminal commands, writes code, and automates debugging in real-time.
            </p>
          </div>

          {/* Card 2: Project Isolated Partitions */}
          <div className="group rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-amber-500/30 p-8 transition-all duration-300 shadow-lg hover:shadow-amber-500/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2 group-hover:text-amber-400 transition-colors">
              Project Isolated Partitions
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Every project runs in its own secure, sandboxed container with dedicated compute and memory allocation, ensuring performance and stability for all users.
            </p>
          </div>

          {/* Card 3: Multi-Region Architecture */}
          <div className="group rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-purple-500/30 p-8 transition-all duration-300 shadow-lg hover:shadow-purple-500/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">
              Multi-Region Architecture
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Seamlessly manage complex multi-page repositories across regions, ensuring optimal latency, distributed workspaces, and instant state replication.
            </p>
          </div>

          {/* Card 4: Custom Proxy Layers */}
          <div className="group rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-blue-500/30 p-8 transition-all duration-300 shadow-lg hover:shadow-blue-500/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
              Custom Proxy Layers
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Advanced networking with custom exposed ports and webhooks dynamically provisioned for every project environment, routing requests safely over HTTPS.
            </p>
          </div>
        </div>

      </section>

      {/* PRICING SECTION */}
      <Pricing />

      {/* ABOUT / FOOTER SECTION */}
      <footer id="about" className="border-t border-zinc-900 bg-[#060607] p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-left mb-2">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-tr from-amber-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                  <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.5" />
                  <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.5" />
                  <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-[#c3c2b7]">KANVAS</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Next-generation cloud IDE platform built for modern cloud development and instant workspace provisioning.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-[#c3c2b7]">PRODUCT</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-amber-400 transition-colors">Pricing</a></li>
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Workspaces</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-[#c3c2b7] text-xs font-bold uppercase tracking-wider mb-4">COMPANY</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#about" className="hover:text-amber-400 transition-colors">About</a></li>
              <li><a href="#about" className="hover:text-amber-400 transition-colors">Careers</a></li>
              <li><a href="#about" className="hover:text-amber-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-[#c3c2b7] text-xs font-bold uppercase tracking-wider mb-4">RESOURCES</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Documentation</a></li>
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Guides</a></li>
              <li><a href="#features" className="hover:text-amber-400 transition-colors">API Reference</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
      </footer>
        <div className="mx-auto p-4 bg-[#2c2c2a] border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-zinc-500">
          <p>© 2026 Kanvas System Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <FaGithub className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
            <FaTwitter className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
            <FaLinkedin className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
    </div>
  );
}

