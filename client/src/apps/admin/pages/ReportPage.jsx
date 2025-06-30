import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import { useParams } from "react-router-dom";
import axios from "axios";


const ReportPage = () => {
  const { batchId } = useParams();
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("All");
  const [selectedModule, setSelectedModule] = useState("All");
  const [reports, setReports] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReports();
  }, [batchId]);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`http://localhost:5002/api/reports/batch/${batchId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports", err);
    }
  };

  const days = ["All", ...Array.from(new Set(reports.map((r) => `Day ${r.day}`)))];
  const moduleOptions = ["All", ...Array.from(new Set(reports.map((r) => r.module)))];

  const filtered = reports.filter((s) => {
    const studentName = s.student?.user?.name || "Unknown";
    const matchesName = studentName.toLowerCase().includes(search.toLowerCase());
    const matchesDay = selectedDay === "All" || `Day ${s.day}` === selectedDay;
    const matchesModule = selectedModule === "All" || s.module === selectedModule;

    return matchesName && matchesDay && matchesModule;
  });

  return (
      <div className="px-4">
      
      {/* Combined Search and Filters */}
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 mb-6 px-4">
  
  {/* Search */}
  <div className="relative w-full md:max-w-md">
    <input
      type="text"
      placeholder="Search Student"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full py-3 pl-12 pr-4 border rounded-full focus:outline-none shadow-sm text-gray-700"
    />
    <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
  </div>

  {/* Day Filter */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-semibold text-gray-700">Select Day:</label>
    <select
      value={selectedDay}
      onChange={(e) => setSelectedDay(e.target.value)}
      className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm"
    >
      {days.map((day) => (
        <option key={day} value={day}>{day}</option>
      ))}
    </select>
  </div>

  {/* Module Filter */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-semibold text-gray-700">Filter Module:</label>
    <select
      value={selectedModule}
      onChange={(e) => setSelectedModule(e.target.value)}
      className="border rounded-lg px-4 py-2 text-gray-700 shadow-sm"
    >
      {moduleOptions.map((module) => (
        <option key={module} value={module}>{module}</option>
      ))}
    </select>
  </div>
</div>

      {/* Legend */}
<div className="text-sm text-gray-600 text-center mb-4">
  <span className="font-semibold">Note:</span> 
  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold mx-2">NU</span> = Not Uploaded,&nbsp;
  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-semibold mx-2">NE</span> = Not Evaluated
</div>


{/* Table */}
<div className="overflow-x-auto">
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <table className="min-w-full text-sm text-gray-700">
      <thead className="bg-black text-white">
        <tr>
          <th className="p-4 text-left font-semibold">Student Name</th>
          <th className="p-4 text-left font-semibold">Module</th>
          <th className="p-4 text-left font-semibold">Day</th>
          <th className="p-4 text-left font-semibold">Quiz</th>
          <th className="p-4 text-left font-semibold">Coding</th>
          <th className="p-4 text-left font-semibold">Assignment</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length > 0 ? (
          filtered.map((s, idx) => {
            const studentName = s.student?.user?.name || "Unknown";
            const renderBadge = (val) => {
  if (val === -1) {
    return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">NE</span>;
  }
  if (val === -2) {
    return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-semibold">NU</span>;
  }
  return <span className="text-sm font-semibold">{val}</span>;
};
            
            return (
              <tr
                key={idx}
                className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}
              >
                <td className="p-4 font-medium">{studentName}</td>
                <td className="p-4 font-semibold">{s.module}</td>
                <td className="p-4">{`Day ${s.day}`}</td>
                <td className="p-4">{renderBadge(s.marksObtained?.[0] ?? 0)}</td>
<td className="p-4">{renderBadge(s.marksObtained?.[1] ?? 0)}</td>
<td className="p-4">{renderBadge(s.marksObtained?.[2] ?? 0)}</td>

              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="6" className="text-center py-6 text-gray-500">
              No matching records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

    </div>
  );
};

export default ReportPage;
