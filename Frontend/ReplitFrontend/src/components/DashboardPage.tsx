import { useEffect, useState } from "react";
import { FaFolderOpen, FaNodeJs, FaPython, FaReact } from "react-icons/fa";
import { GoProjectSymlink } from "react-icons/go";

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
];
type machine = {
  isUsed: Boolean;
  assignedAt?: Date;
  ip: string;
  id: string;
  publicDnsName: string;
  assignedProjectId?: string;
  assignedProjectType?: String;
  assignedProjectName?: string;
};
function DashboardPage({
  setProjectModal,
  setLoginModal,
  setSignInModal,
}: {
  setProjectModal: (value: boolean) => void;
  setLoginModal: (value: boolean) => void;
  setSignInModal: (value: boolean) => void;
}) {
  const [projects, setProjects] = useState<machine[]>([]);
  async function fetchUserProjects() {
    const res = await fetch("http://localhost:9092/fetchProjects", {
      headers: {
        token: localStorage.getItem("token") ?? "",
      },
    });
    const projs = await res.json();
    console.log(projs, "user's projects");
    setProjects(projs);
    // if(projects.length > 0) {

    // }
  }
  useEffect(() => {
    fetchUserProjects();
  }, []);
  return (
    <>
      <div className="flex h-screen w-screen flex-col">
        <div className="flex flex-shrink-0">
          <Navbar
            setProjectModal={setProjectModal}
            setSignInModal={setSignInModal}
            setLoginModal={setLoginModal}
          />
        </div>
        <div className="userProjectsSection flex-1 px-15 py-18 bg-[#1e1e1f]">
          {projects.length > 0 && (
            <>
              <h1 className="text-3xl text-[#c3c2b7] mb-7 flex items-center gap-4">
                <GoProjectSymlink /> Projects
              </h1>
              <div className="flex gap-10">
                {projects.map((elem) => {
                  return (
                    <div className="border border-gray-400 w-56 h-56 rounded-xl">
                      <div className="projectTypeImage h-3/4 flex flex-col items-center justify-center border-b border-gray-400">
                        {elem.assignedProjectType == "Node.js" && (
                          <>
                            <span className="text-7xl">{icons[0].icon}</span>
                            <span className=" text-lg font-bold text-[#c3c2b7]">
                              {icons[0].label}
                            </span>
                          </>
                        )}
                        {elem.assignedProjectType == "React" && (
                          <>
                            <span className="text-7xl">{icons[1].icon}</span>
                            <span className=" text-lg font-bold text-[#c3c2b7]">
                              {icons[1].label}
                            </span>
                          </>
                        )}
                        {elem.assignedProjectType == "Python" && (
                          <>
                            <span className="text-7xl">{icons[2].icon}</span>
                            <span className=" text-lg font-bold text-[#c3c2b7]">
                              {icons[2].label}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-[#c3c2b7] bg-[#252527] flex gap-3 items-center rounded-b-xl h-1/4 px-3 py-1">
                        <div>{elem.assignedProjectName}</div>

                        <a
                          href={`/project?projectId=${elem.assignedProjectId}`}
                          className="text-blue-500 flex ml-auto items-center max-md:text-sm text-base"
                        >
                          Open
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            stroke-width="0"
                            viewBox="0 0 24 24"
                            color="text-blue-500"
                            height="16"
                            width="16"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M13.0508 12.361L7.39395 18.0179L5.97974 16.6037L11.6366 10.9468L6.68684 5.99707H18.0006V17.3108L13.0508 12.361Z"></path>
                          </svg>
                        </a>
                      </div>
                      {/* <div>{elem.}</div> TYPE */}
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {projects.length == 0 && (
            <div className="alert text-[#c3c2b7] text-lg flex flex-col items-center">
              <div className="text-2xl">
                <FaFolderOpen />
              </div>
              <div>No Projects yet</div>
              <div>Create a Project to get started</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
