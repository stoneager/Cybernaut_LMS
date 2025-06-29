import React, { useEffect, useState } from "react";
import FullStack from "../assets/FullStack.webp";
import DataAnalytics from "../assets/DataAnalytics.webp";
import TechTrio from "../assets/TechTrio.webp";
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const courseImages = {
  "Full Stack Development": FullStack,
  "Tech Trio": TechTrio,
  "Data Science": DataAnalytics
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [assignmentStats, setAssignmentStats] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [availableModules, setAvailableModules] = useState([]);
  const [selectedType, setSelectedType] = useState("Assignment"); // New

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5002/api/dashboard/lecturer", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    }).then(res => {
      setData(res.data);
      if (res.data.batches.length > 0) {
        setSelectedBatchId(res.data.batches[0]._id);
      }
    }).catch(err => console.error("Dashboard fetch error:", err));
  }, []);


useEffect(() => {
  if (!data) return; // ✅ wait until data is available

  if (selectedBatchId && data.batches.length > 0) {
    const batch = data.batches.find((b) => b._id === selectedBatchId);
    const modules = batch?.modulesHandled || [];
    setAvailableModules(modules);

    if (!modules.includes(selectedModule)) {
      setSelectedModule(modules[0] || null);
    }
  }
}, [selectedBatchId, data, selectedModule]);


// Update fetch effect
useEffect(() => {
  if (selectedBatchId && selectedModule && selectedType) {
    axios.get(`http://localhost:5002/statistics/marks?batchId=${selectedBatchId}&module=${selectedModule}&type=${selectedType}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }).then(res => {
      setAssignmentStats(res.data);
    }).catch(err => {
      console.error("Error fetching assignment stats:", err);
    });
  }
}, [selectedBatchId, selectedModule, selectedType]);



  if (!data) return <div className="p-8">Loading dashboard...</div>;

const { stats, batches } = data;


  return (
    <div className="p-4 bg-gray-50 h-[85vh] flex-1">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Welcome back, Dr. {stats.name}</h2>

      {/* Quick Stats */}
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
        <div className="bg-white p-4 rounded-xl shadow-md border">
          <p className="text-sm text-gray-500">Last Paid Month</p>
          <p className="text-3xl font-bold text-purple-700">
            {new Date(0, stats.paidForMonth).toLocaleString("default", { month: "long" })}
          </p>
        </div>
      </div>


      {/* Batch Details */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

  {/* Chart - spans 2 columns on large screens */}
  <div className="bg-white p-6 rounded-xl shadow-md border lg:col-span-2">
    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-900">Submission Stats</h3>

      <div className="flex gap-3">
        {/* Batch Selector */}
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {batches.map((batch) => (
            <option key={batch._id} value={batch._id}>
              {batch.batchName} ({batch.courseName})
            </option>
          ))}
        </select>

        {/* Module Selector */}
        {availableModules.length > 1 && (
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            {availableModules.map((mod, i) => (
              <option key={i} value={mod}>{mod}</option>
            ))}
          </select>
        )}

        {/* Type Selector */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="Assignment">Assignment</option>
          <option value="Coding">Coding</option>
          <option value="Quiz">Quiz</option>
        </select>
      </div>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={assignmentStats}
        barCategoryGap={assignmentStats.length < 10 ? "30%" : "10%"}
      >
        <XAxis dataKey="day" label={{ value: "Day", position: "insideBottomRight", offset: -5 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="count" fill="#6366F1" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* My Batches - sits right */}
  <div className="bg-white p-6 rounded-xl shadow-md border">
    <h3 className="text-lg font-semibold text-blue-900 mb-4">My Batches</h3>
    <ul className="space-y-4">
  {batches.map((batch) => (
    <li
      key={batch._id}
      className="rounded-xl border-l-4 border-blue-500 bg-gray-50 hover:bg-blue-50 transition-all duration-200 shadow-sm p-4"
    >
      <div className="text-lg font-semibold text-blue-800">
        {batch.courseName} - {batch.batchName}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        <span className="font-medium text-gray-700">Modules:</span>{" "}
        <span className="text-gray-800">
          {Array.isArray(batch.modulesHandled) && batch.modulesHandled.length > 0
            ? batch.modulesHandled.join(", ")
            : "None"}
        </span>
      </div>
    </li>
  ))}
</ul>

  </div>
</div>
    </div>
  );
}
