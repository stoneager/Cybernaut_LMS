import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../api";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EvaluationPage = () => {
  const { batchId } = useParams();
  const [data, setData] = useState([]);
  const [day, setDay] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await API.get(`/evaluation/${batchId}/${day}`);
      const modifiedData = res.data.map(item => ({
        ...item,
        submissionLink: "https://example.com/dummy.pdf"  // dummy PDF link for now
      }));
      setData(modifiedData);
      setHasChanges(false);  // reset when day changes
    };
    if (batchId) fetchData();
  }, [batchId, day]);

  const handleMarkChange = (index, value) => {
    const updated = [...data];
    if (value === '' || (/^\d+$/.test(value) && value >= 0 && value <= 10)) {
      updated[index].marks = value;
      setData(updated);
      setHasChanges(true);
    }
  };

  const handleBulkUpdate = async () => {
    const updates = data
      .filter(item => item.marks !== "--" && item.marks !== "")
      .map(item => ({
        studentId: item.studentId,
        marks: parseInt(item.marks),
      }));

    await API.post("/evaluation/bulk-update", { day, updates });
    setHasChanges(false);
    toast.success("Marks updated successfully!");
  };

  return (
    <AdminLayout>
      <h2 className="text-xl font-bold mb-6">Evaluation - Day {day}</h2>

      <div className="mb-6 flex justify-between">
        <div>
          <label className="mr-2 font-semibold">Select Day: </label>
          <select value={day} onChange={(e) => setDay(parseInt(e.target.value))}>
            {[1, 2, 3, 4, 5].map(d => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>
        {hasChanges && (
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded"
            onClick={handleBulkUpdate}
          >
            Update All Changes
          </button>
        )}
      </div>

      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">Student Name</th>
            <th className="px-6 py-3 text-left">Submission</th>
            <th className="px-6 py-3 text-left">Marks</th>
          </tr>
        </thead>
        <tbody>
          {data.map((student, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-6 py-4">{student.name}</td>
              <td className="px-6 py-4 text-blue-600 underline">
                <a href={student.submissionLink} target="_blank" rel="noopener noreferrer">
                  View PDF
                </a>
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={student.marks === "--" ? "" : student.marks}
                  onChange={(e) => handleMarkChange(idx, e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                  placeholder="--"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default EvaluationPage;
