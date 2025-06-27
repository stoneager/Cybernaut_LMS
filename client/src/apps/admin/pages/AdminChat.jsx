import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom"; 
const socket = io("http://localhost:5004");

export default function AdminChat() {
  const { batchId } = useParams();
  const [sender, setSender] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [chatType, setChatType] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const chatRef = useRef();

  const room =
    chatType === "forum"
      ? `${course}/${batch}/forum/general`
      : chatType === "student" && selectedTarget
      ? `${course}/${batch}/admins/${encodeURIComponent(sender.trim())}/students/${selectedTarget.trim()}`
      : null;

  useEffect(() => {
  const fetchMyBatch = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5002/api/admin-batches/my-batches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const myId = JSON.parse(atob(token.split('.')[1])).id;
      
      // 🔍 Find the batch that matches the URL batchId
      const matchingBatch = res.data.find(b => b._id === batchId);

      if (!matchingBatch) {
        console.warn("No matching batch found for batchId in URL");
        return;
      }

      // ✅ Set course and batch from the matched batch
      setCourse(matchingBatch.course.courseName);
      setBatch(matchingBatch.batchName);

      // ✅ Set sender (admin name from this batch)
      const adminInfo = matchingBatch.admins.find(a => a.admin._id === myId);
      if (adminInfo) {
        setSender(adminInfo.admin.name);
      } else {
        console.warn("Admin info not found for current user");
      }

    } catch (err) {
      console.error("Error fetching admin batches:", err);
    }
  };

  fetchMyBatch();
}, []);


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
    <div className="w-full h-[calc(100vh-4rem)] flex overflow-hidden"> {/* Adjust if header exists */}
      {/* Sidebar */}
      <div className="w-72 bg-white border-r flex flex-col p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">Admin Chat</h2>

        <button
          onClick={() => selectChat("forum")}
          className={`block w-full text-left p-3 rounded-md font-medium ${
            chatType === "forum"
              ? "bg-blue-100 text-blue-900"
              : "hover:bg-gray-200 text-gray-800"
          }`}
        >
          🧑‍🤝‍🧑 Group Chat
        </button>

        <div className="mt-6">
          <h3 className="text-xs uppercase text-gray-500 mb-2">Students</h3>
          {students.map((student) => (
            <button
              key={student}
              onClick={() => selectChat("student", student)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedTarget === student && chatType === "student"
                  ? "bg-blue-100 text-blue-900"
                  : "hover:bg-gray-200 text-gray-800"
              }`}
            >
              👤 {decodeURIComponent(student)}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Box */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {room ? (
          <>
            <div className="bg-white border-b px-6 py-4 text-lg font-semibold text-blue-700">
              Chat with {chatType === "forum" ? "Group" : decodeURIComponent(selectedTarget)}
            </div>

            <div ref={chatRef} className="flex-1 px-6 py-4 overflow-y-auto space-y-3">
              {messages.map((m, i) => {
                const isSender = m.startsWith(`${sender}:`);
                return (
                  <div
                    key={i}
                    className={`max-w-[75%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap break-words shadow ${
                      isSender
                        ? "bg-blue-500 text-white self-end ml-auto"
                        : "bg-white border text-black self-start mr-auto"
                    }`}
                  >
                    {m}
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white border-t flex">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
