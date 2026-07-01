import { useState } from "react";
import { useLocation } from "react-router-dom";

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
        <iframe
          width="100%"
          height="100%"
          onLoad={() => setTimeout(() => setLoaded(true), 3500)}
          className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          src={`http://${localStorage.getItem(uri.search.split("=")[1])}:8080/?folder=/tmp/project`}
        ></iframe>
      </div>
    </>
  );
}
