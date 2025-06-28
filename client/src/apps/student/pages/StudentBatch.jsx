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

 const renderNoteCard = (note, student, batchId, module, large = false) => {
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
      className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4 transition hover:shadow-md ${large ? 'lg:col-span-3' : 'lg:col-span-1'}`}
    >
      <h4 className="text-xl font-semibold text-gray-900 mb-3">Day {note.day} : {note.title}</h4>

      {/* Meet & Quiz */}
      <div className="flex gap-9">
        <a
          href={note.meetlink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center px-3 py-1 bg-black text-white text-xs rounded-md hover:opacity-90"
        >
          Join Meet
        </a>
        <a
          href={note.quizlink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center px-3 py-1 bg-black text-white text-xs rounded-md hover:opacity-90"
        >
          Attempt Quiz
        </a>
      </div>

      {/* Bottom actions: View Assignment + Upload PDF + Upload Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* View Assignment */}
        <button
          onClick={viewAssignment}
          className="px-3 py-2 bg-gray-800 text-white text-xs rounded-md hover:opacity-90 whitespace-nowrap"
        >
          View Assignment
        </button>

        {/* PDF Input */}
        <input
          type="file"
          accept="application/pdf"
          onChange={e => note.file = e.target.files[0]}
          className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm"
        />

        {/* Upload Icon */}
        <button
          onClick={() => {
            if (!note.file) return alert('Choose a PDF');
            const fd = new FormData();
            fd.append('file', note.file);
            axios.post(
              `http://localhost:5002/notes/upload/${encodeURIComponent(batch.batchName)}/${module}/${encodeURIComponent(note.title)}/${encodeURIComponent(student.user.name)}`,
              fd
            ).then(() => alert('Answer uploaded')).catch(console.error);
          }}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          title="Upload"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </button>
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

      <div className="mb-10">
        {currentModuleNotes.today.length === 0 && currentModuleNotes.others.length === 0 ? (
          <p className="text-gray-500 text-sm">No notes uploaded yet.</p>
        ) : (
          <>
            {currentModuleNotes.today.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-green-600 mb-3">Today's Notes</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {currentModuleNotes.today.map(note => (
                    <div key={note._id} className="col-span-1 lg:col-span-3">
                      {renderNoteCard(note, student, batchId, activeModule, true)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentModuleNotes.others.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">Previous Notes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                  {currentModuleNotes.others.map(note => (
                    <div key={note._id}>
                      {renderNoteCard(note, student, batchId, activeModule)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
