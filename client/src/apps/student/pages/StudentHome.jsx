import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from "../widgets/CalendarWidget";
import NotesWidget from '../widgets/NotesWidget';
import CourseProgressWidget from '../widgets/CourseProgressWidget';

function StudentHome() {
  const [student, setStudent] = useState(null);
  const [date, setDate] = useState(new Date());
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

      {/* Main content: Course Progress on left, Calendar + Notes on right */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Progress Widget */}
          <div className="w-full md:w-3/5">
            <CourseProgressWidget progress={72} />

            {/* Summary Widgets */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white border shadow-sm rounded-lg p-4 flex flex-col items-center text-center">
                <span className="text-xl font-bold text-blue-600">3</span>
                <p className="text-sm text-gray-600 mt-1">Assignments Pending</p>
              </div>
              <div className="bg-white border shadow-sm rounded-lg p-4 flex flex-col items-center text-center">
                <span className="text-xl font-bold text-yellow-600">2</span>
                <p className="text-sm text-gray-600 mt-1">Quizzes Pending</p>
              </div>
            </div>
          </div>


        {/* Right: Calendar + Notes */}
        <div className="w-full md:w-2/5 space-y-6">
          <CalendarWidget date={date} setDate={setDate} />
          <NotesWidget />
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
