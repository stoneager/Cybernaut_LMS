import { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import UserContext from '../context/UserContext';

const socket = io('http://localhost:5004');

export default function StudentChat() {
  const { module, type } = useParams(); // type: group or admin
  const { userData: user } = useContext(UserContext);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState('');
  const chatRef = useRef();

  // 🧠 Define room structure based on type
  const room = user
    ? type === 'group'
      ? `${user.course}/${user.batch}/forum/${module}/general`
      : `${user.course}/${user.batch}/${module}/students/${user.name}`
    : null;

  useEffect(() => {
    if (!user || !room) return;

    socket.emit('joinRoom', { name: user.name, room });

    socket.on('chatHistory', history => setChat(history));
    socket.on('message', message => setChat(prev => [...prev, message]));

    return () => {
      socket.emit('leaveRoom', { room });
      socket.off('chatHistory');
      socket.off('message');
    };
  }, [room, user]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [chat]);

  const send = () => {
    if (msg && room && user) {
      socket.emit('message', { name: user.name, room, message: msg });
      setMsg('');
    }
  };

  if (!user) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">
        {type === 'group' ? 'Forum Chat' : 'Admin Chat'} — {module}
      </h3>

      <div
        ref={chatRef}
        className="bg-white p-4 rounded-md shadow-md max-h-96 overflow-y-auto mb-4 space-y-3 border border-gray-200"
      >
        {chat.map((m, i) => {
          const [name, ...textParts] = m.split(': ');
          const message = textParts.join(': ');
          const isSender = name === user.name;

          return (
            <div
              key={i}
              className={`flex items-start space-x-3 ${
                isSender ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isSender && (
                <div className="bg-purple-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold">
                  {name[0]}
                </div>
              )}
              <div
                className={`p-3 rounded-lg shadow-sm max-w-xs ${
                  isSender
                    ? 'bg-purple-100 text-purple-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message}</p>
                <p className="text-[10px] text-gray-500 mt-1 text-right">Just now</p>
              </div>
              {isSender && (
                <div className="bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold">
                  {name[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={send}
          className="bg-purple-600 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
