import { useEffect, useState } from "react";
import {
  FaFolderOpen,
  FaJava,
  FaNodeJs,
  FaPython,
  FaReact,
  FaTrash,
} from "react-icons/fa";
import { GoProjectSymlink } from "react-icons/go";
export type alertType = "success" | "error" | "warning" | "info";

import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";
import Navbar from "./Navbar";

type machine = {
  isUsed: Boolean;
  assignedAt?: Date;
  ip: string;
  instanceId: string;
  publicDnsName: string;
  projectId?: string;
  projectType?: String;
  projectName?: string;
  s3Key?: string;
};

function DashboardPage({
  setShowAlert,
  setAlertMsg,
  setAlertType,
  setProjectModal,
  setLoginModal,
  setSignInModal,
}: {
  setShowAlert: (value: boolean) => void;
  setAlertMsg: (value: string) => void;
  setAlertType: (value: alertType) => void;
  setProjectModal: (value: boolean) => void;
  setLoginModal: (value: boolean) => void;
  setSignInModal: (value: boolean) => void;
}) {
  const nav = useNavigate();

  async function openProject(elem: machine) {
    if (!elem) {
      return;
    }
    if (!elem.projectId) {
      return;
    }
    if (elem.s3Key) {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/assign-stale`,
        {
          method: "POST",
          headers: {
            token: localStorage.getItem("token") ?? "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(elem),
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
      nav(`/project?projectId=${elem.projectId!}`, {
        state: {
          publicDnsName: machine.publicDnsName,
          projectName: elem.projectName,
        },
      });
    } else {
      nav(`/project?projectId=${elem.projectId}`, {
        state: {
          publicDnsName: elem.publicDnsName,
          projectName: elem.projectName,
        },
      });
    }
  }
  const [projects, setProjects] = useState<machine[]>([]);
  const [searchedProjects, setSearchedProjects] = useState<machine[]>([]);
  const [isSearched, setIsSearched] = useState<Boolean>(false);
  const [isFiltered, setIsFiltered] = useState<Boolean>(false);
  const [loaded, setLoaded] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");

  const handleSearch = () => {
    if (searchInput) {
      setIsSearched(true);
      if (filterValue) {
        setSearchedProjects(
          projects.filter((elem) => {
            return (
              elem.projectName
                ?.toLocaleLowerCase()
                .includes(searchInput.toLowerCase()) &&
              elem.projectType == filterValue
            );
          }),
        );
      } else {
        setSearchedProjects(
          projects.filter((elem) =>
            elem.projectName
              ?.toLocaleLowerCase()
              .includes(searchInput.toLowerCase()),
          ),
        );
      }
    } else {
      setIsSearched(false);
      if (isFiltered) {
        setSearchedProjects(
          projects.filter((elem) => {
            return elem.projectType == filterValue;
          }),
        );
      }
    }
  };

  useEffect(() => {
    if (filterValue) {
      setIsFiltered(true);
      if (isSearched) {
        setSearchedProjects(
          projects.filter((elem) => {
            return (
              elem.projectName
                ?.toLocaleLowerCase()
                .includes(searchInput.toLowerCase()) &&
              elem.projectType == filterValue
            );
          }),
        );
      } else {
        setSearchedProjects(
          projects.filter((elem) => {
            return elem.projectType == filterValue;
          }),
        );
      }
    } else {
      setIsFiltered(false);
      if (isSearched) {
        handleSearch();
      }
    }
  }, [filterValue]);

  async function fetchUserProjects() {
    setLoaded(false);
    setLoadingMsg("Fetching projects...");
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/fetchProjects`,
      {
        headers: {
          token: (localStorage.getItem("token") as string) ?? "",
        },
      },
    );
    const projs = await res.json();
    if (res.status === 200) {
      setProjects(projs);
    } else {
      setProjects([]);
    }
    setLoaded(true);
  }

  async function deleteProject(project: machine) {
    setLoaded(false);
    setLoadingMsg("Deleting project...");
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/deleteProject`,
      {
        method: "POST",
        headers: {
          token: (localStorage.getItem("token") as string) ?? "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      },
    );
    const data = await res.json();
    if (res.status == 200) {
      setShowAlert(true);
      setAlertMsg(data.msg);
      setAlertType("success");
      setTimeout(() => {
        setShowAlert(false);
      }, 2500);
    }
    fetchUserProjects();
  }

  useEffect(() => {
    fetchUserProjects();
  }, []);

  const getProjectDetails = (type: string | undefined) => {
    switch (type) {
      case "Node":
        return {
          icon: <FaNodeJs className="text-green-500" size={64} />,
          label: "Node.js",
        };
      case "React":
        return {
          icon: <FaReact className="text-blue-400" size={64} />,
          label: "React",
        };
      case "Python":
        return {
          icon: <FaPython className="text-yellow-400" size={64} />,
          label: "Python",
        };
      case "Java":
        return {
          icon: <FaJava className="text-red-500" size={64} />,
          label: "Java",
        };
      default:
        return {
          icon: <FaFolderOpen className="text-gray-400" size={64} />,
          label: type || "Project",
        };
    }
  };

  const displayProjects = isFiltered || isSearched ? searchedProjects : projects;

  return (
    <>
      {/* Loader — shown until iframe fires onLoad */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-4 z-10">
          {/* Spinner */}
          <div className="w-10 h-10 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 24,
                height: 24,
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
            <span className="text-[#c3c2b7] font-bold text-lg">Kanvas</span>
          </div>

          <p className="text-gray-400 text-sm">{loadingMsg}</p>
        </div>
      )}
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <div className="flex shrink-0">
          <Navbar
            setProjectModal={setProjectModal}
            setSignInModal={setSignInModal}
            setLoginModal={setLoginModal}
          />
        </div>
        <div className="userProjectsSection flex-1 px-4 py-6 sm:px-8 sm:py-10 md:px-15 md:py-18 bg-[#1e1e1f] overflow-y-auto">
          <h1 className="text-3xl text-[#c3c2b7] flex items-center mb-6 gap-2">
            <GoProjectSymlink /> Projects
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-10 items-stretch sm:items-center">
            <div className="flex gap-2 flex-1 sm:flex-initial">
              <input
                className="rounded-xl bg-[#2c2c2a] max-h-10 border border-[#c3c2b7]/50 px-3 py-2 text-[#c3c2b7] flex-1 sm:w-64 outline-none focus:border-amber-500 transition-colors"
                type="search"
                value={searchInput}
                placeholder="Search projects..."
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                aria-label="Search"
              />
              <button
                onClick={handleSearch}
                className="bg-[#2c2c2a] max-h-10 py-2 text-[#c3c2b7] hover:text-white hover:bg-amber-600 transition-all cursor-pointer border border-[#c3c2b7]/50 px-4 rounded-xl text-sm font-medium"
                type="submit"
              >
                Search
              </button>
            </div>
            <div className="flex sm:justify-end">
              <Dropdown setFilter={setFilterValue} />
            </div>
          </div>

          {displayProjects.length > 0 ? (
            <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
              {displayProjects.map((elem, index) => {
                const projectDetails = getProjectDetails(elem.projectType?.toString());
                return (
                  elem.isUsed && (
                    <div
                      key={index}
                      className="relative border border-[#c3c2b7]/25 hover:border-amber-500/50 w-56 h-56 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 bg-[#252527]/30 flex flex-col group overflow-hidden"
                    >
                      <button
                        onClick={() => deleteProject(elem)}
                        className="absolute top-2 right-2 bg-amber-700/95 hover:bg-red-600 p-1.5 rounded-lg transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
                      >
                        <FaTrash className="text-white text-xs" />
                      </button>
                      <div className="projectTypeImage h-3/4 flex flex-col items-center justify-center border-b border-[#c3c2b7]/25">
                        <span className="mb-2">{projectDetails.icon}</span>
                        <span className="text-lg font-bold text-[#c3c2b7]">
                          {projectDetails.label}
                        </span>
                      </div>
                      <div className="text-[#c3c2b7] bg-[#252527] flex gap-3 items-center rounded-b-xl h-1/4 px-3 py-1 mt-auto">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm">{elem.projectName}</p>
                          <p className="text-[10px] text-gray-400">
                            {elem.assignedAt?.toString().split("T")[0]}
                          </p>
                        </div>

                        <button
                          onClick={() => openProject(elem)}
                          className="text-blue-500 hover:text-blue-400 cursor-pointer flex items-center gap-0.5 text-sm font-semibold shrink-0"
                        >
                          Open
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 24 24"
                            className="text-blue-500 hover:text-blue-400"
                            height="14"
                            width="14"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M13.0508 12.361L7.39395 18.0179L5.97974 16.6037L11.6366 10.9468L6.68684 5.99707H18.0006V17.3108L13.0508 12.361Z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          ) : (
            <div className="alert text-[#c3c2b7] text-lg flex flex-col items-center mt-12 gap-3">
              <div className="text-4xl text-gray-500">
                <FaFolderOpen />
              </div>
              <div className="font-medium text-center">
                {isSearched || isFiltered ? "No Projects found matching criteria" : "No Projects yet"}
              </div>
              {!isSearched && !isFiltered && (
                <div className="text-sm text-gray-400 text-center">Create a Project to get started</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardPage;

