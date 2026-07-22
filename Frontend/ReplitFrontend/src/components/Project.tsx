import { useEffect, useState } from "react";
import { IoHome } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

export default function Project() {
  const uri = useLocation();
  const nav = useNavigate();

  const queryParams = new URLSearchParams(uri.search);
  const projectId = queryParams.get("projectId") || "";

  const stateVal = uri.state;
  const publicDnsName =
    typeof stateVal === "string" ? stateVal : (stateVal?.publicDnsName ?? "");
  const projectName =
    typeof stateVal === "string" ? "" : (stateVal?.projectName ?? "");
  const instanceId =
    typeof stateVal === "string" ? "" : (stateVal?.instanceId ?? "");

  useEffect(() => {
    if (!instanceId) return;
    const heartBeat = setInterval(() => {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/heartBeat/${instanceId}`, {
        headers: {
          token: (localStorage.getItem("token") as string) ?? "",
        },
      })
        .then((res) => {
          if (res.status === 404) {
            clearInterval(heartBeat);
          }
        })
        .catch(() => {});
    }, 1000 * 30);
    return () => clearInterval(heartBeat);
  }, [projectId]);

  function navDashboard() {
    nav("/dashboard");
  }

  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div className="h-screen w-screen bg-gray-950 relative">
        {/* Loader — shown until iframe fires onLoad */}
        {!loaded && (
          <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-4 z-10">
            {/* Spinner */}
            <div className="w-10 h-10 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />

            {/* Logo */}
            <div className="flex items-center gap-2">
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

            <p className="text-gray-400 text-sm">
              Setting up workspace {projectName ? `"${projectName}"` : ""}...
            </p>
          </div>
        )}
        {/* {loaded && ( */}
        <div className="flex flex-col h-screen w-screen">
          {/* Topbar — fixed 36px */}
          <div className="text-[#c3c2b7] h-14 px-8 border-[#c3c2b7]/10 border-b bg-[#2c2c2a] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div
                onClick={navDashboard}
                className="flex items-center gap-2 cursor-pointer group/brand"
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: "#f97316",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="shadow-sm shadow-orange-500/25 group-hover/brand:scale-105 transition-transform duration-200"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect
                      x="1"
                      y="1"
                      width="5"
                      height="5"
                      rx="1"
                      fill="white"
                    />
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
                    <rect
                      x="8"
                      y="8"
                      width="5"
                      height="5"
                      rx="1"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-[#c3c2b7] font-extrabold text-[19px] tracking-tight group-hover/brand:text-orange-500 transition-colors duration-200">
                  Kanvas
                </span>
              </div>
              <div className="h-6 w-[1px] bg-[#c3c2b7]/25" />
              <div className="flex flex-col pl-1">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider select-none leading-none mb-1">
                  Active Workspace
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-sm font-extrabold tracking-wide leading-none">
                    {projectName || "Untitled"}
                  </span>
                </div>
              </div>
            </div>
            <div className="rightSideNav text-[#c3c2b7] text-xl flex gap-4 cursor-pointer">
              <IoHome onClick={navDashboard} />
            </div>
          </div>

          {/* Below topbar — takes remaining height */}
          <div className="flex flex-1 overflow-hidden p-4 bg-[#1f1f1e]">
            {/* Left sidebar — fixed 36px wide */}

            {/* iframe — fills rest */}
            <div className="w-full h-full">
              <iframe
                width="100%"
                height="100%"
                onLoad={() => setTimeout(() => setLoaded(true), 3500)}
                className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                src={`https://ws-${instanceId}.kanvas.usecerebro.co.in/?folder=/tmp/project`}
              />
            </div>
          </div>
        </div>
        {/* )} */}
      </div>
    </>
  );
}
