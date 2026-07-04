import { useState } from "react";
import { IoHome } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import "../app.css";

export default function Project() {
  const uri = useLocation();
  const nav = useNavigate();
  console.log(localStorage.getItem(uri.search.split("=")[1]), "check");
  //http: ${localStorage.getItem(uri.search.split("=")[1])}:8080/?folder=/tmp/project

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
          <div className="text-[#c3c2b7] h-14 px-8 border-gray-400 border-b bg-[#2c2c2a] flex items-center justify-between flex-shrink-0">
            <div className="leftSideNav">
              {/* <Link to="/dashboard"> */}
              <h1 className="text-[#c3c2b7] text-xl">Kanvas</h1>
              {/* </Link> */}
            </div>
            <div className="rightSideNav text-[#c3c2b7] text-xl flex gap-4 cursor-pointer">
              <IoHome onClick={() => nav("/dashboard")} />
            </div>
          </div>

          {/* Below topbar — takes remaining height */}
          <div className="flex flex-1 overflow-hidden p-10 bg-[#1f1f1e]">
            {/* Left sidebar — fixed 36px wide */}

            {/* iframe — fills rest */}
            <div className="w-full h-full">
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
