import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "../App.css";
import type { ProjectSelectorProps } from "../models/ProjectSelectorProps";
export type alertType = "success" | "error" | "warning" | "info";

const projectTypes = [
  {
    value: "Node",
    label: "Node.js",
    description: "npm init -y · Express, APIs",
  },
  {
    value: "React",
    label: "React",
    description: "Vite · TypeScript · SPA",
  },
  {
    value: "Python",
    label: "Python",
    description: "venv · Flask, scripts",
  },
];

export default function ProjectSelectorModal({
  setShowAlert,
  setAlertMsg,
  setAlertType,
  onClose,
}: {
  setShowAlert: (value: boolean) => void;
  setAlertMsg: (value: string) => void;
  setAlertType: (value: alertType) => void;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectSelectorProps>();
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  // const [projName, setProjName] = useState("");

  //   ++++++++++++++++++++++++++++++++++++++++++ LANUCH PROJECT ++++++++++++++++++++++++++++++++++++++++++
  const handleLaunch = async (credential: ProjectSelectorProps) => {
    if (!selected) return;
    const projectId =
      "project-" + (("" + Math.random()).split(".")[1] ?? Math.random());
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/assign/${projectId}/${credential.nameInput}?proType=${selected}`,
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
      onClose();
      return;
    }
    if (res.status === 405) {
      setAlertMsg(machine.message);
      setAlertType("error");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2500);
      onClose();
      return;
    }

    onClose();
    navigate(`/project?projectId=${projectId}`, {
      state: machine.publicDnsName,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleLaunch)}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-amber-700 text-lg font-semibold">
          Intialize Project
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 cursor-pointer hover:text-[#c3c2b7] transition-colors text-xl leading-none"
        >
          ✕
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-5">
        Select a project type and project name
      </p>
      <div className={errors.nameInput ? "" : "mb-5"}>
        <label className="text-gray-400 text-xs mb-1.5 block">
          Project Name
        </label>
        <input
          maxLength={13}
          type="text"
          {...register("nameInput", {
            required: {
              value: true,
              message: "Project name is Required",
            },
            minLength: {
              value: 4,
              message: "Password must be at least 4 characters",
            },
            maxLength: {
              value: 13,
              message: "Password must be at max 13 characters",
            },
          })}
          // value={projName}
          // onChange={(e) => setProjName(e.target.value)}
          placeholder="TODO App..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-[#c3c2b7] text-sm placeholder-gray-500 focus:outline-none focus:border-amber-700 transition-colors"
        />
      </div>
      {errors.nameInput?.message && (
        <p className="text-red-600 text-[12px] mb-5">
          {errors.nameInput.message.toString()}
        </p>
      )}

      <label className="text-gray-400 text-xs mb-1.5 block">Project Type</label>
      {/* Options */}
      <div className="flex flex-col gap-3">
        {projectTypes.map((project) => (
          <button
            type="button"
            key={project.value}
            onClick={() => setSelected(project.value)}
            className={`flex items-center gap-4 p-4 cursor-pointer rounded-xl border text-left transition-all duration-150
                ${
                  selected === project.value
                    ? "border-amber-700 bg-amber-700/10"
                    : "border-gray-700 bg-gray-800 hover:border-gray-500"
                }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${selected === project.value ? "border-amber-700" : "border-gray-600"}`}
            >
              {selected === project.value && (
                <div className="w-2 h-2 rounded-full bg-amber-700" />
              )}
            </div>
            <div>
              <p className="text-[#c3c2b7] text-sm font-medium">
                {project.label}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {project.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl cursor-pointer border border-gray-700 text-gray-400 text-sm hover:border-gray-500 hover:text-[#c3c2b7] transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selected}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
              ${
                selected
                  ? "bg-amber-700 hover:bg-amber-700 text-[#c3c2b7] cursor-pointer"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
        >
          {selected
            ? `Launch ${projectTypes.find((p) => p.value === selected)?.label}`
            : "Launch"}
        </button>
      </div>
    </form>
  );
}
