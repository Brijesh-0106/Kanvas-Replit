import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../app.css";
const projectTypes = [
  {
    value: "node",
    label: "Node.js",
    description: "npm init -y · Express, APIs",
  },
  {
    value: "react",
    label: "React",
    description: "Vite · TypeScript · SPA",
  },
  {
    value: "python",
    label: "Python",
    description: "venv · Flask, scripts",
  },
  {
    value: "fullstack",
    label: "Full stack",
    description: "Node + React · monorepo",
  },
];

export default function ProjectSelectorModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  //   ++++++++++++++++++++++++++++++++++++++++++ LANUCH PROJECT ++++++++++++++++++++++++++++++++++++++++++
  const handleLaunch = async () => {
    console.log("Launching:", selected);
    if (!selected) return;
    // console.log(Math.random(), "Random number");
    const projectId =
      "project-" + (("" + Math.random()).split(".")[1] ?? Math.random());
    console.log(projectId, "projectId");
    const res = await fetch(
      `http://localhost:9092/assign/${projectId}?type=${selected}`,
    );
    console.log(res, "res from backend");
    const machine = await res.json();
    console.log(machine, "machine from backend");
    onClose();
    // window.location.href = `http://${machine.publicDnsName}:8080`;
    localStorage.setItem(projectId, machine.publicDnsName);
    navigate(`/project?projectId=${projectId}`);
    // console.log("Machine ID stored in localStorage:", machine.id);
  };

  return (
    <>
      {/* // <div
    //   className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    //   onClick={onClose}
    // >
    //   <div
    //     className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6"
    //     onClick={(e) => e.stopPropagation()}
    //   > */}
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-white text-lg font-semibold">Intialize Project</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
        >
          ✕
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-5">
        Select a project type to get started
      </p>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {projectTypes.map((project) => (
          <button
            key={project.value}
            onClick={() => setSelected(project.value)}
            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150
                ${
                  selected === project.value
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 bg-gray-800 hover:border-gray-500"
                }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${selected === project.value ? "border-blue-500" : "border-gray-600"}`}
            >
              {selected === project.value && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{project.label}</p>
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
          className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleLaunch}
          disabled={!selected}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
              ${
                selected
                  ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
        >
          {selected
            ? `Launch ${projectTypes.find((p) => p.value === selected)?.label}`
            : "Launch"}
        </button>
      </div>

      {/* //   </div> */}
      {/* // </div> */}
    </>
  );
}
