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
    console.log("Loading");
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/auth/student/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(res.data);
        console.log("Gotcha : "+res.data);
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

  const renderNoteCard = (note, student, batchId, module, large = false) => (
    <div
      key={note._id}
      className={`bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col ${large ? 'lg:col-span-3' : ''}`}
    >
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
              `http://localhost:5003/notes/upload/${batchId}/${module}/${encodeURIComponent(note.title)}/${encodeURIComponent(student.name)}`,
              fd
            ).then(() => alert('Answer uploaded')).catch(console.error);
          }}
          className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition text-sm"
        >
          Upload Answer
        </button>
      </div>
    </div>
  );

  if (!student || !batch) {
  return <p className="text-center text-gray-500 mt-6">Loading...</p>;
}

// ✅ If there are no notes at all, show default UI with no activeModule
const noNotesAvailable = Object.keys(notesMap).length > 0 && !activeModule;


  const currentModuleNotes = notesMap[activeModule] || { today: [], others: [] };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          My Batch: <span className="text-purple-600">{batch.batchName}</span>
        </h2>
        <button
          onClick={() => navigate('/student/profile')}
          className="bg-gray-200 px-4 py-2 rounded-md shadow hover:bg-gray-300 transition"
        >
          Profile
        </button>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(notesMap).map(module => (
          <button
            key={module}
            onClick={() => setActiveModule(module)}
            className={`px-4 py-2 rounded-full border ${
              module === activeModule ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
            }`}
          >
            {module}
          </button>
        ))}
      </div>

      {/* Chat Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => navigate(`/student/chat?type=forum&batch=${batch._id}&module=${encodeURIComponent(activeModule)}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          Chat 
        </button>
        
      </div>

      {/* Notes for active module only */}
      {/* Notes Section */}
{noNotesAvailable ? (
  <div className="mb-8">
    {Object.keys(notesMap).map(module => (
      <div key={module} className="mb-6">
        <h3 className="text-xl font-semibold text-purple-700 mb-2">{module}</h3>
        <p className="text-sm text-gray-500">No notes yet.</p>
      </div>
    ))}
  </div>
) : (
  <div key={activeModule} className="mb-8">
    <h3 className="text-xl font-semibold mb-3 text-purple-700">{activeModule}</h3>

    {currentModuleNotes.today.length === 0 && currentModuleNotes.others.length === 0 ? (
      <p className="text-gray-500 text-sm">No notes uploaded.</p>
    ) : (
      <>
        {currentModuleNotes.today.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-semibold text-green-600 mb-2">Today's Notes</h4>
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
            <h4 className="text-md font-semibold text-gray-600 mb-2">Previous Notes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentModuleNotes.others.map(note =>
                renderNoteCard(note, student, batchId, activeModule)
              )}
            </div>
          </div>
        )}
      </>
    )}
  </div>
)}

    </div>
  );
}
