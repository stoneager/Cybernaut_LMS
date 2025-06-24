import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function StudentModule() {
  const { name } = useParams();
  const { userData } = useContext(UserContext);
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;
    axios.get(`http://localhost:5003/notes/${userData.batch}/${name}`)
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : res.data.notes || [];
        setNotes(arr);
      })
      .catch(err => console.error('Fetch notes failed', err));
  }, [userData, name]);

  if (!userData) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Notes for <span className="text-purple-600">{name}</span> — Batch: <span className="text-blue-600">{userData.batch}</span>
      </h2>

      {/* Responsive grid: 1 column on mobile, 2 on md, 3 on lg */}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <li key={note._id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">{note.title}</h4>
            <p className="text-sm text-gray-600 mb-1">
              Meet: <a href={note.meetlink} className="text-blue-600 hover:underline break-all">{note.meetlink}</a>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Quiz: <a href={note.quizlink} className="text-blue-600 hover:underline break-all">{note.quizlink}</a>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Assignment:&nbsp;
              <a href={note.assignmentlink} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">View</a>
            </p>

            <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <input
                type="file"
                accept="application/pdf"
                onChange={e => note.file = e.target.files[0]}
                className="w-full sm:flex-1 text-sm border border-gray-300 rounded-md px-2 py-1"
              />
              <button
                onClick={() => {
                  if (!note.file) return alert('Choose a PDF');
                  const fd = new FormData();
                  fd.append('file', note.file);
                  axios.post(
                    `http://localhost:5003/notes/upload/${userData.batch}/${name}/${encodeURIComponent(note.title)}/${encodeURIComponent(userData.name)}`,
                    fd
                  ).then(() => alert('Answer uploaded')).catch(err => console.error(err));
                }}
                className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition text-sm"
              >
                Upload Answer
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Bottom buttons: stacked on mobile, inline on sm+ */}
      <div className="mt-8 flex flex-col sm:flex-row sm:justify-start sm:space-x-4 space-y-4 sm:space-y-0">
        <button
          onClick={() => navigate(`/student/chat/group/${name}`)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          Group Chat
        </button>
        <button
          onClick={() => navigate(`/student/chat/admin/${name}`)}
          className="w-full sm:w-auto bg-gray-600 text-white px-4 py-2 rounded-md shadow hover:bg-gray-700 transition"
        >
          Chat with Admin
        </button>
      </div>
    </div>
  );
}
