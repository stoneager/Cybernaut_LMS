import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentHome() {
  const { userData, setUserData } = useContext({});
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get(`http://localhost:5003/student/modules/${userData.course_type}`);
        setModules(res.data.modules);
      } catch {
        alert('Failed to load modules');
      }
    };
    fetchModules();
  }, [userData]);

  const logout = () => {
    localStorage.clear();
    setUserData(null);
    navigate('/');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-gray-800">Welcome Student {userData?.name}</h2>

        {/* Top Action Buttons - Aligned right */}
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

      {/* Module Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {modules.map((mod, i) => (
          <button
            key={i}
            onClick={() => navigate(`/student/module/${mod}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
          >
            {mod}
          </button>
        ))}
      </div>

      {/* Top Summary Cards */}
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

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button className="bg-purple-600 text-white py-3 rounded-md shadow hover:bg-purple-700 transition cursor-pointer">Continue Learning</button>
        <button className="bg-white border border-gray-300 py-3 rounded-md shadow hover:bg-gray-100 transition cursor-pointer">Submit Assignment</button>
        <button className="bg-white border border-gray-300 py-3 rounded-md shadow hover:bg-gray-100 transition cursor-pointer">Join Live Session</button>
        <button className="bg-white border border-gray-300 py-3 rounded-md shadow hover:bg-gray-100 transition cursor-pointer">Ask Question</button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Courses Section */}
        <div className="lg:col-span-2 bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Current Courses</h2>
          {/* Each course card */}
          {[
            { title: "React Advanced", instructor: "Dr. John Smith", progress: 75, time: "Today 10:00 AM" },
            { title: "Node.js Basics", instructor: "Dr. Sarah Wilson", progress: 60, time: "Tomorrow 2:00 PM" },
            { title: "Database Design", instructor: "Dr. Mike Johnson", progress: 90, time: "Fri 11:00 AM" },
            { title: "Python Programming", instructor: "Dr. Emily Davis", progress: 100, time: "Completed" },
          ].map((course, idx) => (
            <div key={idx} className="mb-4 border border-gray-200 rounded-md p-3">
              <p className="font-semibold">{course.title}</p>
              <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
              <p className="text-xs text-gray-500">Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
              </div>
              <p className="text-xs text-blue-600 mt-1">{course.time}</p>
            </div>
          ))}
        </div>

        {/* Upcoming Deadlines Section */}
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Upcoming Deadlines</h2>
          {[
            { title: "React Component Assignment", course: "React Advanced", due: "Due Today", priority: "High", color: "red" },
            { title: "Database Schema Design", course: "Database Design", due: "Due Tomorrow", priority: "Medium", color: "orange" },
            { title: "Node.js Project", course: "Node.js Basics", due: "Due in 3 days", priority: "Low", color: "green" },
            { title: "Final Quiz", course: "Python Programming", due: "Due in 1 week", priority: "Medium", color: "orange" },
          ].map((task, idx) => (
            <div
              key={idx}
              className={`mb-3 p-3 rounded-md flex justify-between items-center bg-${task.color}-100 text-${task.color}-700`}
            >
              <div>
                <p className="font-semibold text-sm">{task.title}</p>
                <p className="text-xs">{task.course}</p>
              </div>
              <div className="text-right text-xs">
                <p>{task.due}</p>
                <p className="capitalize">{task.priority}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Progress Overview */}
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
