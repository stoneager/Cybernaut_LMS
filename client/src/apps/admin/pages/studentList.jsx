// 📁 src/pages/StudentList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from '../components/Sidebar';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudents();
  }, [search, selectedBatch]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5002/api/students/my-students", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          name: search,
          batchId: selectedBatch
        },
        withCredentials: true
      });

      setStudents(res.data.students || []);
      setBatchOptions(res.data.batchOptions || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  return (
    
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-blue-900">My Students</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by student name..."
            className="border px-4 py-2 rounded w-full md:w-1/3 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-4 py-2 rounded w-full md:w-1/3 shadow-sm"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">All Batches</option>
            {batchOptions.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.batchName}
              </option>
            ))}
          </select>
        </div>

        {students.length === 0 ? (
          <p className="text-gray-600 text-center mt-8">No students found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-blue-100 text-blue-900 text-left text-sm">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Batch</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-t hover:bg-gray-50 text-sm">
                    <td className="py-2 px-4">{student.name}</td>
                    <td className="py-2 px-4">{student.email}</td>
                    <td className="py-2 px-4">{student.phone}</td>
                    <td className="py-2 px-4">{student.batchName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    
  );
}
