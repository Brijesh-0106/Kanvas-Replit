import "../App.css";
export default function Navbar({
  setProjectModal,
  setSignInModal,
}: {
  setProjectModal: (arg: boolean) => void;
  setSignInModal: (arg: boolean) => void;
}) {
  return (
    <>
      <div className="bg-gray-900 px-4 w-screen h-16 flex items-center justify-between">
        <div className="leftSideNav">
          <h1 className="text-gray-300 text-xl">ClaudeCode</h1>
        </div>
        <div className="rightSideNav flex gap-4">
          <button
            className="border border-gray-300 text-md cursor-pointer hover:text-white text-gray-300 px-3 py-2 rounded-xl font-medium transition-all"
            onClick={() => setSignInModal(true)}
          >
            Login
          </button>
          <button
            className="border border-red-800 hover:border-red-700 hover:text-red-700 text-md cursor-pointer text-red-800 px-3 py-2 rounded-xl font-medium transition-all"
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
