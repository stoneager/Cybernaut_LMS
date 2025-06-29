import React, { useEffect, useState } from "react";
import axios from "axios";


export default function AdminLeaderboard() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const token = localStorage.getItem("token");
  const defaultProfile = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
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

  useEffect(() => {
    const batch = batches.find(b => b._id === selectedBatch);
    const mods = batch?.modulesHandled || [];
    setModules(mods);
    if (!mods.includes(selectedModule)) {
      setSelectedModule(mods[0] || "");
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (!selectedBatch || !selectedModule) return;

    axios.get("http://localhost:5002/statistics/leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
      params: { batchId: selectedBatch, module: selectedModule },
      withCredentials: true
    }).then(res => {
      setLeaderboard(res.data);
    }).catch(err => {
      console.error("Leaderboard fetch error", err);
    });
  }, [selectedBatch, selectedModule]);

  const podium = [leaderboard[1], leaderboard[0], leaderboard[2]]; // 1st is taller center

  return (
    <div className="bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Top Performers</h2>

      <div className="flex gap-4 mb-8">
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

      {/* 🏆 Podium Style Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="flex justify-center items-end gap-10 h-64 mb-10">
          {podium.map((stu, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-end w-28 
                ${
                  idx === 1 ? "h-56" : idx === 0 ? "h-40" : "h-32"
                } bg-gradient-to-t from-blue-300 to-blue-100 rounded-xl shadow p-2`}
            >
              {stu ? (
                <>
                  <img
                    src={defaultProfile}
                    className="w-12 h-12 rounded-full mb-1 border border-white shadow"
                    alt="profile"
                  />
                  <p className="text-sm font-semibold text-center">{stu.name}</p>
                  <p className="text-cyan-700 font-bold text-lg">{stu.avg}</p>
                  <span className="text-xs text-gray-600">
                    #{idx === 1 ? 1 : idx === 0 ? 2 : 3}
                  </span>
                </>
              ) : (
                <div className="text-gray-400 text-sm mt-auto">--</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🔽 Full List (Optional fallback) */}
      {leaderboard.length === 0 ? (
        <p className="text-gray-500 text-sm">No data available</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow border w-full mx-auto">
          <ul className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <li key={entry.rank} className="py-2 flex justify-between">
                <span className="text-gray-800 font-medium">
                  #{entry.rank} {entry.name}
                </span>
                <span className="text-blue-700 font-semibold">
                  {entry.avg}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
