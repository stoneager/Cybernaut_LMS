import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5004");

const SuperAdminChat = () => {
  const [batches, setBatches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [chatType, setChatType] = useState(""); // "admin" | "forum"
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const chatRef = useRef();
  const sender = "superadmin";

  const room =
    chatType === "forum" && selectedBatch && selectedCourse && selectedModule
      ? `${selectedCourse}/${selectedBatch}/forum/${selectedModule}/general`
      : chatType === "admin" && selectedTarget
      ? `admins/${selectedTarget}`
      : null;

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await axios.get("http://localhost:5004/chatrooms");
        setBatches(res.data);
      } catch (err) {
        console.error("Failed to load batches", err);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("http://localhost:5004/chatrooms/admins");
        setAdmins(res.data);
      } catch (err) {
        console.error("Error fetching admins", err);
      }
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    const fetchMetadata = async () => {
      try {
        console.log("Requesting metadata for batch:", selectedBatch);
        await axios.get(`http://localhost:5004/chatrooms/metadata/${encodeURIComponent(selectedBatch)}`);
        setSelectedCourse(res.data.course);
        setModules(res.data.modules);
        setSelectedModule(null);
        setSelectedTarget(null);
        setChatType("");
        setMessages([]);
      } catch (err) {
        console.error("Failed to load metadata for batch", err);
      }
    };
    fetchMetadata();
  }, [selectedBatch]);

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

  const selectChat = (type, target = null) => {
    setChatType(type);
    setSelectedTarget(target);
    setMessages([]);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-3">SuperAdmin Chat</h2>

        <label className="block text-sm font-medium text-gray-600">Batch:</label>
        <select
          className="w-full mb-4 p-2 border rounded"
          value={selectedBatch || ""}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="" disabled>Select batch</option>
          {batches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {selectedCourse && (
          <>
            <label className="block text-sm font-medium text-gray-600">Course:</label>
            <input
              className="w-full mb-4 p-2 border rounded bg-gray-200"
              value={selectedCourse}
              readOnly
            />

            <label className="block text-sm font-medium text-gray-600">Module:</label>
            <select
              className="w-full mb-4 p-2 border rounded"
              value={selectedModule || ""}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="" disabled>Select module</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </>
        )}

        {selectedBatch && selectedCourse && selectedModule && (
          <button
            onClick={() => selectChat("forum")}
            className={`block w-full text-left p-3 rounded mb-4 ${
              chatType === "forum" ? "bg-green-200" : "hover:bg-gray-200"
            }`}
          >
            🧑‍🤝‍🧑 Forum — {selectedModule}
          </button>
        )}

        <h3 className="text-sm font-semibold text-gray-600 mb-2">Admins</h3>
        {admins.map((admin) => (
          <button
            key={admin}
            onClick={() => selectChat("admin", admin)}
            className={`block w-full text-left p-3 rounded mb-2 ${
              selectedTarget === admin && chatType === "admin"
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
              Chat with {chatType === "forum" ? `Forum (${selectedModule})` : selectedTarget}
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2" ref={chatRef}>
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
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminChat;
