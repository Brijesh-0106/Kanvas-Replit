import Navbar from "./Navbar";

function Landing({
  setProjectModal,
  setLoginModal,
  setSignInModal,
}: {
  setProjectModal: (value: boolean) => void;
  setLoginModal: (value: boolean) => void;
  setSignInModal: (value: boolean) => void;
}) {
  return (
    <>
      <div className="min-h-screen bg-[#1a1a1a] text-[#c3c2b7] font-sans overflow-x-hidden">
        <Navbar
          setProjectModal={setProjectModal}
          setSignInModal={setSignInModal}
          setLoginModal={setLoginModal}
        />

        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl">
            Code from <span className="text-amber-600">anywhere.</span>
            <br />
            Ship from{" "}
            <span className="relative inline-block">
              everywhere.
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-400/40 rounded-full"></span>
            </span>
          </h1>

          <p className="mt-6 text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
            Kanvas gives you a full VS Code environment in the cloud — pick a
            project type and start coding in seconds. No installs, no config.
          </p>

          <div className="flex items-center gap-4 mt-10">
            <button
              onClick={() => setSignInModal(true)}
              className="border-amber-600 border cursor-pointer text-amber-600 font-semibold px-7 py-3.5 rounded-xl text-sm transition-all hover:scale-105"
            >
              Start for free →
            </button>
            <button className="text-gray-400 hover:text-[#c3c2b7] text-sm font-medium transition-colors px-4 py-3.5">
              See how it works
            </button>
          </div>

          {/* Editor preview */}
          <div className="mt-16 w-full max-w-4xl rounded-2xl border border-[#c3c2b7]/10 bg-[#111111] overflow-hidden shadow-2xl shadow-black/60">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#c3c2b7]/10 bg-[#0d0d0d]">
              <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
              <span className="ml-3 text-gray-500 text-xs font-mono">
                kanvas.dev / my-project
              </span>
            </div>
            {/* Fake editor */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-48 border-r border-[#c3c2b7]/10 p-3 text-xs font-mono text-gray-500 hidden md:block">
                <div className="text-gray-300 mb-2 text-[11px] uppercase tracking-wider">
                  Explorer
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-orange-400">
                    📁 src
                  </div>
                  <div className="flex items-center gap-1.5 pl-4">
                    📄 App.tsx
                  </div>
                  <div className="flex items-center gap-1.5 pl-4 text-gray-300 bg-[#c3c2b7]/5 rounded px-1">
                    📄 index.tsx
                  </div>
                  <div className="flex items-center gap-1.5">
                    📄 package.json
                  </div>
                  <div className="flex items-center gap-1.5">
                    📄 vite.config.ts
                  </div>
                </div>
              </div>
              {/* Code area */}
              <div className="flex-1 p-5 font-mono text-sm text-left leading-7 overflow-hidden">
                <div>
                  <span className="text-purple-400">import</span>{" "}
                  <span className="text-blue-300">React</span>{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">'react'</span>
                </div>
                <div className="mt-2">
                  <span className="text-purple-400">
                    export default function
                  </span>{" "}
                  <span className="text-yellow-300">App</span>
                  <span className="text-[#c3c2b7]">() {"{"}</span>
                </div>
                <div className="pl-6">
                  <span className="text-purple-400">return</span>{" "}
                  <span className="text-[#c3c2b7]">(</span>
                </div>
                <div className="pl-10">
                  <span className="text-orange-300">&lt;div</span>{" "}
                  <span className="text-blue-300">className</span>
                  <span className="text-[#c3c2b7]">=</span>
                  <span className="text-green-400">"app"</span>
                  <span className="text-orange-300">&gt;</span>
                </div>
                <div className="pl-14">
                  <span className="text-orange-300">&lt;h1&gt;</span>
                  <span className="text-[#c3c2b7]">Hello, Kanvas </span>
                  <span className="text-yellow-300">🎨</span>
                  <span className="text-orange-300">&lt;/h1&gt;</span>
                </div>
                <div className="pl-10">
                  <span className="text-orange-300">&lt;/div&gt;</span>
                </div>
                <div className="pl-6">
                  <span className="text-[#c3c2b7]">)</span>
                </div>
                <div>
                  <span className="text-[#c3c2b7]">{"}"}</span>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <span className="text-gray-600">|</span>
                  <span className="w-2 h-4 bg-orange-400 animate-pulse inline-block"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-8 py-20 max-w-5xl mx-auto">
          <p className="text-center text-orange-400 text-xs uppercase tracking-widest font-semibold mb-4">
            Why Kanvas
          </p>
          <h2 className="text-center text-3xl font-bold mb-14 text-[#c3c2b7]">
            Everything you need to build
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Instant workspaces",
                desc: "Pick Node, React, or Python — your environment spins up in seconds with everything pre-installed.",
              },
              {
                icon: "☁️",
                title: "Runs in the cloud",
                desc: "Full EC2-backed instances with VS Code. No laptop resources used, just open your browser and code.",
              },
              {
                icon: "🔒",
                title: "Your projects, safe",
                desc: "Projects are saved and persisted. Come back tomorrow and pick up exactly where you left off.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#111111] border border-[#c3c2b7]/10 rounded-2xl p-6 hover:border-amber-600/30 transition-all group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-[#c3c2b7] font-semibold mb-2 group-hover:text-orange-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stacks */}
        <section className="px-8 py-16 border-t border-[#c3c2b7]/10">
          <p className="text-center text-gray-500 text-sm mb-8">
            Supported runtimes
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {[
              { label: "Node.js", color: "text-green-400" },
              { label: "React", color: "text-blue-400" },
              { label: "Python", color: "text-yellow-400" },
              { label: "Full Stack", color: "text-orange-400" },
            ].map((s) => (
              <span
                key={s.label}
                className={`${s.color} font-semibold text-lg opacity-60 hover:opacity-100 transition-opacity`}
              >
                {s.label}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-8 py-24 flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold mb-4 text-[#c3c2b7]">
            Ready to start building?
          </h2>
          <p className=" mb-8 text-[#c3c2b7] max-w-md">
            Create your free account and launch your first workspace in under a
            minute.
          </p>
          <button
            onClick={() => setSignInModal(true)}
            className="bg-orange-700 text-[#c3c2b7] font-semibold px-8 py-4 rounded-xl text-sm transition-all hover:scale-105"
          >
            Create free account →
          </button>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#c3c2b7]/10 px-8 py-3 flex items-center justify-between text-gray-600 text-xs">
          <div className="flex gap-1 items-center">
            <div
              style={{
                width: 24,
                height: 24,
                background: "#f97316",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                <rect
                  x="8"
                  y="1"
                  width="5"
                  height="5"
                  rx="1"
                  fill="white"
                  opacity="0.5"
                />
                <rect
                  x="1"
                  y="8"
                  width="5"
                  height="5"
                  rx="1"
                  fill="white"
                  opacity="0.5"
                />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
              </svg>
            </div>
            <span className="text-[#c3c2b7] font-bold text-lg">Kanvas</span>
          </div>
          <span className="text-[#c3c2b7] font-bold text-md">
            Built with ☁️ on AWS
          </span>
        </footer>
      </div>
    </>
  );
}

export default Landing;
