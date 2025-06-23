import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5004");

const SuperAdminChat = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const chatRef = useRef();

  const batch = "B1";
  const sender = "superadmin";
  const room = selectedAdmin ? `${batch}/admins/${selectedAdmin.user.name}` : null;

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/admins");
        setAdmins(res.data);
      } catch (err) {
        console.error("Error fetching admins", err);
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

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Admin List */}
      <div className="w-1/3 overflow-y-auto border-r">
        <h2 className="text-lg font-semibold mb-4">Chat with Admins</h2>
        {admins.map((admin) => (
          <div
            key={admin._id}
            onClick={() => setSelectedAdmin(admin)}
            className={`p-3 rounded cursor-pointer mb-2 hover:bg-gray-200 ${
              selectedAdmin?.user._id === admin.user._id ? "bg-green-100" : ""
            }`}
          >
            <p className="font-medium">{admin.user.name}</p>
            <p className="text-sm text-gray-500">{admin.user.email}</p>
          </div>
        ))}
      </div>

      {/* Chat Box */}
      <div className="w-2/3 flex flex-col">
        {selectedAdmin ? (
          <>
            <div className="p-4 border-b bg-white font-semibold text-lg">
              Chat with {selectedAdmin.user.name}
            </div>

            <div
              className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2"
              ref={chatRef}
            >
              {messages.map((m, i) => {
                const [name, ...text] = m.split(": ");
                const isSender = name === sender;
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
                      <strong>{name}:</strong> {text.join(": ")}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t bg-white flex">
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
            Select an admin to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminChat;
