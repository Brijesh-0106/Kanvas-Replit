import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Modal from "./components/Modal";
import Navbar from "./components/Navbar";
import Project from "./components/Project";
import ProjectSelector from "./components/ProjectSelector";
import SignIn from "./components/SignIn";

function App() {
  const [showModal, setProjectModal] = useState(false);
  const [showLoginModal, setLoginModal] = useState(false);
  const [showSignInModal, setSignInModal] = useState(false);

  return (
    <>
      <div className="bg-black h-screen w-screen">
        <Navbar
          setProjectModal={setProjectModal}
          setSignInModal={setSignInModal}
          setLoginModal={setLoginModal}
        />
        {showModal && (
          <Modal>
            <ProjectSelector onClose={() => setProjectModal(false)} />
          </Modal>
        )}
        {showSignInModal && (
          <Modal>
            <SignIn
              setLoginModal={setLoginModal}
              onClose={() => setSignInModal(false)}
            />
          </Modal>
        )}
        {showLoginModal && (
          <Modal>
            <Login
              setSignInModal={setSignInModal}
              onClose={() => setLoginModal(false)}
            />
          </Modal>
        )}
        <Routes>
          <Route path="/project" element={<Project />} />
        </Routes>
      </div>
    </>
  );
}
export default App;
