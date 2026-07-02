import { useEffect, useState } from "react";
import { FaNodeJs, FaPython, FaReact } from "react-icons/fa";
import Navbar from "./Navbar";

const icons = [
  {
    icon: <FaNodeJs height={30} width={30} className="text-green-500" />,
    label: "Node.js",
  },
  { icon: <FaReact className="text-blue-400" />, label: "React" },
  { icon: <FaPython className="text-yellow-400" />, label: "Python" },
];
type machine = {
  isUsed: Boolean;
  assignedAt?: Date;
  ip: string;
  id: string;
  publicDnsName: string;
  assignedProjectId?: string;
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
        <div className="userProjectsSection flex-1 p-3">
          {projects.length > 0 && (
            <>
              <h1 className="text-xl text-amber-600 mb-5">Your Projects:</h1>
              {projects.map((elem) => {
                return (
                  <div className="border border-gray-400 w-56 h-56 rounded-xl">
                    <div className="projectTypeImage h-3/4 flex flex-col items-center justify-center border-b border-gray-400">
                      {/* <img src="" alt="" /> */}
                      <span className="text-7xl">{icons[0].icon}</span>
                      <span className="text-white text-sm">
                        {icons[0].label}
                      </span>
                    </div>
                    <div className="text-amber-600 h-1/4 px-2 py-1">
                      {elem.assignedProjectName}
                    </div>
                    {/* <div>{elem.}</div> TYPE */}
                  </div>
                );
              })}
            </>
          )}
          {projects.length == 0 && (
            <div className="alert">Please create project</div>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
