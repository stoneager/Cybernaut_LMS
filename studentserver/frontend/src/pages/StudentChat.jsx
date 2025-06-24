import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5004");

export default function StudentChat() {
  const [sender, setSender] = useState("");
  const [batchInfo, setBatchInfo] = useState(null);
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [activeChat, setActiveChat] = useState(null); // { type: "forum" | "admin", adminName: "..." }
  const chatRef = useRef();

  // Fetch student and batch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const studentRes = await axios.get("http://localhost:5000/auth/student/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSender(studentRes.data.user.name);

        const batchId = new URLSearchParams(window.location.search).get("batch");
        const batchRes = await axios.get(`http://localhost:5003/student/batch/by-id/${batchId}`);
        setBatchInfo(batchRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, []);

  // Set room when activeChat changes
  useEffect(() => {
    if (!activeChat || !batchInfo || !sender) return;

    const course = batchInfo.courseName;
    const batch = batchInfo.batchName;
    const encodedStudent = encodeURIComponent(sender.trim());

    let newRoom = "";

    if (activeChat.type === "forum") {
      newRoom = `${course}/${batch}/forum/general`;
    } else if (activeChat.type === "admin") {
      const adminName = encodeURIComponent(activeChat.adminName.trim());
      newRoom = `${course}/${batch}/admins/${adminName}/students/${encodedStudent}`;
    }

    setRoom(newRoom);
  }, [activeChat, batchInfo, sender]);

  // Handle socket
  useEffect(() => {
    if (!room || !sender) return;

    socket.emit("joinRoom", { name: sender, room });

    socket.on("chatHistory", history => setMessages(history));
    socket.on("message", msg => setMessages(prev => [...prev, msg]));

    return () => {
      socket.emit("leaveRoom", { room });
      socket.off("chatHistory");
      socket.off("message");
    };
  }, [room, sender]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    socket.emit("message", { name: sender, room, message: msg });
    setMsg("");
  };

  if (!batchInfo) return <p className="text-center mt-6 text-gray-500">Loading chat...</p>;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Chats</h2>

        <div className="mb-2">
          <button
            onClick={() => {
              setMessages([]);
              setActiveChat({ type: "forum" });
            }}
            className={`w-full text-left px-4 py-2 rounded ${
              activeChat?.type === "forum"
                ? "bg-green-600 text-white"
                : "hover:bg-gray-100 text-gray-800"
            }`}
          >
            🧑‍🤝‍🧑 Forum Chat
          </button>
        </div>

        <hr className="my-2" />

        {Object.entries(
  batchInfo.admins.reduce((acc, admin) => {
    const name = admin.name;
    if (!acc[name]) acc[name] = [];
    acc[name].push(admin.module);
    return acc;
  }, {})
).map(([adminName, modules], i) => (
  <button
    key={i}
    onClick={() => {
      setMessages([]);
      setActiveChat({ type: "admin", adminName });
    }}
    className={`w-full text-left px-4 py-2 rounded ${
      activeChat?.type === "admin" && activeChat?.adminName === adminName
        ? "bg-blue-600 text-white"
        : "hover:bg-gray-100 text-gray-800"
    }`}
  >
    💬 {adminName} ({modules.join(", ")})
  </button>
))}

      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 font-semibold text-gray-700">
          {activeChat?.type === "forum"
            ? "Forum Chat"
            : activeChat?.adminName
            ? `Chat with ${activeChat.adminName}`
            : "Select a chat to begin"}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2" ref={chatRef}>
          {messages.map((m, i) => {
            const [name, ...text] = m.split(": ");
            const isSender = name === sender;
            return (
              <div
                key={i}
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isSender
                    ? "bg-green-500 text-white self-end ml-auto"
                    : "bg-white border text-black self-start mr-auto"
                }`}
              >
                <strong>{name}:</strong> {text.join(": ")}
              </div>
            );
          })}
        </div>

        {/* Input */}
        {activeChat && (
          <div className="p-4 bg-white border-t flex">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-l px-4 py-2"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 text-white px-6 py-2 rounded-r hover:bg-green-600"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
