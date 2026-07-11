import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Alert } from "./components/Alert";
import DashboardPage from "./components/DashboardPage";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Modal from "./components/Modal";
import Project from "./components/Project";
import ProjectSelector from "./components/ProjectSelector";
import SignIn from "./components/SignIn";
export type alertType = "success" | "error" | "warning" | "info";

function App() {
  const nav = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<alertType>("success");
  const [showModal, setProjectModal] = useState(false);
  const [showLoginModal, setLoginModal] = useState(false);
  const [showSignInModal, setSignInModal] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function verifyToken() {
    const token = localStorage.getItem("token");
    if (token) {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/verifyToken`,
        {
          headers: {
            token: token,
          },
        },
      );
      if (res.status == 200) {
        setLoaded(true);
        nav("/dashboard");
      } else {
        localStorage.removeItem("token");
        setLoaded(true);
      }
    } else {
      setLoaded(true);
    }
  }
  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-4 z-10">
          {/* Spinner */}
          <div className="w-10 h-10 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="text-white font-medium text-sm">Kanvas</span>
          </div>

          <p className="text-gray-400 text-sm">Setting up your workspace...</p>
        </div>
      )}
      <div className="bg-[#1f1f1e] h-screen w-screen">
        {showModal && (
          <Modal>
            <ProjectSelector
              setShowAlert={setShowAlert}
              setAlertMsg={setAlertMsg}
              setAlertType={setAlertType}
              onClose={() => setProjectModal(false)}
            />
          </Modal>
        )}
        {showSignInModal && (
          <Modal>
            <SignIn
              setLoginModal={setLoginModal}
              setShowAlert={setShowAlert}
              setAlertMsg={setAlertMsg}
              setAlertType={setAlertType}
              setProjectModal={setProjectModal}
              onClose={() => setSignInModal(false)}
            />
          </Modal>
        )}
        {showLoginModal && (
          <Modal>
            <Login
              setSignInModal={setSignInModal}
              setShowAlert={setShowAlert}
              setAlertMsg={setAlertMsg}
              setAlertType={setAlertType}
              setProjectModal={setProjectModal}
              onClose={() => setLoginModal(false)}
            />
          </Modal>
        )}
        {showAlert && <Alert type={alertType} title={alertMsg} />}
        <Routes>
          <Route path="/project" element={<Project />} />
          <Route
            path="/"
            element={
              <Landing
                setProjectModal={setProjectModal}
                setLoginModal={setLoginModal}
                setSignInModal={setSignInModal}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                setShowAlert={setShowAlert}
                setAlertMsg={setAlertMsg}
                setAlertType={setAlertType}
                setProjectModal={setProjectModal}
                setLoginModal={setLoginModal}
                setSignInModal={setSignInModal}
              />
            }
          />
        </Routes>
      </div>
    </>
  );
}
export default App;
