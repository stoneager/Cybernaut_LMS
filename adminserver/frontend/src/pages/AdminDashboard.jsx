import React, { useEffect, useState } from "react";
import FullStack from "../assets/FullStack.webp";
import DataAnalytics from "../assets/DataAnalytics.webp";
import TechTrio from "../assets/TechTrio.webp";
import axios from 'axios';
import Sidebar from '../components/Sidebar';
const courseImages = {
  "Full Stack Development": FullStack,
  "Tech Trio": TechTrio,
  "Data Science": DataAnalytics
};
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");
  useEffect(() => {
    axios.get("http://localhost:5002/api/dashboard/lecturer", {
  headers: {
    Authorization: `Bearer ${token}`
  },
  withCredentials: true
}).then(res => setData(res.data)).catch(err => console.error("Dashboard fetch error:", err));
  }, []);

  if (!data) return <div className="p-8">Loading dashboard...</div>;

  const { stats, batches } = data;

  return (
    <Sidebar>
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Welcome back, Dr. {stats.name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-md border">
          <p className="text-sm text-gray-500">My Courses</p>
          <p className="text-3xl font-bold text-blue-700">{stats.courseCount}</p>
          <p className="text-xs text-gray-400">{stats.batchCount} active batches</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-3xl font-bold text-blue-700">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border">
          <p className="text-sm text-gray-500">This Month Salary</p>
          <p className="text-3xl font-bold text-purple-700">
            ₹{stats.salaryAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">My Batches</h3>
          <ul>
            {batches.map((batch) => (
              <li key={batch._id} className="mb-2">
                <span className="font-medium text-gray-700">{batch.courseName}</span> - {batch.batchName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </Sidebar>
  );
}