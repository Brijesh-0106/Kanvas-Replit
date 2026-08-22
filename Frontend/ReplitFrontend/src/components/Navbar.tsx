import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Navbar({
  setProjectModal,
  setSignInModal,
  setLoginModal,
}: {
  setProjectModal: (arg: boolean) => void;
  setSignInModal: (arg: boolean) => void;
  setLoginModal: (arg: boolean) => void;
}) {
  // const token = localStorage.getItem("token") ?? "";
  const [token, setToken] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    setToken(localStorage.getItem("token") ?? "");
  });

  const logOut = () => {
    localStorage.clear();
    // NEED TO CHECK PROJECTID AS WELL
    nav("/");
  };

  return (
    <>
      <div className="bg-[#0a0a0c] border-b border-zinc-800/80 px-3 md:px-8 w-screen h-16 flex items-center justify-between ">
        <div className="leftSideNav flex gap-2.5 items-center">
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
          {(token == "" || token == undefined) && (
            <Link to="/">
              <span className="text-base font-semibold tracking-tight text-amber-700">
                Kanvas
              </span>
            </Link>
          )}
          {!(token == "" || token == undefined) && (
            <Link to="/dashboard">
              <span className="text-base font-semibold tracking-tight text-amber-700">
                Kanvas
              </span>
            </Link>
          )}
        </div>
        <div className="rightSideNav flex gap-2 md:gap-4 items-center">
          {(token == "" || token == undefined) && (
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
          )}
          {!(token == "" || token == undefined) && (
            <>
              <button
                onClick={() => setProjectModal(true)}
                className="text-xs border sm:text-sm text-amber-700 hover:border-amber-700 px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors"
              >
                New Project
              </button>
              <button
                onClick={logOut}
                className=" hover:bg-white text-zinc-950 bg-amber-700 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-md transition-all cursor-pointer shadow-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// #1e1e1f
// #252527 lighter shade
// c3c2b7
// #86653a
