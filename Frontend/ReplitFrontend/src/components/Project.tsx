import { useLocation } from "react-router-dom";

export default function Project() {
  const uri = useLocation();
  console.log(uri.pathname, "uri pathname");
  console.log(uri.search, "uri.search");
  console.log(
    `http://${localStorage.getItem(uri.search.split("=")[1])}:8080/?folder=/tmp/project`,
  );
  return (
    <>
      <div className="h-screen w-screen">
        {/* <h1 className="text-white">My project</h1> */}
        <iframe
          width="100%"
          height="100%"
          src={`http://${localStorage.getItem(uri.search.split("=")[1])}:8080/?folder=/tmp/project`}
        ></iframe>
      </div>
    </>
  );
}
