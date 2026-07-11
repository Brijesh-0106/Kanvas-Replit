import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import type { LoginProps } from "../models/AuthProps";
import GoogleSignIn from "./GoogleSignIn";
export type alertType = "success" | "error" | "warning" | "info";

export default function Login({
  setShowAlert,
  setAlertMsg,
  setAlertType,
  setProjectModal,
  setSignInModal,
  onClose,
}: {
  setShowAlert: (value: boolean) => void;
  setAlertMsg: (value: string) => void;
  setAlertType: (value: alertType) => void;
  setProjectModal: (value: boolean) => void;
  setSignInModal: (value: boolean) => void;
  onClose: () => void;
}) {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginProps>();
  const nav = useNavigate();
  const [errorGoogle, setErrorGoogle] = useState("");
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleError = (error: string) => {
    setErrorGoogle(error);
  };

  const handleGoogleSuccess = (user: Record<string, unknown>) => {
    onClose();
    nav("/dashboard");
    // setProjectModal(true);
  };

  const loginViaEmail = async (credentials: LoginProps) => {
    const unfilteredRes = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.emailInput,
          password: credentials.passwordInput,
        }),
      },
    );
    const res = await unfilteredRes.json();
    if (unfilteredRes.status == 200) {
      localStorage.setItem("token", res.token);
      onClose();
      nav("/dashboard");
      // setProjectModal(true);
    } else if (unfilteredRes.status == 405) {
      setAlertType("error");
      setAlertMsg(res.msg);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2500);
      reset();
    }
  };

  const handleCustomButtonClick = () => {
    const googleButton =
      googleButtonRef.current?.querySelector('div[role="button"]');
    if (googleButton) {
      (googleButton as HTMLElement).click();
    }
  };
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
        {/* <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-bold text-lg">K</span>
        </div> */}
        <div className="flex gap-1 mb-4">
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
          <h1 className="text-[#c3c2b7] text-xl font-bold">Kanvas</h1>
        </div>

        <h2 className="text-white text-2xl font-bold">Welcome back</h2>
        <p className="text-gray-400 text-sm mt-1">
          Log in to your Kanvas account
        </p>
      </div>

      {/* Google */}
      {errorGoogle && (
        <div className="error-message text-red-600 text-[12px] mb-1">
          {errorGoogle}
        </div>
      )}
      <button
        onClick={handleCustomButtonClick}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 text-white text-sm font-medium transition-all mb-3"
      >
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
      <div ref={googleButtonRef} style={{ display: "none" }}>
        <GoogleSignIn
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-gray-500 text-xs">or continue with email</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      {/* Email + Password */}
      <form onSubmit={handleSubmit(loginViaEmail)}>
        <div className="flex flex-col gap-3 mb-5">
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
            <input
              type="email"
              {...register("emailInput", {
                required: {
                  value: true,
                  message: "Email is Required",
                },
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Email is not valid",
                },
              })}
              // value={email}
              // onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          {errors.emailInput?.message && (
            <p className="text-red-600 text-[12px] mb-1">
              {errors.emailInput.message.toString()}
            </p>
          )}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-400 text-xs">Password</label>
            </div>
            <input
              type="password"
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              {...register("passwordInput", {
                required: {
                  value: true,
                  message: "Password is Required",
                },
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          {errors.passwordInput?.message && (
            <p className="text-red-600 text-[12px] mb-1">
              {errors.passwordInput.message.toString()}
            </p>
          )}
        </div>
        <button className="w-full bg-blue-600 cursor-pointer hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-medium transition-all">
          Log in
        </button>
      </form>

      {/* Submit */}

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
