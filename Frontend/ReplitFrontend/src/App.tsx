import { useState } from "react";
import { Route, Routes } from "react-router-dom";
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<alertType>("success");
  const [showModal, setProjectModal] = useState(false);
  const [showLoginModal, setLoginModal] = useState(false);
  const [showSignInModal, setSignInModal] = useState(false);

  return (
    <>
      <div className="bg-[#1f1f1e] h-screen w-screen">
        {/* <Navbar
          setProjectModal={setProjectModal}
          setSignInModal={setSignInModal}
          setLoginModal={setLoginModal}
        /> */}
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
