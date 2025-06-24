import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import AdminLayout from "../components/AdminLayout";

const socket = io("http://localhost:5004");

const AdminChat = () => {
  const [sender, setSender] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [chatType, setChatType] = useState(""); // "student" | "forum"
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const chatRef = useRef();

  const room =
    chatType === "forum"
      ? `${course}/${batch}/forum/general`
      : chatType === "student" && selectedTarget
      ? `${course}/${batch}/admins/${encodeURIComponent(sender.trim())}/students/${encodeURIComponent(selectedTarget.trim())}`
      : null;

  // ✅ Fetch admin's batch and own name
  useEffect(() => {
    const fetchMyBatch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5002/api/admin-batches/my-batches", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const myId = JSON.parse(atob(token.split('.')[1])).id;
        const batchData = res.data[0]; // First assigned batch

        setCourse(batchData.course.courseName);
        setBatch(batchData.batchName);

        const adminInfo = batchData.admins.find(a => a.admin._id === myId);
        setSender(adminInfo.admin.name);
      } catch (err) {
        console.error("Error fetching admin batch", err);
      }
    };
    fetchMyBatch();
  }, []);

  // ✅ Load students for the batch (not module-specific now)
  useEffect(() => {
    if (!course || !batch || !sender) return;
    const fetchStudents = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5004/chatrooms/${course}/${batch}/admins/${encodeURIComponent(sender.trim())}/students`
        );
        setStudents(res.data);
      } catch (err) {
        console.error("Error loading students", err);
      }
    };
    fetchStudents();
  }, [course, batch, sender]);

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
    <AdminLayout>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-1/3 bg-gray-100 border-r p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3">Admin Chat</h2>

          <button
            onClick={() => selectChat("forum")}
            className={`block w-full text-left p-3 rounded mb-4 ${
              chatType === "forum" ? "bg-green-200" : "hover:bg-gray-200"
            }`}
          >
            🧑‍🤝‍🧑 Group Chat
          </button>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Students</h3>
            {students.map((student) => (
              <button
                key={student}
                onClick={() => selectChat("student", student)}
                className={`block w-full text-left p-3 rounded mb-2 ${
                  selectedTarget === student && chatType === "student"
                    ? "bg-green-200"
                    : "hover:bg-gray-200"
                }`}
              >
                👤 {student}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Box */}
        <div className="w-2/3 flex flex-col">
          {room ? (
            <>
              <div className="p-4 border-b bg-white font-semibold text-lg capitalize">
                Chat with{" "}
                {chatType === "forum" ? "Group" : selectedTarget}
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
    </AdminLayout>
  );
};

export default AdminChat;
