import {
  ArrowRight,
  Cloud,
  Code2,
  Cpu,
  Layers,
  Lightbulb,
  MousePointer2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaGithub, FaTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

interface LandingProps {
  setProjectModal: (value: boolean) => void;
  setLoginModal: (value: boolean) => void;
  setSignInModal: (value: boolean) => void;
}

export default function Landing({
  setProjectModal,
  setLoginModal,
  setSignInModal,
}: LandingProps) {
  const [stage, setStage] = useState<number>(1);
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    setToken(localStorage.getItem("token") ?? "");
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (stage === 1) {
      setIsClicking(false);
      timer = setTimeout(() => setStage(2), 2000);
    } else if (stage === 2) {
      timer = setTimeout(() => setStage(3), 2000);
    } else if (stage === 3) {
      timer = setTimeout(() => setStage(4), 2000);
    } else if (stage === 4) {
      timer = setTimeout(() => setStage(5), 2000);
    } else if (stage === 5) {
      timer = setTimeout(() => setStage(6), 2000);
    } else if (stage === 6) {
      // Stage 6: Cursor moves in, clicks Kanvas logo, then reveals screen
      const clickTimer = setTimeout(() => {
        setIsClicking(true);
      }, 1000);

      const openScreenTimer = setTimeout(() => {
        setStage(7);
      }, 1600);

      return () => {
        clearTimeout(clickTimer);
        clearTimeout(openScreenTimer);
      };
    } else if (stage === 7) {
      // Stage 7: Show website screen for 4s, then loop back to Stage 1
      timer = setTimeout(() => {
        setStage(1);
        setIsClicking(false);
      }, 4200);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [stage]);

  const handlePrimaryAction = () => {
    if (token) {
      setProjectModal(true);
    } else {
      setSignInModal(true);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen bg-[#0a0a0c] text-zinc-200 flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* CLEAN MINIMAL HEADER */}
      <header className="h-14 border-b border-zinc-800/80 bg-[#101014]/90 px-4 sm:px-8 flex items-center justify-between z-20 shrink-0">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-zinc-800 border border-zinc-700 rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="#e4e4e7" />
              <rect
                x="8"
                y="1"
                width="5"
                height="5"
                rx="1"
                fill="#e4e4e7"
                opacity="0.4"
              />
              <rect
                x="1"
                y="8"
                width="5"
                height="5"
                rx="1"
                fill="#e4e4e7"
                opacity="0.4"
              />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="#e4e4e7" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight text-amber-700">
            Kanvas
          </span>
        </Link>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className="text-xs sm:text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-md transition-colors"
          >
            Pricing
          </Link>

          {!token ? (
            <>
              <button
                onClick={() => setLoginModal(true)}
                className="text-xs border sm:text-sm text-amber-700 hover:border-amber-700 px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => setSignInModal(true)}
                className=" hover:bg-white text-zinc-950 bg-amber-700 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-md transition-all cursor-pointer shadow-sm"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="text-xs sm:text-sm text-zinc-300 hover:text-white px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => setProjectModal(true)}
                className="bg-zinc-100 hover:bg-white text-zinc-950 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-md transition-all cursor-pointer shadow-sm"
              >
                New Project
              </button>
            </>
          )}
        </div>
      </header>

      {/* CENTRAL MAIN WORKSPACE BOX (Clean frame without terminal look) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 max-w-5xl mx-auto w-full overflow-hidden">
        <div className="relative w-full h-[66vh] min-h-[420px] max-h-[560px] rounded-2xl bg-[#121216] border border-zinc-800 shadow-2xl flex flex-col justify-center items-center  overflow-hidden">
          {/* STAGES 1 to 5: Sequential Stacking Clean Popups (No step tags on top right) */}
          {stage <= 5 && (
            <div className="relative z-10 w-full max-w-lg flex flex-col gap-2.5 my-auto">
              {/* Popup 1 */}
              {stage >= 1 && (
                <div className="p-3.5 rounded-xl bg-[#18181e] border border-zinc-750/90 shadow-lg flex items-start gap-3 transform transition-all duration-300 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center shrink-0 text-zinc-200">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Got a new idea?
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      A new application, SaaS tool, or web platform concept is
                      ready to build.
                    </p>
                  </div>
                </div>
              )}

              {/* Popup 2 (Appears below popup 1) */}
              {stage >= 2 && (
                <div className="p-3.5 rounded-xl bg-[#18181e] border border-zinc-750/90 shadow-lg flex items-start gap-3 transform transition-all duration-300 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center shrink-0 text-zinc-200">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Don't have code writer to write
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      No local IDE configured, missing packages, and zero
                      boilerplate ready.
                    </p>
                  </div>
                </div>
              )}

              {/* Popup 3 (Appears below popup 2) */}
              {stage >= 3 && (
                <div className="p-3.5 rounded-xl bg-[#18181e] border border-zinc-750/90 shadow-lg flex items-start gap-3 transform transition-all duration-300 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center shrink-0 text-zinc-200">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Use Kanvas
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Switch to Kanvas for instant, zero-setup cloud development
                      workspaces.
                    </p>
                  </div>
                </div>
              )}

              {/* Popup 4 (Appears below popup 3) */}
              {stage >= 4 && (
                <div className="p-3.5 rounded-xl bg-[#18181e] border border-zinc-750/90 shadow-lg flex items-start gap-3 transform transition-all duration-300 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center shrink-0 text-zinc-200">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Get new IDE on cloud
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Isolated cloud sandbox provisioned in seconds with full
                      runtime and dependencies.
                    </p>
                  </div>
                </div>
              )}

              {/* Popup 5 (Appears below popup 4) */}
              {stage >= 5 && (
                <div className="p-3.5 rounded-xl bg-[#18181e] border border-zinc-750/90 shadow-lg flex items-start gap-3 transform transition-all duration-300 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center shrink-0 text-zinc-200">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Implement your idea here
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Write code, run commands, test in real-time, and ship your
                      project.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE 6: Solution: Kanvas Logo + Animated Cursor Click */}
          {stage === 6 && (
            <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center text-center animate-fade-in space-y-4">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                Solution
              </span>

              {/* Kanvas Interactive Button */}
              <div
                className={`relative px-6 py-4 rounded-2xl bg-[#18181e] border border-zinc-700/90 shadow-xl flex items-center gap-3.5 transition-all duration-200 ${
                  isClicking
                    ? "scale-95 bg-zinc-800 border-zinc-500"
                    : "scale-100"
                }`}
              >
                {/* Kanvas Logo Icon */}
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center shadow-md">
                  <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
                    <rect
                      x="1"
                      y="1"
                      width="5"
                      height="5"
                      rx="1"
                      fill="#ffffff"
                    />
                    <rect
                      x="8"
                      y="1"
                      width="5"
                      height="5"
                      rx="1"
                      fill="#ffffff"
                      opacity="0.4"
                    />
                    <rect
                      x="1"
                      y="8"
                      width="5"
                      height="5"
                      rx="1"
                      fill="#ffffff"
                      opacity="0.4"
                    />
                    <rect
                      x="8"
                      y="8"
                      width="5"
                      height="5"
                      rx="1"
                      fill="#ffffff"
                    />
                  </svg>
                </div>

                <div className="text-left">
                  <h2 className="text-base font-bold text-amber-700 tracking-tight">
                    Kanvas
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Click to launch instant IDE
                  </p>
                </div>

                {/* Animated Mouse Cursor Moving & Clicking */}
                <div
                  className={`absolute -bottom-6 -right-4 transition-all duration-700 transform ${
                    isClicking
                      ? "translate-x-[-18px] translate-y-[-16px] scale-90"
                      : "translate-x-0 translate-y-0"
                  }`}
                >
                  <MousePointer2 className="w-7 h-7 text-white fill-zinc-950 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
                  {isClicking && (
                    <span className="absolute -top-1 -left-1 w-9 h-9 rounded-full border-2 border-white/60 animate-ping pointer-events-none" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 7: Screen of Kanvas (Full Website Screen revealed upon click) */}
          {stage === 7 && (
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-fade-in">
              <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl bg-[#08080a] flex flex-col">
                {/* Real Website Image Preview */}
                <div className="flex-1 relative overflow-hidden rounded-2xl bg-black">
                  <img
                    src="/image.png"
                    alt="Screen of Kanvas"
                    className="w-full h-full object-cover rounded-2xl object-top"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-[#121215]/95 border border-zinc-700/80 rounded-xl p-3 flex items-center justify-end text-xs backdrop-blur-md">
                    <button
                      onClick={handlePrimaryAction}
                      className="bg-zinc-100 hover:bg-white text-zinc-950 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                    >
                      <span>Try Kanvas Free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="h-12 border-t border-zinc-800/80 bg-[#101014]/90 px-4 sm:px-8 flex items-center justify-between text-xs text-zinc-500 z-20 shrink-0">
        <div>
          <span>© 2026 Kanvas</span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400">
          <a
            href="https://github.com/Brijesh-0106/Kanvas-Replit"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            <FaGithub className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://x.com/BrijeshShahDev"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            <FaTwitter className="w-3.5 h-3.5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
