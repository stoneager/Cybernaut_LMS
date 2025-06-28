// 📁 src/pages/AdminTopPerformers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminTopPerformers() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch batches the admin handles
  useEffect(() => {
    axios.get("http://localhost:5002/api/dashboard/lecturer", {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }).then(res => {
      const myBatches = res.data.batches;
      setBatches(myBatches);
      if (myBatches.length > 0) {
        setSelectedBatch(myBatches[0]._id);
        const firstModules = myBatches[0].modulesHandled || [];
        setModules(firstModules);
        setSelectedModule(firstModules[0] || "");
      }
    }).catch(err => {
      console.error("Failed to fetch admin batches", err);
    });
  }, []);

  // Update module list when batch changes
  useEffect(() => {
    const batch = batches.find(b => b._id === selectedBatch);
    const mods = batch?.modulesHandled || [];
    setModules(mods);
    if (!mods.includes(selectedModule)) {
      setSelectedModule(mods[0] || "");
    }
  }, [selectedBatch]);

  // Fetch leaderboard
  useEffect(() => {
    if (!selectedBatch || !selectedModule) return;

    axios.get("http://localhost:5002/statistics/admin-leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
      params: { batchId: selectedBatch, module: selectedModule },
      withCredentials: true
    }).then(res => {
      setLeaderboard(res.data);
    }).catch(err => {
      console.error("Leaderboard fetch error", err);
    });
  }, [selectedBatch, selectedModule]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Top Performers</h2>

      <div className="flex gap-4 mb-6">
        <select
          className="border px-4 py-2 rounded shadow-sm"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.batchName} ({b.courseName})
            </option>
          ))}
        </select>

        <select
          className="border px-4 py-2 rounded shadow-sm"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
        >
          {modules.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border max-w-xl">
        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-sm">No data available</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <li key={entry.rank} className="py-2 flex justify-between">
                <span className="text-gray-800 font-medium">
                  #{entry.rank} {entry.name}
                </span>
                <span className="text-blue-700 font-semibold">
                  {entry.avg} / 100
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
