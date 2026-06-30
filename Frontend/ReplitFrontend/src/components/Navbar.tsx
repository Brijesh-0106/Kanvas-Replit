import "../App.css";
export default function Navbar({
  setProjectModal,
  setSignInModal,
  setLoginModal,
}: {
  setProjectModal: (arg: boolean) => void;
  setSignInModal: (arg: boolean) => void;
  setLoginModal: (arg: boolean) => void;
}) {
  return (
    <>
      <div className="bg-black px-8 w-screen h-16 flex items-center justify-between">
        <div className="leftSideNav">
          <h1 className="text-gray-300 text-xl">Kanvas</h1>
        </div>
        <div className="rightSideNav flex gap-4">
          <button
            className="border border-black outline-0 hover:border-amber-600 text-md cursor-pointer text-amber-600 px-3 py-2 rounded-xl font-medium transition-all"
            onClick={() => setLoginModal(true)}
          >
            Login
          </button>
          <button
            className="text-gray-200 bg-amber-600 hover:bg-amber-700 cursor-pointer px-3 py-2 rounded-md transition-all"
            onClick={() => setSignInModal(true)}
          >
            Create Account
          </button>
          {/* <button className="border border-red-800 hover:border-red-600 hover:text-red-600 text-md cursor-pointer text-red-800 px-3 py-2.5 rounded-xl font-medium transition-all">
            Logout
          </button> */}
          {/* <button
            onClick={() => setProjectModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-3 rounded-xl text-sm font-medium transition-all"
          >
            New workspace
          </button> */}
        </div>
      </div>
    </>
  );
}
