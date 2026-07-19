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
      <div className="bg-[#2c2c2a] px-3 md:px-8 w-screen h-16 flex items-center justify-between border-b border-[#c3c2b7]/10">
        <div className="leftSideNav flex gap-1 items-center">
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
          {(token == "" || token == undefined) && (
            <Link to="/">
              <h1 className="text-[#c3c2b7] text-xl font-bold">Kanvas</h1>
            </Link>
          )}
          {!(token == "" || token == undefined) && (
            <Link to="/dashboard">
              <h1 className="text-[#c3c2b7] text-xl font-bold">Kanvas</h1>
            </Link>
          )}
        </div>
        <div className="rightSideNav flex gap-2 md:gap-4 items-center">
          {(token == "" || token == undefined) && (
            <>
              <button
                className="border md:border-[#2c2c2a] outline-0 hover:border-amber-600 text-md cursor-pointer text-amber-600 px-3 py-2 rounded-xl font-medium transition-all"
                onClick={() => setLoginModal(true)}
              >
                Login
              </button>
              <button
                className="text-[#c3c2b7] font-bold bg-amber-700  hover:border-amber-700 cursor-pointer px-3 py-2 rounded-md transition-all"
                onClick={() => setSignInModal(true)}
              >
                Create Account
              </button>
            </>
          )}
          {!(token == "" || token == undefined) && (
            <>
              <button
                onClick={() => setProjectModal(true)}
                className="border md:border-[#2c2c2a] outline-0 hover:border-amber-600 text-md cursor-pointer text-amber-600  px-3 py-2  rounded-xl font-medium transition-all"
              >
                New Project
              </button>
              <button
                onClick={logOut}
                className="border border-red-800 text-[#c3c2b7] bg-red-700  text-md cursor-pointer  py-2 px-3 rounded-xl font-medium transition-all"
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
