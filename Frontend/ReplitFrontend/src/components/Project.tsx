import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../app.css";
export default function Project() {
  const uri = useLocation();

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
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <span className="text-white font-medium text-sm">Kanvas</span>
            </div>

            <p className="text-gray-400 text-sm">
              Setting up your workspace...
            </p>
          </div>
        )}
        {/* {loaded && ( */}
        <div className="flex flex-col h-screen w-screen">
          {/* Topbar — fixed 36px */}
          <div className="text-white h-[36px] border-gray-400 border-b bg-gray-900 flex items-center px-4 flex-shrink-0">
            <div className="leftSideNav">
              <h1 className="text-gray-300">Kanvas</h1>
            </div>
            <div className="rightSideNav flex gap-4">
              <button className="border border-red-800 hover:border-red-600 hover:text-red-600 text-md cursor-pointer text-red-800 px-3 py-2.5 rounded-xl font-medium transition-all">
                Logout
              </button>
            </div>
          </div>

          {/* Below topbar — takes remaining height */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar — fixed 36px wide */}
            <div className="w-[36px] bg-gray-900 flex-shrink-0 h-full border-gray-400 border-r"></div>

            {/* iframe — fills rest */}
            <div className="flex-1 h-full">
              <iframe
                width="100%"
                height="100%"
                onLoad={() => setTimeout(() => setLoaded(true), 3500)}
                className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                src={`http://${localStorage.getItem(uri.search.split("=")[1])}:8080/?folder=/tmp/project`}
              />
            </div>
          </div>
        </div>
        {/* )} */}
      </div>
    </>
  );
}
