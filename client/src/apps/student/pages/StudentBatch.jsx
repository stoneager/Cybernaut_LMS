import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentBatch() {
  const { batchId } = useParams();
  const [student, setStudent] = useState(null);
  const [batch, setBatch] = useState(null);
  const [notesMap, setNotesMap] = useState({});
  const [activeModule, setActiveModule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/auth/student/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(res.data);
      } catch (err) {
        console.error(err);
        navigate('/');
      }
    };
    fetchStudent();
  }, [navigate]);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await axios.get(`http://localhost:5003/student/batch/by-id/${batchId}`);
        setBatch(res.data);

        const token = localStorage.getItem('token');
        const allNotes = {};
        let latestModule = null;
        let maxOverallDay = -1;

        for (const adminObj of res.data.admins) {
          const moduleName = adminObj.module;
          const noteRes = await axios.get(`http://localhost:5003/notes/${batchId}/${moduleName}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const notes = Array.isArray(noteRes.data) ? noteRes.data : noteRes.data.notes || [];
          const maxDay = Math.max(...notes.map(note => note.day || 0));

          if (maxDay > maxOverallDay) {
            maxOverallDay = maxDay;
            latestModule = moduleName;
          }

          allNotes[moduleName] = {
            today: notes.filter(note => note.day === maxDay),
            others: notes.filter(note => note.day !== maxDay)
          };
        }

        setNotesMap(allNotes);
        if (latestModule) setActiveModule(latestModule);
      } catch (err) {
        console.error('Error loading batch or notes:', err);
      }
    };

    if (batchId) fetchBatch();
  }, [batchId]);

  const renderNoteCard = (note, student, batchId, module, large = false, index = 0) => {
    const isEven = index % 2 === 0;

    const viewAssignment = async () => {
      try {
        const res = await axios.get(`http://localhost:5002/assignment-question/${encodeURIComponent(batch.batchName)}/${encodeURIComponent(module)}/${encodeURIComponent(note.title)}`);
        if (res.data?.url) {
          window.open(res.data.url, '_blank');
        } else {
          alert("Assignment link not found");
        }
      } catch (err) {
        console.error("Error fetching assignment link:", err);
        alert("Failed to fetch assignment link");
      }
    };

    return (
      <div
        key={note._id}
        className={`bg-white border border-blue-100 rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-6 items-center transition hover:shadow-lg ${
          isEven ? 'md:flex-row' : 'md:flex-row-reverse'
        }`}
      >
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">{"Day "+note.day+" : "+note.title}</h4>

          <div className="mb-4 flex flex-wrap gap-3">
            <button
              onClick={() => window.open(note.meetlink, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition"
            >
              Join Meet
            </button>
            <button
              onClick={() => window.open(note.quizlink, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition"
            >
              Attempt Quiz
            </button>
            <button
              onClick={viewAssignment}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition"
            >
              View Assignment
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={e => note.file = e.target.files[0]}
              className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm"
            />
            <button
              onClick={() => {
                if (!note.file) return alert('Choose a PDF');
                const fd = new FormData();
                fd.append('file', note.file);
                axios.post(
                  `http://localhost:5002/notes/upload/${encodeURIComponent(batch.batchName)}/${module}/${encodeURIComponent(note.title)}/${encodeURIComponent(student.user.name)}/${student._id}/${note.day}`,
                  fd
                ).then(() => alert('Answer uploaded')).catch(console.error);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            >
              Upload Answer
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!student || !batch) {
    return <p className="text-center mt-6 text-gray-500">Loading...</p>;
  }

  const currentModuleNotes = notesMap[activeModule] || { today: [], others: [] };

  return (
    <div className="p-6 bg-[#f5f9ff] min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">
          My Batch: <span className="text-[#4086F4]">{batch.batchName}</span>
        </h2>
      </div>

      {/* Module Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(notesMap).map(module => (
          <button
            key={module}
            onClick={() => setActiveModule(module)}
            className={`px-4 py-2 rounded-full border font-medium ${
              module === activeModule
                ? 'bg-[#4086F4] text-white border-[#4086F4]'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'
            }`}
          >
            {module}
          </button>
        ))}
      </div>

      {/* Notes Section */}
      <div className="mb-10 flex flex-col gap-8">
        {currentModuleNotes.today.length === 0 && currentModuleNotes.others.length === 0 ? (
          <p className="text-gray-500 text-sm">No notes uploaded yet.</p>
        ) : (
          <>
            {activeModule === Object.entries(notesMap).reduce((acc, [mod, notes]) => {
  const maxDay = [...notes.today, ...notes.others].reduce((max, note) => Math.max(max, note.day || 0), -1);
  const accDay = [...(notesMap[acc]?.today || []), ...(notesMap[acc]?.others || [])].reduce((max, note) => Math.max(max, note.day || 0), -1);
  return maxDay > accDay ? mod : acc;
}, Object.keys(notesMap)[0]) ? (
  <>
    {currentModuleNotes.today.length > 0 && (
      <div className="flex flex-col gap-6">
        <h4 className="text-md font-semibold text-green-600 mb-3">Today's Notes</h4>
        {currentModuleNotes.today.map((note, index) => (
          renderNoteCard(note, student, batchId, activeModule, true, index)
        ))}
      </div>
    )}

    {currentModuleNotes.others.length > 0 && (
      <div className="flex flex-col gap-6 mt-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3">Previous Notes</h4>
        {currentModuleNotes.others.map((note, index) =>
          renderNoteCard(note, student, batchId, activeModule, false, index)
        )}
      </div>
    )}
  </>
) : (
  <div className="flex flex-col gap-6">
    <h4 className="text-md font-semibold text-gray-700 mb-3">Notes</h4>
    {[...currentModuleNotes.today, ...currentModuleNotes.others].map((note, index) =>
      renderNoteCard(note, student, batchId, activeModule, false, index)
    )}
  </div>
)}

          </>
        )}
      </div>
    </div>
  );
}