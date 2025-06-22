import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const { batchId } = useParams();
  const [messages, setMessages] = useState([
    { id: 1, sender: "Admin", text: "Welcome to the chat!" },
    { id: 2, sender: "Student", text: "Good morning sir!" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      sender: "Admin",  // For now, only admin side
      text: input,
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Batch Chat (Batch ID: {batchId})</h2>

        <div className="h-96 overflow-y-auto mb-4 border rounded p-4 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-3 ${msg.sender === "Admin" ? "text-blue-600" : "text-green-600"}`}>
              <strong>{msg.sender}: </strong>{msg.text}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded px-4 py-2 shadow-sm"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChatPage;
