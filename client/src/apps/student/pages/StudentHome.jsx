import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from "../widgets/CalendarWidget";
import NotesWidget from '../widgets/NotesWidget';
import CourseProgressWidget from '../widgets/CourseProgressWidget';

function StudentHome() {
  const [student, setStudent] = useState(null);
  const [date, setDate] = useState(new Date());
  const [latestNote, setLatestNote] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        const res = await axios.get('http://localhost:5000/auth/student/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(res.data);
      } catch {
        alert('Failed to load student');
        navigate('/');
      }
    };

    fetchStudentData();
  }, [navigate]);

useEffect(() => {
  const fetchLatestNote = async () => {
    try {
      if (!student?.batch) return;
      const token = localStorage.getItem('token');

      // Step 1: Fetch full batch data
      const batchRes = await axios.get(`http://localhost:5003/student/batch/by-id/${student.batch}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const batch = batchRes.data;
      let latest = null;
      let maxDay = -1;

      // Step 2: Loop over all module-admin pairs
      for (const adminObj of batch.admins || []) {
        const moduleName = adminObj.module;

        const notesRes = await axios.get(`http://localhost:5003/notes/${batch._id}/${moduleName}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const notes = Array.isArray(notesRes.data) ? notesRes.data : notesRes.data.notes || [];
        const latestModuleNote = notes.reduce((acc, note) => {
          if ((note.day || 0) > (acc?.day || 0)) return note;
          return acc;
        }, null);

        if (latestModuleNote && latestModuleNote.day > maxDay) {
          latest = latestModuleNote;
          maxDay = latestModuleNote.day;
        }
      }

      setLatestNote(latest);
    } catch (err) {
      console.error("Error fetching latest note:", err);
    }
  };

  fetchLatestNote();
}, [student]);


  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!student) return <p className="text-center mt-6 text-gray-500">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-gray-800">
          Welcome back {student.name}
        </h2>
        <button
          onClick={logout}
          className="bg-purple-600 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full md:w-3/5">
          <CourseProgressWidget progress={72} />

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white border shadow-sm rounded-lg p-4 flex flex-col items-center text-center">
              <span className="text-xl font-bold text-blue-600">3</span>
              <p className="text-sm text-gray-600 mt-1">Assignments Pending</p>
            </div>
            <div className="bg-white border shadow-sm rounded-lg p-4 flex flex-col items-center text-center">
              <span className="text-xl font-bold text-yellow-600">2</span>
              <p className="text-sm text-gray-600 mt-1">Quizzes Pending</p>
            </div>
            <div className="bg-white border shadow-sm rounded-lg p-4 flex flex-col items-center text-center">
              <span className="text-xl font-bold text-yellow-600">2</span>
              <p className="text-sm text-gray-600 mt-1">Code Pending</p>
            </div>
          </div>

          {/* Latest Note Widget */}
          {latestNote && (
            <div className="mt-6 bg-white border shadow-sm rounded-lg p-5 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-md font-semibold text-gray-800">
                  Latest Note - Day {latestNote.day}
                </h3>
              </div>
              <p className="text-sm text-gray-700 font-medium">{latestNote.title}</p>
              <div className="flex gap-3 mt-3">
                <a
                  href={latestNote.meetlink}
                  target="_blank"
                  rel="noreferrer"
className="text-xs px-3 py-1 bg-black text-white rounded hover:bg-gray-700 transition-colors duration-200"
                >
                  Join Meet
                </a>
                <a
                  href={latestNote.quizlink}
                  target="_blank"
                  rel="noreferrer"
className="text-xs px-3 py-1 bg-black text-white rounded hover:bg-gray-700 transition-colors duration-200"
                >
                  Attempt Quiz
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full md:w-2/5 space-y-6">
          <CalendarWidget date={date} setDate={setDate} />
          <NotesWidget />
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
