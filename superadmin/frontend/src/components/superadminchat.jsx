import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5004");
const sender = "superadmin";

const SuperAdminChat = () => {
  const [courseFilter, setCourseFilter] = useState("");
  const [forumRooms, setForumRooms] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [selectedTarget, setSelectedTarget] = useState(null);
  const [chatType, setChatType] = useState(""); // "admin" | "forum"
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const chatRef = useRef();

  const room =
    chatType === "forum" && selectedTarget
      ? selectedTarget // already full path: course/batch/forum/module/general
      : chatType === "admin" && selectedTarget
      ? `admins/${selectedTarget}`
      : null;

  // ✅ Load all forum chats grouped by course/batch/module
  useEffect(() => {
    const fetchForumChats = async () => {
      try {
        const { data: courses } = await axios.get("http://localhost:5004/chatrooms");

        const allRooms = [];
        for (let rawCourse of courses) {
          const course = decodeURIComponent(rawCourse);
          try {
            const batchListRes = await axios.get(`http://localhost:5004/chatrooms/${encodeURIComponent(course)}`);
            const batches = batchListRes.data;

            for (let batch of batches) {
              try {
                const metaRes = await axios.get(`http://localhost:5004/chatrooms/metadata/${encodeURIComponent(batch)}`);
                const { modules } = metaRes.data;

                modules.forEach((mod) => {
                  allRooms.push({
  course,
  batch,
  module: mod,
  roomPath: `${course}/${batch}/forum/general`, // ✅ matches your expected path
});

                });
              } catch (err) {
                console.warn(`❌ Could not load metadata for ${batch}`);
              }
            }
          } catch (err) {
            console.warn(`❌ Could not fetch batches for ${course}`);
          }
        }

        setForumRooms(allRooms);
      } catch (err) {
        console.error("❌ Failed to fetch forum chat rooms", err);
      }
    };

    fetchForumChats();
  }, []);

  // ✅ Load Admins and decode names
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

  // ✅ Join socket room
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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">SuperAdmin Chat</h2>

        {/* Course Filter */}
        <label className="text-sm font-medium text-gray-600">Filter by Course:</label>
        <select
          className="w-full mb-4 p-2 border rounded"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="">All Courses</option>
          {[...new Set(forumRooms.map((r) => r.course))].map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>

        {/* Forum Rooms */}
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Forums</h3>
        {forumRooms
          .filter((r) => !courseFilter || r.course === courseFilter)
          .map((r) => (
            <button
              key={r.roomPath}
              onClick={() => selectChat("forum", r.roomPath)}
              className={`block w-full text-left p-3 rounded mb-2 ${
                chatType === "forum" && selectedTarget === r.roomPath
                  ? "bg-green-200"
                  : "hover:bg-gray-200"
              }`}
            >
              🧑‍🤝‍🧑 {r.course} → {r.batch} → {r.module}
            </button>
          ))}

        {/* Admins */}
        <h3 className="text-sm font-semibold text-gray-600 mt-6 mb-2">Admins</h3>
        {admins.map((admin) => (
          <button
            key={admin}
            onClick={() => selectChat("admin", admin)}
            className={`block w-full text-left p-3 rounded mb-2 ${
              chatType === "admin" && selectedTarget === admin
                ? "bg-green-200"
                : "hover:bg-gray-200"
            }`}
          >
            👨‍💼 {admin}
          </button>
        ))}
      </div>

      {/* Chat box */}
      <div className="w-2/3 flex flex-col">
        {room ? (
          <>
            <div className="p-4 border-b bg-white font-semibold text-lg capitalize">
              Chat with{" "}
              {chatType === "forum"
                ? selectedTarget.split("/").slice(1, 3).join(" → ")
                : selectedTarget}
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2" ref={chatRef}>
              {messages.map((m, i) => {
                const [name, ...text] = m.split(": ");
                const isSender = decodeURIComponent(name) === sender;
                return (
                  <div
                    key={i}
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isSender
                        ? "bg-green-500 text-white self-end ml-auto"
                        : "bg-white text-black border self-start mr-auto"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      <strong>{decodeURIComponent(name)}:</strong> {text.join(": ")}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t bg-white flex sticky bottom-0">
              <input
                className="flex-1 border rounded-l px-4 py-2 focus:outline-none"
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
