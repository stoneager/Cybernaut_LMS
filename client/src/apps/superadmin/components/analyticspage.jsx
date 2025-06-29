import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAdmins: 0,
    courses: {},
    adminSpecializations: {},
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const profilePic = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    axios.get("http://localhost:5001/api/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("Stats fetch error:", err));

    axios.get("http://localhost:5001/api/courses/names")
      .then(res => {
        setCourses(res.data);
        if (res.data.length > 0) setCourse(res.data[0]);
      })
      .catch(err => console.error("Course fetch error:", err));
  }, []);

  useEffect(() => {
    if (!course) return;
    axios.get(`http://localhost:5001/api/tests/top/${course}`)
      .then(res => {
        const formatted = res.data.map(item => ({
          studentName: item.studentName,
          quizAvg: item.quizAvg,
          assignmentAvg: item.assignAvg,
          codeAvg: item.codeAvg,
          totalAvg: item.totalAvg
        }));
        setLeaderboard(formatted);
        console.log(formatted);
      })
      .catch(err => console.error("Leaderboard fetch error:", err));
  }, [course]);

  const courseData = {
    labels: Object.keys(stats.courses),
    datasets: [{
      data: Object.values(stats.courses),
      backgroundColor: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'],
    }]
  };

  const adminData = {
    labels: Object.keys(stats.adminSpecializations),
    datasets: [{
      data: Object.values(stats.adminSpecializations),
      backgroundColor: ['#0EA5E9', '#38BDF8', '#7DD3FC', '#E0F2FE'],
    }]
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          color: '#1E293B',
        }
      }
    }
  };

  // Ensure at least 3 slots in podium
  const top3 = [
    leaderboard[1] || null,
    leaderboard[0] || null,
    leaderboard[2] || null
  ];

  const others = leaderboard.slice(3);

  return (
    <div className="ml-2 p-2 bg-gradient-to-br from-blue-50 to-white min-h-screen text-black">

      <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Leaderboard</h2>

      {/* Course Selector */}
      <div className="flex justify-center gap-4 mb-8">
        {courses.map(c => (
          <button
            key={c}
            onClick={() => setCourse(c)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              course === c ? "bg-cyan-500 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Olympic Podium */}
{leaderboard.length > 0 && (
  <div className="flex justify-center items-end gap-10 h-64 mb-10">
    {top3.map((stu, idx) => (
      <div
        key={idx}
        className={`flex flex-col items-center justify-end ${
          idx === 1 ? 'h-56' : idx === 0 ? 'h-40' : 'h-32'
        } w-24 bg-gradient-to-t from-blue-300 to-blue-100 rounded-xl shadow-md p-2`}
      >
        {stu ? (
          <>
            <img src={profilePic} className="w-12 h-12 rounded-full mb-1" alt="profile" />
            <p className="text-sm font-semibold text-center">{stu.studentName}</p>
            <p className="text-cyan-700 font-bold text-lg">{stu.totalAvg.toFixed(2)}</p>
            <span className="text-xs text-gray-500">#{idx === 1 ? 1 : idx === 0 ? 2 : 3}</span>
          </>
        ) : (
          <div className="text-gray-400 text-sm mt-auto">--</div>
        )}
      </div>
    ))}
  </div>
)}


      {/* Remaining Students */}
      <div className="max-w-xl mx-auto">
        {others.map((stu, idx) => (
          <div key={idx} className="flex items-center bg-blue-100 rounded-lg px-4 py-2 mb-2 shadow-sm">
            <div className="text-lg font-bold text-blue-700 w-6">{idx + 4}</div>
            <img src={profilePic} className="w-8 h-8 rounded-full mr-3" alt="Profile" />
            <div className="flex-grow">{stu.studentName}</div>
            <div className="font-bold text-cyan-500">{stu.totalAvg.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-blue-900">Total Students</h3>
          <p className="text-5xl font-bold text-blue-700 mt-2">{stats.totalStudents}</p>
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-blue-900">Total Admins</h3>
          <p className="text-5xl font-bold text-blue-700 mt-2">{stats.totalLecturers}</p>
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-blue-900">Total Courses</h3>
          <p className="text-5xl font-bold text-blue-700 mt-2">{stats.totalCourses}</p>
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-blue-900">Total Batches</h3>
          <p className="text-5xl font-bold text-blue-700 mt-2">{stats.totalBatches}</p>
        </div>
      </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
  <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center">Courses Opted</h3>
    <div className="w-full h-80 flex items-center justify-center">  {/* Reduced height here */}
      <Pie data={courseData} options={chartOptions} />
    </div>
  </div>

  <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center">Admin Specializations</h3>
    <div className="w-full h-80 flex items-center justify-center">  {/* Reduced height here */}
      <Pie data={adminData} options={chartOptions} />
    </div>
  </div>
</div>


      
    </div>
  );
}
