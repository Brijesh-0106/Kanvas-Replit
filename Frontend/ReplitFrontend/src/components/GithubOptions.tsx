import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import type { alertType } from "./DashboardPage";
import DropdownAny, { type Repo } from "./DropdownAny";

type Mode = "existing" | "new";
type LoadState = "loading" | "ready" | "error" | "reconnect";
type NewRepoForm = { nameInput: string; isPrivate: boolean };

const API = import.meta.env.VITE_BACKEND_URL;
const authHeaders = () => ({ token: localStorage.getItem("token") ?? "" });
const jsonHeaders = () => ({
  ...authHeaders(),
  "Content-Type": "application/json",
});

export default function GithubOptions({
  setShowAlert,
  setAlertMsg,
  setAlertType,
}: {
  setShowAlert: (value: boolean) => void;
  setAlertMsg: (value: string) => void;
  setAlertType: (value: alertType) => void;
}) {
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("existing");
  const [load, setLoad] = useState<LoadState>("loading");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selected, setSelected] = useState<Repo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<NewRepoForm>({
    mode: "onTouched",
    defaultValues: { isPrivate: true },
  });

  const loadRepos = useCallback(
    async (signal?: AbortSignal) => {
      setLoad("loading");
      try {
        const res = await fetch(`${API}/github/repos`, {
          headers: authHeaders(),
          signal,
        });

        if (res.ok) {
          const data: Repo[] = await res.json(); // keep backend order: recently pushed first
          setRepos(data);
          setLoad("ready");
          if (data.length === 0) setMode("new"); // nothing to pick, so start on "New repo"
          return;
        }

        const body = await res.json().catch(() => ({}));
        if (
          body?.error === "GITHUB_NOT_CONNECTED" ||
          body?.error === "GITHUB_RECONNECT"
        ) {
          setLoad("reconnect");
        } else if (res.status === 401 || res.status === 403) {
          nav("/"); // app session expired
        } else {
          setLoad("error");
        }
      } catch (e: any) {
        if (e.name !== "AbortError") setLoad("error");
      }
    },
    [nav],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadRepos(controller.signal);
    return () => controller.abort();
  }, [loadRepos]);

  async function connectGithub() {
    const res = await fetch(`${API}/auth/github/url`, {
      headers: authHeaders(),
      credentials: "include", // needed so the gh_oauth cookie is stored
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  // async function cloneRepo(fullName: string) {
  //   const res = await fetch(`${API}/github/clone`, {
  //     method: "POST",
  //     headers: jsonHeaders(),
  //     body: JSON.stringify({ fullName }),
  //   });
  //   if (!res.ok)
  //     throw new Error("Couldn't set up the project. Please try again.");
  //   const { files } = await res.json();
  //   nav("/builder", { state: { files, fullName } }); // adjust to your builder route
  // }

  async function onOpenExisting(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/assign/${selected.fullName.split("/")[1]}?proType=${"AI Agent"}`,
        {
          headers: {
            token: localStorage.getItem("token") ?? "",
          },
        },
      );
      const machine = await res.json();
      if (res.status === 403) {
        setAlertMsg(
          "You are not authorized to assign a project. Please sign in.",
        );
        setAlertType("error");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2500);
        // onClose();
        return;
      }
      if (res.status === 405) {
        setAlertMsg(machine.message);
        setAlertType("error");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2500);
        // onClose();
        return;
      }

      // onClose();
      nav(`/project?projectId=${machine.projectId}`, {
        state: {
          publicDnsName: machine.publicDnsName,
          projectName: selected.fullName,
          instanceId: machine.instanceId,
          isAI: true,
        },
      });
      // await cloneRepo(selected.fullName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onCreate(values: NewRepoForm) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API}/github/repo`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          name: values.nameInput,
          isPrivate: values.isPrivate,
        }),
      });
      if (res.status === 409) {
        setFieldError("nameInput", {
          message: "You already have a repo with this name",
        });
        return;
      }
      if (!res.ok)
        throw new Error("Couldn't create the repo. Please try again.");
      const { machine, name } = await res.json();
      if (res.status === 403) {
        setAlertMsg(
          "You are not authorized to assign a project. Please sign in.",
        );
        setAlertType("error");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2500);
        return;
      }
      if (res.status === 405) {
        setAlertMsg(machine.message);
        setAlertType("error");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2500);
        return;
      }
      nav(`/project?projectId=${machine.projectId}`, {
        state: {
          publicDnsName: machine.publicDnsName,
          projectName: name,
          instanceId: machine.instanceId,
          isAI: true,
        },
      });
      // const { fullName } = await res.json();
      // await cloneRepo(fullName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  // ── Not connected / token revoked ──
  if (load === "reconnect") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-[#c3c2b7] text-sm">
          Connect your GitHub account to continue.
        </p>
        <button
          onClick={connectGithub}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-700 text-[#c3c2b7]"
        >
          Connect GitHub
        </button>
      </div>
    );
  }

  const canSubmit = !busy && (mode === "new" || !!selected);

  return (
    <form
      onSubmit={mode === "existing" ? onOpenExisting : handleSubmit(onCreate)}
      className="flex flex-col justify-between min-h-72"
      noValidate
    >
      <div>
        {/* Mode switch */}
        <div
          role="tablist"
          className="grid grid-cols-2 p-1 bg-gray-800 rounded-xl mb-5"
        >
          {(["existing", "new"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              disabled={busy}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? "border border-amber-50 text-amber-600"
                  : "text-gray-400 hover:text-[#c3c2b7]"
              }`}
            >
              {m === "existing" ? "Existing repo" : "New repo"}
            </button>
          ))}
        </div>

        {/* Existing repo */}
        {mode === "existing" && (
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">
              Repository
            </label>

            {load === "loading" && (
              <div className="h-11 rounded-xl bg-gray-800 animate-pulse" />
            )}

            {load === "error" && (
              <div className="flex items-center justify-between gap-3 px-4 h-11 rounded-xl border border-red-900/60 bg-red-950/30">
                <span className="text-sm text-red-400">
                  Couldn't load your repos
                </span>
                <button
                  type="button"
                  onClick={() => loadRepos()}
                  className="text-sm text-amber-700 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {load === "ready" && (
              <DropdownAny
                options={repos}
                value={selected}
                onChange={setSelected}
                disabled={busy}
              />
            )}
          </div>
        )}

        {/* New repo */}
        {mode === "new" && (
          <div>
            <label
              htmlFor="repo-name"
              className="text-gray-400 text-xs mb-1.5 block"
            >
              Repository name
            </label>
            <input
              id="repo-name"
              maxLength={24}
              autoComplete="off"
              disabled={busy}
              placeholder="my-todo-app"
              aria-invalid={!!errors.nameInput}
              {...register("nameInput", {
                required: "Give your repo a name",
                minLength: { value: 4, message: "At least 4 characters" },
                pattern: {
                  value: /^[A-Za-z0-9._-]+$/,
                  message: "Use letters, numbers, . _ or - (no spaces)",
                },
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\s+/g, "-"); // "my app" → "my-app"
                },
              })}
              className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-[#c3c2b7] text-sm placeholder-gray-500 focus:outline-none transition-colors ${
                errors.nameInput
                  ? "border-red-600"
                  : "border-gray-700 focus:border-amber-700"
              }`}
            />
            <p className="text-red-500 text-xs mt-1.5 min-h-4" role="alert">
              {errors.nameInput?.message}
            </p>

            <label className="flex items-center gap-2 mt-2 text-sm text-[#c3c2b7] cursor-pointer">
              <input
                type="checkbox"
                disabled={busy}
                {...register("isPrivate")}
                className="accent-amber-700"
              />
              Private repository
            </label>
          </div>
        )}
      </div>

      <div className="mt-6">
        {error && (
          <p role="alert" className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
            canSubmit
              ? "bg-amber-700 hover:bg-amber-600 text-[#c3c2b7] cursor-pointer"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          {busy
            ? "Setting up…"
            : mode === "existing"
              ? "Open repo"
              : "Create & open"}
        </button>

        <p className="text-gray-500 text-xs text-center mt-2">
          This replaces the files in your current workspace.
        </p>
      </div>
    </form>
  );
}
