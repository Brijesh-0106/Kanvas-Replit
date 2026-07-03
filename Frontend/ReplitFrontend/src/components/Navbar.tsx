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
    console.log("token in navbar", localStorage.getItem("token"));
    setToken(localStorage.getItem("token") ?? "");
  });

  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // NEED TO CHECK PROJECTID AS WELL
    nav("/");
  };

  return (
    <>
      <div className="bg-[#2c2c2a] px-8 w-screen h-16 flex items-center justify-between border-gray-400 border-b">
        <div className="leftSideNav">
          {(token == "" || token == undefined) && (
            <Link to="/">
              <h1 className="text-[#c3c2b7] text-xl">Kanvas</h1>
            </Link>
          )}
          {!(token == "" || token == undefined) && (
            <Link to="/dashboard">
              <h1 className="text-[#c3c2b7] text-xl">Kanvas</h1>
            </Link>
          )}
        </div>
        <div className="rightSideNav flex gap-4">
          {(token == "" || token == undefined) && (
            <>
              <button
                className="border border-[#252527] outline-0 hover:border-amber-600 text-md cursor-pointer text-amber-600 px-3 py-2 rounded-xl font-medium transition-all"
                onClick={() => setLoginModal(true)}
              >
                Login
              </button>
              <button
                className="text-[#c3c2b7] font-bold bg-amber-700 hover:bg-amber-800 cursor-pointer px-3 py-2 rounded-md transition-all"
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
                className="border border-[#2c2c2a] outline-0 hover:border-amber-600 text-md cursor-pointer text-amber-600 px-3 py-2  rounded-xl font-medium transition-all"
              >
                New Project
              </button>
              <button
                onClick={logOut}
                className="border border-red-800 hover:border-red-600 hover:text-red-600 text-md cursor-pointer text-red-800 px-3 rounded-xl font-medium transition-all"
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
