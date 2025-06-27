// Enhanced SuperAdminChat with WhatsApp-style UI and filtering
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaSearch, FaUserCircle, FaUsers } from "react-icons/fa";

const socket = io("http://localhost:5004");
const sender = "superadmin";

const SuperAdminChat = () => {
  const [courseFilter, setCourseFilter] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [forumRooms, setForumRooms] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [chatType, setChatType] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const chatRef = useRef();

  const room =
    chatType === "forum" && selectedTarget
      ? selectedTarget
      : chatType === "admin" && selectedTarget
      ? `admins/${encodeURIComponent(selectedTarget.trim())}`
      : null;

  useEffect(() => {
    const fetchForumChats = async () => {
      try {
        const { data: courses } = await axios.get("http://localhost:5004/chatrooms");
        const allRooms = [];
        for (let rawCourse of courses) {
          if (rawCourse !== 'admins') {
            const course = decodeURIComponent(rawCourse);
            const batchListRes = await axios.get(`http://localhost:5004/chatrooms/${encodeURIComponent(course)}`);
            const batches = batchListRes.data;
            batches.forEach((batch) => {
              allRooms.push({
                course,
                batch,
                roomPath: `${course}/${batch}/forum/general`,
              });
            });
          }
        }
        setForumRooms(allRooms);
      } catch (err) {
        console.error("❌ Failed to fetch forum chat rooms", err);
      }
    };

    fetchForumChats();
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("http://localhost:5004/chatrooms/admins");
        const cleaned = res.data.map((name) => decodeURIComponent(name));
        setAdmins(cleaned);
      } catch (err) {
        console.error("❌ Failed to fetch admins", err);
      }
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (!room) return;
    socket.emit("joinRoom", { name: sender, room });
    socket.on("chatHistory", (history) => setMessages(history));
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
    return () => {
      socket.emit("leaveRoom", { room });
      socket.off("chatHistory");
      socket.off("message");
    };
  }, [room]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    socket.emit("message", { name: sender, room, message: msg });
    setMsg("");
  };

  const selectChat = (type, target) => {
    setChatType(type);
    setSelectedTarget(target);
    setMessages([]);
  };

  const filteredChats = () => {
    if (filterType === "admins") return admins.map((a) => ({ name: a, type: "admin" }));
    if (filterType === "forums")
      return forumRooms
        .filter((r) => !courseFilter || r.course === courseFilter)
        .map((r) => ({ name: `${r.course} → ${r.batch}`, path: r.roomPath, type: "forum" }));
    return [
      ...admins.map((a) => ({ name: a, type: "admin" })),
      ...forumRooms
        .filter((r) => !courseFilter || r.course === courseFilter)
        .map((r) => ({ name: `${r.course} → ${r.batch}`, path: r.roomPath, type: "forum" })),
    ];
  };

  return (
    <div className="flex h-screen bg-[#111b21] text-white">
      {/* Sidebar */}
<div className="w-1/3 bg-[#111b21] text-white border-r border-gray-700 p-4 overflow-y-auto">
  <h2 className="text-lg font-semibold mb-4">SuperAdmin Chat</h2>

  {/* 🔍 Search Bar */}
  <div className="relative mb-4">
    <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
    <input
      type="text"
      placeholder="Search or start a new chat"
      className="w-full bg-[#202c33] text-white pl-10 pr-4 py-2 rounded-full focus:outline-none"
    />
  </div>

  {/* 🏷️ Filter Tabs */}
  <div className="flex space-x-2 mb-4 text-sm">
    {["All", "Groups", "Admins"].map((filter) => (
      <button
        key={filter}
        onClick={() => setCourseFilter(filter)}
        className={`px-3 py-1 rounded-full ${
          courseFilter === filter || (filter === "All" && courseFilter === "")
            ? "bg-green-600 text-white"
            : "bg-[#202c33] text-gray-300"
        }`}
      >
        {filter}
      </button>
    ))}
  </div>

  {/* 💬 Forum Group Chats */}
  {["All", "Groups"].includes(courseFilter) &&
    <>
      <h3 className="text-xs uppercase text-gray-400 mb-2">Forum Groups</h3>
      {forumRooms.map((r) => (
        <button
          key={r.roomPath}
          onClick={() => selectChat("forum", r.roomPath)}
          className={`flex items-center space-x-2 w-full text-left p-3 rounded-lg mb-2 ${
            chatType === "forum" && selectedTarget === r.roomPath
              ? "bg-[#005c4b]"
              : "hover:bg-[#202c33]"
          }`}
        >
          <FaUsers className="text-lg" />
          <div>
            <div className="font-medium">{r.course}</div>
            <div className="text-sm text-gray-400">{r.batch}</div>
          </div>
        </button>
      ))}
    </>
  }

  {/* 👨‍💼 Admin Chats */}
  {["All", "Admins"].includes(courseFilter) &&
    <>
      <h3 className="text-xs uppercase text-gray-400 mt-6 mb-2">Admins</h3>
      {admins.map((admin) => (
        <button
          key={admin}
          onClick={() => selectChat("admin", admin)}
          className={`flex items-center space-x-2 w-full text-left p-3 rounded-lg mb-2 ${
            chatType === "admin" && selectedTarget === admin
              ? "bg-[#005c4b]"
              : "hover:bg-[#202c33]"
          }`}
        >
          <FaUserCircle className="text-xl" />
          <div className="font-medium">{admin}</div>
        </button>
      ))}
    </>
  }
</div>

      {/* Chat Section */}
      <div className="w-2/3 flex flex-col">
        {room ? (
          <>
            <div className="p-4 border-b border-gray-700 bg-[#202c33] font-semibold text-lg">
              Chat with {chatType === "forum" ? selectedTarget.split("/").slice(0, 2).join(" → ") : selectedTarget}
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-[#0b141a] space-y-2" ref={chatRef}>
              {messages.map((m, i) => {
                const [name, ...text] = m.split(": ");
                const isSender = decodeURIComponent(name) === sender;
                return (
                  <div
                    key={i}
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                      isSender
                        ? "bg-[#005c4b] text-white self-end ml-auto"
                        : "bg-[#202c33] text-white self-start mr-auto"
                    }`}
                  >
                    <strong>{decodeURIComponent(name)}:</strong> {text.join(": ")}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-700 bg-[#202c33] flex">
              <input
                className="flex-1 bg-[#2a3942] text-white border-none rounded-l px-4 py-2 focus:outline-none"
                placeholder="Type a message..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-green-500 text-white px-6 py-2 rounded-r hover:bg-green-600"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminChat;
