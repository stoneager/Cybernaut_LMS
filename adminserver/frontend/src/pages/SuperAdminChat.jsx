import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5004");

export default function SuperAdminChat() {
  const [sender, setSender] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const chatRef = useRef();

  // Fetch admin name
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/auth/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const name = res.data.user.name;
        setSender(name);
        setRoom(`admins/${encodeURIComponent(name.trim())}`);
      } catch (err) {
        console.error("Failed to fetch admin", err);
      }
    };
    fetchAdmin();
  }, []);

  // Join chat room and receive messages
  useEffect(() => {
    if (!room || !sender) return;

    socket.emit("joinRoom", { name: sender, room });

    socket.on("chatHistory", (history) => setMessages(history));
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.emit("leaveRoom", { room });
      socket.off("chatHistory");
      socket.off("message");
    };
  }, [room, sender]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    socket.emit("message", { name: sender, room, message: msg });
    setMsg("");
  };

  if (!room) {
    return;
  }

  return (
      <div className="flex flex-col h-[calc(100vh-48px)] bg-[#f4f6fb] rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e2b47] text-white px-6 py-4 text-xl font-semibold shadow-sm">
          SuperAdmin Chat
        </div>

        {/* Chat Messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#ecf1f6] scrollbar-thin scrollbar-thumb-gray-400"
        >
          {messages.map((m, i) => {
            const [name, ...text] = m.split(": ");
            const isSender = name === sender;
            return (
              <div
                key={i}
                className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm text-sm break-words ${
                  isSender
                    ? "bg-[#4f7cff] text-white self-end ml-auto"
                    : "bg-white text-gray-800 self-start mr-auto border"
                }`}
              >
                <strong>{name}:</strong> {text.join(": ")}
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t flex items-center gap-2">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2 rounded-full transition"
          >
            Send
          </button>
        </div>
      </div>
  );
}
