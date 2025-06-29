import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaSearch, FaUserCircle, FaUsers } from "react-icons/fa";

const socket = io("http://localhost:5004");
const sender = "superadmin";

const SuperAdminChat = () => {
  const [courseFilter, setCourseFilter] = useState("All");
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

  // Fetch Forum Rooms
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

      // Auto-select first forum chat if nothing is selected yet
      if (!selectedTarget && allRooms.length > 0) {
        setChatType("forum");
        setSelectedTarget(allRooms[0].roomPath);
      }
    } catch (err) {
      console.error("❌ Failed to fetch forum chat rooms", err);
    }
  };

  fetchForumChats();
}, []);


  // Fetch Admins
useEffect(() => {
  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5004/chatrooms/admins");
      const cleaned = res.data.map((name) => decodeURIComponent(name));
      setAdmins(cleaned);

      // If no forum chat was auto-selected, fallback to first admin
      if (!selectedTarget && cleaned.length > 0) {
        setChatType("admin");
        setSelectedTarget(cleaned[0]);
      }
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
      .filter((r) => courseFilter === "All" || r.course === courseFilter)
      .map((r) => ({ name: `${r.course} → ${r.batch}`, path: r.roomPath, type: "forum" }));

  return [
    ...admins.map((a) => ({ name: a, type: "admin" })),
    ...forumRooms
      .filter((r) => courseFilter === "All" || r.course === courseFilter)
      .map((r) => ({ name: `${r.course} → ${r.batch}`, path: r.roomPath, type: "forum" })),
  ];
};


  return (
    <div className="p-0 m-0 flex h-[89vh] bg-white text-black">
      {/* Sidebar */}
      <div className="w-1/3 bg-white text-black border-r border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">SuperAdmin Chat</h2>

        {/* Search Bar */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start a new chat"
            className="w-full bg-gray-100 text-black pl-10 pr-4 py-2 rounded-full focus:outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-4 text-sm">
          {["All", "Groups", "Admins"].map((filter) => (
  <button
    key={filter}
    onClick={() => setCourseFilter(filter)}
    className={`px-3 py-1 rounded-full ${
      courseFilter === filter
        ? "bg-blue-500 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    {filter}
  </button>
))}

        </div>

        {/* Forum Chats */}
        {["All", "Groups"].includes(courseFilter) && (
          <>
            <h3 className="text-xs uppercase text-gray-500 mb-2">Forum Groups</h3>
            {forumRooms.map((r) => (
              <button
                key={r.roomPath}
                onClick={() => selectChat("forum", r.roomPath)}
                className={`flex items-center space-x-2 w-full text-left p-3 rounded-lg mb-2 ${
                  chatType === "forum" && selectedTarget === r.roomPath
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <FaUsers className="text-lg text-gray-600" />
                <div>
                  <div className="font-medium">{r.course}</div>
                  <div className="text-sm text-gray-500">{r.batch}</div>
                </div>
              </button>
            ))}
          </>
        )}

        {/* Admin Chats */}
        {["All", "Admins"].includes(courseFilter) && (
          <>
            <h3 className="text-xs uppercase text-gray-500 mt-6 mb-2">Admins</h3>
            {admins.map((admin) => (
              <button
                key={admin}
                onClick={() => selectChat("admin", admin)}
                className={`flex items-center space-x-3 w-full text-left p-3 rounded-lg mb-2 ${
                  chatType === "admin" && selectedTarget === admin
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="relative w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {admin[0].toUpperCase()}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="font-medium">{admin}</div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-2/3 flex flex-col">
        {room ? (
          <>
            <div className="p-3 bg-white text-black font-medium shadow-sm">
              Chat with {chatType === "forum" ? selectedTarget.split("/").slice(0, 2).join(" → ") : selectedTarget}
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4" ref={chatRef}>
  {messages.map((m, i) => {
    const [name, ...text] = m.split(": ");
    const decodedName = decodeURIComponent(name);
    const isSender = decodedName === sender;
    return (
      <div
        key={i}
        className={`flex flex-col ${
          isSender ? "items-end" : "items-start"
        }`}
      >
        {!isSender && (
          <div className="text-xs text-gray-600 font-medium mb-1 ml-1">
            {decodedName}
          </div>
        )}
        <div
          className={`max-w-sm px-4 py-2 rounded-xl text-sm whitespace-pre-wrap break-words ${
            isSender
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 text-black rounded-bl-none"
          }`}
        >
          {text.join(": ")}
        </div>
      </div>
    );
  })}
</div>


            <div className="p-3 bg-white flex border-t border-gray-300">
              <input
                className="flex-1 bg-gray-100 text-black border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none"
                placeholder="Type a message..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-6 py-2 rounded-r-full hover:bg-blue-600"
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
