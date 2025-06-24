import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
const socket = io("http://localhost:5004");

export default function SuperAdminChat() {
  const [sender, setSender] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const chatRef = useRef();

  // ✅ Fetch admin details
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

  // ✅ Handle socket events
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

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    socket.emit("message", { name: sender, room, message: msg });
    setMsg("");
  };

  if (!room) return <p className="text-center mt-6 text-gray-500">Loading chat...</p>;

  return (
    <Sidebar>
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="text-center bg-white border-b p-3 font-semibold text-lg">
        Chat with SuperAdmin
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2" ref={chatRef}>
        {messages.map((m, i) => {
          const [name, ...text] = m.split(": ");
          const isSender = name === sender;
          return (
            <div
              key={i}
              className={`max-w-xs px-4 py-2 rounded-lg ${
                isSender
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-white border text-black self-start mr-auto"
              }`}
            >
              <strong>{name}:</strong> {text.join(": ")}
            </div>
          );
        })}
      </div>

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
          className="bg-blue-500 text-white px-6 py-2 rounded-r hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
    </Sidebar>
  );
}
