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
const icons = [
  {
    icon: <FaNodeJs height={30} width={30} className="text-green-500" />,
    label: "Node.js",
  },
  {
    icon: <FaReact height={30} width={30} className="text-blue-400" />,
    label: "React",
  },
  {
    icon: <FaPython height={30} width={30} className="text-yellow-400" />,
    label: "Python",
  },
  {
    label: "Java",
    icon: <FaJava className="text-red-500" height={30} width={30} />,
  },
];
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
    if (!elem.instanceId) {
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
          instanceId: machine.instanceId,
        },
      });
    } else {
      nav(`/project?projectId=${elem.projectId}`, {
        state: {
          publicDnsName: elem.publicDnsName,
          projectName: elem.projectName,
          instanceId: elem.instanceId,
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
      console.log("1");
      console.log(filterValue, "fi");
      console.log(isFiltered, "fi");
      if (filterValue) {
        console.log("2");
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
        console.log("3");
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
        console.log("check");
        handleSearch();
      }
      console.log(isFiltered, "false time");
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

  const displayedProjects = isSearched || isFiltered ? searchedProjects : projects;

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
        <div className="userProjectsSection flex-1 overflow-y-auto px-4 py-8 md:px-15 md:py-18 bg-[#1e1e1f]">
          <h1 className="text-3xl text-[#c3c2b7] flex items-center mb-5 gap-1">
            <GoProjectSymlink /> Projects
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-10 sm:items-center">
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                className="flex-1 sm:w-64 rounded-xl bg-[#2c2c2a] max-h-10 border border-[#c3c2b7]/50 px-3 py-2 text-[#c3c2b7] outline-none focus:border-amber-600 transition-colors"
                type="search"
                value={searchInput}
                placeholder="Search projects..."
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search"
              />
              <button
                onClick={handleSearch}
                className="bg-[#2c2c2a] max-h-10 py-2 text-[#c3c2b7] hover:text-white hover:bg-amber-600 transition-all cursor-pointer border border-[#c3c2b7]/50 px-4 rounded-xl font-medium"
                type="submit"
              >
                Search
              </button>
            </div>
            <div className="w-full sm:w-auto">
              <Dropdown setFilter={setFilterValue} />
            </div>
          </div>

          {projects.length > 0 &&
            (isSearched || isFiltered) &&
            searchedProjects.length === 0 ? (
            <div className="alert text-[#c3c2b7] text-lg flex flex-col items-center mt-10">
              <div className="text-2xl mb-2">
                <FaFolderOpen />
              </div>
              <div>No Project found</div>
            </div>
          ) : projects.length > 0 ? (
            <div className="flex flex-wrap gap-8 justify-center md:justify-normal">
              {displayedProjects.map((elem, index) => {
                return (
                  elem.isUsed && (
                    <div
                      key={index}
                      className="relative border border-gray-400 w-56 h-56 rounded-xl"
                    >
                      <button
                        onClick={() => deleteProject(elem)}
                        className="absolute top-2 right-2 bg-amber-700 hover:bg-red-600 p-1.5 rounded-lg transition-all"
                      >
                        <FaTrash className="text-white text-sm" />
                      </button>
                      <div className="projectTypeImage h-3/4 flex flex-col items-center justify-center border-b border-gray-400">
                        {elem.projectType == "Node" && (
                          <>
                            <span className="text-7xl">{icons[0].icon}</span>
                            <span className="text-lg font-bold text-[#c3c2b7]">
                              {icons[0].label}
                            </span>
                          </>
                        )}
                        {elem.projectType == "React" && (
                          <>
                            <span className="text-7xl">{icons[1].icon}</span>
                            <span className="text-lg font-bold text-[#c3c2b7]">
                              {icons[1].label}
                            </span>
                          </>
                        )}
                        {elem.projectType == "Python" && (
                          <>
                            <span className="text-7xl">{icons[2].icon}</span>
                            <span className="text-lg font-bold text-[#c3c2b7]">
                              {icons[2].label}
                            </span>
                          </>
                        )}
                        {elem.projectType == "Java" && (
                          <>
                            <span className="text-7xl">{icons[3].icon}</span>
                            <span className="text-lg font-bold text-[#c3c2b7]">
                              {icons[3].label}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-[#c3c2b7] bg-[#252527] flex gap-3 items-center rounded-b-xl h-1/4 px-3 py-1">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {elem.projectName}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {elem.assignedAt?.toString().split("T")[0]}
                          </p>
                        </div>

                        <button
                          onClick={() => openProject(elem)}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer flex items-center max-md:text-sm text-base shrink-0 ml-2"
                        >
                          Open
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 24 24"
                            color="text-blue-500"
                            height="16"
                            width="16"
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-0.5"
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
            <div className="alert text-[#c3c2b7] text-lg flex flex-col items-center mt-10">
              <div className="text-2xl mb-2">
                <FaFolderOpen />
              </div>
              <div>No Projects yet</div>
              <div className="text-sm text-gray-400 mt-1">
                Create a Project to get started
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
