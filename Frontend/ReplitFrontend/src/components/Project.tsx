import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaArrowUp } from "react-icons/fa";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { IoHome } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

export interface ConversationProps {
  role: "user" | "assistant";
  content: string;
  timeStamp: string;
}
export interface chatProps {
  _id?: string;
  userInput: string;
  userId?: string;
}

export default function Project() {
  const [msgList, setMsgList] = useState<ConversationProps[]>([]);
  const [isAIResReady, setIsAIResReady] = useState<boolean>(true);
  const [nochat, setNoChat] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { watch, reset, register, handleSubmit } = useForm<chatProps>({
    defaultValues: { userInput: "" },
  });
  const userChat = watch("userInput");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const uri = useLocation();
  const nav = useNavigate();

  const queryParams = new URLSearchParams(uri.search);
  const projectId = queryParams.get("projectId") || "";
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const stateVal = uri.state;
  const publicDnsName =
    typeof stateVal === "string" ? stateVal : (stateVal?.publicDnsName ?? "");
  const projectName =
    typeof stateVal === "string" ? "" : (stateVal?.projectName ?? "");
  const isAI = typeof stateVal === "boolean" ? false : (stateVal?.isAI ?? "");
  const instanceId =
    typeof stateVal === "string" ? "" : (stateVal?.instanceId ?? "");

  useEffect(() => {
    const fetchChatHistory = async () => {
      // const chatRes = await fetch(
      //   `${import.meta.env.VITE_BACKEND_URL}/v0/api/load-chat`,
      //   {
      //     headers: {
      //       token: localStorage.getItem("token") || "",
      //     },
      //     method: "GET",
      //   },
      // );
      // const data = await chatRes.json();
      // setMsgList(data.messages);
      if (!msgList.length) setNoChat(() => true);
      // scrollToBottom();
    };
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [msgList]); // Scroll whenever msgList changes

  const sendChat = async () => {
    const userText = userChat;
    reset();
    if (!userText || userText.trim() === "") return; // Guard clause
    setIsAIResReady(() => false);
    setIsLoading(() => true);
    const newMessage: ConversationProps = {
      role: "user", //assitant or user
      content: userText.trim(),
      timeStamp: new Date().toLocaleString(),
    };
    setMsgList((prevMsgList) => [...prevMsgList, newMessage]);
    setNoChat(() => false);
    const chatRes = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/send-message`,
      {
        headers: {
          token: localStorage.getItem("token") || "",
          "Content-Type": "application/json", // ✅ Critical
        },
        method: "POST",
        body: JSON.stringify({
          msg: userText,
          projectId: projectId,
        }),
      },
    );
    const res = await chatRes.json();
    console.log(res, "res");
    const newAIMessage: ConversationProps = {
      role: "assistant", //assitant or user
      content: res.aiMsg.msg,
      timeStamp: res.aiMsg.createdAt,
    };
    setMsgList((prevMsgList) => [...prevMsgList, newAIMessage]);
    // scrollToBottom();
    setIsAIResReady(() => true);
    setIsLoading(() => false);
  };
  useEffect(() => {
    if (!instanceId) return;
    const heartBeat = setInterval(() => {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/heartBeat/${instanceId}`, {
        headers: {
          token: (localStorage.getItem("token") as string) ?? "",
        },
      })
        .then((res) => {
          if (res.status === 404) {
            clearInterval(heartBeat);
          }
        })
        .catch(() => {});
    }, 1000 * 30);
    return () => clearInterval(heartBeat);
  }, [projectId]);

  function navDashboard() {
    nav("/dashboard");
  }

  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div className="h-screen w-screen bg-gray-950 relative">
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

            <p className="text-gray-400 text-sm">
              Setting up workspace{" "}
              <span className="text-amber-700">
                {projectName ? `${projectName}` : ""}
              </span>
            </p>
          </div>
        )}
        {/* {loaded && ( */}
        <div className="flex flex-col h-screen w-screen">
          {/* Topbar — fixed 36px */}
          <div className="text-[#c3c2b7] h-14 px-8 border-[#c3c2b7]/10 border-b bg-[#2c2c2a] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div
                onClick={navDashboard}
                className="flex items-center gap-2 cursor-pointer group/brand"
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: "#f97316",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="shadow-sm shadow-orange-500/25 group-hover/brand:scale-105 transition-transform duration-200"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect
                      x="1"
                      y="1"
                      width="5"
                      height="5"
                      rx="1"
                      fill="white"
                    />
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
                    <rect
                      x="8"
                      y="8"
                      width="5"
                      height="5"
                      rx="1"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-[#c3c2b7] font-extrabold text-[19px] tracking-tight group-hover/brand:text-orange-500 transition-colors duration-200">
                  Kanvas
                </span>
              </div>
              <div className="h-6 w-[1px] bg-[#c3c2b7]/25" />
              <div className="flex flex-col pl-1">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider select-none leading-none mb-1">
                  Active Workspace
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-sm font-extrabold tracking-wide leading-none">
                    {projectName || "Untitled"}
                  </span>
                </div>
              </div>
            </div>
            <div className="rightSideNav text-[#c3c2b7] text-xl flex gap-4 cursor-pointer">
              <IoHome onClick={navDashboard} />
            </div>
          </div>

          {/* Below topbar — takes remaining height */}
          <div className="flex flex-1 p-3 bg-[#1f1f1e]">
            {/* Left sidebar — fixed 36px wide */}

            {/* iframe — fills rest */}
            {!isAI && (
              <div className="w-full h-full">
                <iframe
                  width="100%"
                  height="100%"
                  onLoad={() => setTimeout(() => setLoaded(true), 3500)}
                  className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                  // src={`https://ws-${instanceId}.kanvas.usecerebro.co.in/?folder=/tmp/project`}
                  src={`http://${publicDnsName}:8080/?folder=/tmp/project`}
                />
              </div>
            )}
            {isAI && (
              <div className="flex w-screen gap-3">
                <div className="w-9/12 h-full shrink-0 bg-[#181818] p-3 rounded-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    onLoad={() => setTimeout(() => setLoaded(true), 3500)}
                    className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                    // src={`https://ws-${instanceId}.kanvas.usecerebro.co.in/?folder=/tmp/project`}
                    src={`http://${publicDnsName}:8080/?folder=/tmp/project`}
                  />
                </div>
                <div className="w-2/6 relative h-full p-2 border  bg-[#181818] rounded-lg">
                  <div className="topbar justify-center text-[#c3c2b7] border-[#c3c2b7]/10 border-b-2 pb-2">
                    <div className="flex gap-1 justify-center items-center">
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          background: "#f97316",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        className="shadow-sm shadow-orange-500/25 group-hover/brand:scale-105 transition-transform duration-200"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <rect
                            x="1"
                            y="1"
                            width="5"
                            height="5"
                            rx="1"
                            fill="white"
                          />
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
                          <rect
                            x="8"
                            y="8"
                            width="5"
                            height="5"
                            rx="1"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <div className="">Kanvas</div>
                    </div>
                  </div>
                  <div
                    id="message-container"
                    style={{ height: "calc(100vh - 250px)" }}
                    className="w-full h-sceen overflow-y-auto  max-md:px-2 mb-28"
                  >
                    {!msgList.length && nochat && (
                      <div className="flex mt-42 gap-4 flex-col justify-center items-center">
                        <div className="empty-cards-desc text-zinc-900 dark:text-white">
                          <div className="text-zinc-900 dark:text-white text-md text-center">
                            Welcome to Kanvas
                          </div>
                          <div className="text-center mt-3 text-zinc-600 text-sm dark:text-[#a9a9a9] max-md:text-sm">
                            Chat with Your personal coding Agent
                          </div>
                        </div>
                        <div className="empty-cards-boxes">
                          <button className="px-3 py-1 bg-primary/20 text-primary text-sm dark:bg-[#E6D8F2] dark:text-zinc-900 rounded flex items-center gap-1 hover:bg-primary/30 dark:hover:bg-purple-200 transition-colors">
                            <HiOutlineChatBubbleLeftRight size={16} />
                            Start Chatting
                          </button>
                        </div>
                      </div>
                    )}
                    {msgList.length > 0 &&
                      msgList.map((msg: ConversationProps, ind) => (
                        <>
                          {msg.role == "user" ? (
                            // FOR USER MESSAGE
                            <>
                              <div
                                key={ind}
                                className="mt-6 w-fit flex items-center ml-auto"
                              >
                                <div className="rounded-lg max-w-lg p-2 w-fit text-[#c3c2b7] text-sm bg-primary shadow-md">
                                  {msg.content}
                                </div>
                                {/* <div className="text-zinc-900 dark:text-white ml-2">
                                  <img
                                    src={userPicture}
                                    alt="User Profile"
                                    className="w-8 h-8 rounded-full"
                                  />
                                </div> */}
                              </div>
                              <div className="text-zinc-500 dark:text-[#a9a9a9] ml-auto  text-[10px] mb-6 text-right">
                                {msg.timeStamp}
                              </div>
                            </>
                          ) : (
                            // FOR AI MESSAGE
                            <>
                              <div className="my-12">
                                <div className="flex items-center ">
                                  <div className="mr-2 flex items-center justify-center">
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
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                      >
                                        <rect
                                          x="1"
                                          y="1"
                                          width="5"
                                          height="5"
                                          rx="1"
                                          fill="white"
                                        />
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
                                        <rect
                                          x="8"
                                          y="8"
                                          width="5"
                                          height="5"
                                          rx="1"
                                          fill="white"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                  <div
                                    key={ind}
                                    style={{ maxWidth: "calc(100% - 50px)" }}
                                    className="rounded-lg text-[#c3c2b7] w-fit bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-3"
                                  >
                                    <ReactMarkdown
                                      components={{
                                        p: ({ children, ...props }) => {
                                          return (
                                            <p
                                              className="text-[#c3c2b7] text-sm dark:text-gray-200 mb-2"
                                              {...props}
                                            >
                                              {children}
                                            </p>
                                          );
                                        },
                                        li: ({ children, ...props }) => {
                                          // Fix: join array children properly instead of String()
                                          return (
                                            <li
                                              style={{ listStyle: "inside" }}
                                              className="text-zinc-700 dark:text-gray-200 ml-5 mb-1"
                                              {...props}
                                            >
                                              {children}
                                            </li>
                                          );
                                        },
                                      }}
                                    >
                                      {msg.content}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                              {/* {JSON.stringify(msg.sourceIds)} */}
                            </>
                          )}
                        </>
                      ))}
                    {!isAIResReady && (
                      <>
                        <div className="flex gap-1 px-2 py-1  border border-zinc-200 dark:border-transparent rounded-lg w-fit items-center shadow-sm">
                          <div
                            className="w-2 h-2 mt-1 bg-amber-700 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 mt-1 bg-amber-700 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 mt-1 bg-amber-700 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={handleSubmit(sendChat)} className="flex">
                    <div className="bottom-chat-box absolute w-full bottom-0 right-0">
                      <div className="relative p-2">
                        <div className="flex rounded-lg text-[#c3c2b7] p-1 bottom-1 min-h-20 gap-1 justify-between border-[#c3c2b7]/10 border-2">
                          <textarea
                            rows={3}
                            {...register("userInput", {})}
                            placeholder={`${isLoading ? "Processing..." : "@kanvas to talk AI..."}`}
                            className="focus:outline-none focus:ring-0 w-9/10 text-sm p-2"
                          />
                          <div className="relative w-1/10">
                            {isLoading && (
                              <button
                                type="submit"
                                disabled={true}
                                className="cursor-pointer mt-2 bg-zinc-200 dark:bg-zinc-700 right-4 top-2 rounded-lg p-1"
                              >
                                <AiOutlineLoading3Quarters
                                  size={20}
                                  className="text-zinc-400 dark:text-zinc-500 animate-spin"
                                />
                              </button>
                            )}
                            {!isLoading &&
                              (userChat !== "" ? (
                                <button className="">
                                  <span className="absolute bottom-1 bg-amber-700 hover:bg-amber-800 rounded-lg p-1.5 cursor-pointer left-1">
                                    <FaArrowUp className="text-white" />
                                  </span>
                                </button>
                              ) : (
                                <button className="">
                                  <span className="absolute bottom-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg p-1.5 cursor-pointer left-1">
                                    <FaArrowUp className="text-white dark:text-zinc-500" />
                                  </span>
                                </button>
                              ))}
                          </div>
                        </div>
                        {/* <input type="text"></input> */}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* )} */}
      </div>
    </>
  );
}
