import Navbar from "./Navbar";

function Landing({
  setProjectModal,
  setLoginModal,
  setSignInModal,
}: {
  setProjectModal: (value: boolean) => void;
  setLoginModal: (value: boolean) => void;
  setSignInModal: (value: boolean) => void;
}) {
  return (
    <>
      <Navbar
        setProjectModal={setProjectModal}
        setSignInModal={setSignInModal}
        setLoginModal={setLoginModal}
      />
    </>
  );
}

export default Landing;
