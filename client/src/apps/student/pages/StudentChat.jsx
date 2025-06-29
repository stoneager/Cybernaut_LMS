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
    setActiveChat({ type: "forum" }); // ✅ default to forum chat
  } catch (err) {
    console.error("Failed to fetch data", err);
  }
};


    fetchData();
  }, []);

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

  const getHeaderTitle = () => {
    if (!activeChat) return "Select a chat to begin";
    if (activeChat.type === "forum") return `${batchInfo?.courseName || 'Course'} - Course Chat`;
    if (activeChat.type === "admin") return `Chat with ${activeChat.adminName}`;
    return "Chat";
  };

  if (!batchInfo) return <p className="text-center mt-6 text-gray-500">Loading chat...</p>;

  return (
    <div className="flex h-[83vh] bg-gray-100 overflow-hidden">
      {/* Chat Window */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-2 py-2">
          <h1 className="text-xl font-semibold text-gray-800">{getHeaderTitle()}</h1>
          {activeChat?.type === "forum" && (
            <p className="text-sm text-gray-500 mt-1">
              {batchInfo.students?.length || 6} participants
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50" ref={chatRef}>
          {messages.map((m, i) => {
            const [name, ...text] = m.split(": ");
            const isSender = name === sender;
            return (
              <div
                key={i}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col max-w-xs">
                  {!isSender && (
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-gray-600">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{name}</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isSender
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {text.join(": ")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        {activeChat && (
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Participants</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* Forum Chat Option */}
          <div className="mb-4">
            <button
              onClick={() => {
                setMessages([]);
                setActiveChat({ type: "forum" });
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                activeChat?.type === "forum"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-medium">FC</span>
                </div>
                <div>
                  <div className="font-medium">Forum Chat</div>
                  <div className="text-sm text-gray-500">General discussion</div>
                </div>
              </div>
            </button>
          </div>

          {/* Admin Chats */}
          <div className="space-y-2">
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
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeChat?.type === "admin" && activeChat?.adminName === adminName
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 font-medium text-sm">
                      {adminName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{adminName}</div>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">teacher</span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </button>
            ))}
          </div>

          {/* Students List */}
          {batchInfo.students && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Students</h3>
              <div className="space-y-2">
                {batchInfo.students.map((student, i) => (
                  <div key={i} className="flex items-center px-3 py-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-medium text-sm">
                        {student.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{student.name || 'Student'}</div>
                      <div className="text-sm text-gray-500">student</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      student.name === sender ? 'bg-green-400' : 'bg-gray-300'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}