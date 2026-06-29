import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login({
  setSignInModal,
  onClose,
}: {
  setSignInModal: (value: boolean) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const changeModal = () => {
    onClose();
    setSignInModal(true);
  };
  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className=" text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      {/* ++++++++++++++++++ Close ++++++++++++++++++++++ */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-bold text-lg">K</span>
        </div>
        <h2 className="text-white text-2xl font-bold">Welcome back</h2>
        <p className="text-gray-400 text-sm mt-1">
          Log in to your Kanvas account
        </p>
      </div>

      {/* Google */}
      <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 text-white text-sm font-medium transition-all mb-3">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
          />
        </svg>
        Continue with Google
      </button>

      {/* GitHub */}
      <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 text-white text-sm font-medium transition-all mb-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        Continue with GitHub
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-gray-500 text-xs">or continue with email</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      {/* Email + Password */}
      <div className="flex flex-col gap-3 mb-5">
        <div>
          <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-gray-400 text-xs">Password</label>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Submit */}
      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-medium transition-all">
        Log in
      </button>

      {/* Footer */}
      <p className="text-center text-gray-500 text-xs mt-6">
        Don't have an account?{" "}
        <Link
          to="/sign-up"
          onClick={changeModal}
          className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
