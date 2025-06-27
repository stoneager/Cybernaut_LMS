import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentHome() {
  const [student, setStudent] = useState(null);
  const [batch, setBatch] = useState(null);
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

        const batchRes = await axios.get(`http://localhost:5003/student/batch/by-id/${res.data.batch}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBatch(batchRes.data);
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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-gray-800">Welcome Student {student.name}</h2>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/student/profile')}
            className="bg-gray-200 px-4 py-2 rounded-md shadow hover:bg-gray-300 transition"
          >
            Profile
          </button>
          <button
            onClick={logout}
            className="bg-purple-600 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {batch && (
        <div className="bg-white p-4 rounded-md shadow mb-6 cursor-pointer hover:bg-gray-100" onClick={() => navigate(`/student/batch/${batch._id}`)}>
          <h3 className="text-xl font-semibold text-gray-700">My Batch</h3>
          <p className="text-sm text-gray-600 mt-1">{batch.batchName} - {new Date(batch.startDate).toLocaleDateString()}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-md shadow flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
            <p className="text-xl font-semibold">4</p>
            <p className="text-xs text-gray-400">2 in progress</p>
          </div>
          <div className="text-blue-500 text-3xl">📚</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completed Assignments</p>
            <p className="text-xl font-semibold">23</p>
            <p className="text-xs text-gray-400">3 pending</p>
          </div>
          <div className="text-green-500 text-3xl">📄</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Live Sessions</p>
            <p className="text-xl font-semibold">18</p>
            <p className="text-xs text-gray-400">2 upcoming</p>
          </div>
          <div className="text-purple-500 text-3xl">🎥</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Overall Progress</p>
            <p className="text-xl font-semibold">78%</p>
            <p className="text-xs text-gray-400">+5% this week</p>
          </div>
          <div className="text-yellow-500 text-3xl">🏆</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button className="bg-purple-600 text-white py-3 rounded-md shadow hover:bg-purple-700 transition cursor-pointer">Continue Learning</button>
        <button className="bg-white border border-gray-300 py-3 rounded-md shadow hover:bg-gray-100 transition cursor-pointer">Submit Assignment</button>
        <button className="bg-white border border-gray-300 py-3 rounded-md shadow hover:bg-gray-100 transition cursor-pointer">Join Live Session</button>
        <button className="bg-white border border-gray-300 py-3 rounded-md shadow hover:bg-gray-100 transition cursor-pointer">Ask Question</button>
      </div>

      <div className="bg-white p-4 rounded-md shadow mt-6 grid grid-cols-2 md:grid-cols-4 text-center text-sm text-gray-600">
        <div>
          <p className="font-semibold text-lg text-blue-600">98%</p>
          <p>Attendance Rate</p>
        </div>
        <div>
          <p className="font-semibold text-lg text-green-600">A-</p>
          <p>Average Grade</p>
        </div>
        <div>
          <p className="font-semibold text-lg text-purple-600">23/26</p>
          <p>Assignments Done</p>
        </div>
        <div>
          <p className="font-semibold text-lg text-yellow-500">5</p>
          <p>Certificates Earned</p>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
