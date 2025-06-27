import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function EvaluateSubmissions() {
  const { batch, module, title, day } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const backendBase = 'http://localhost:5002';

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${backendBase}/evaluate/${batch}/${module}/${title}/${day}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [batch, module, title, day]);

  const handleMarkChange = (studentId, value) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const handleEvaluate = async (studentId) => {
    const mark = parseInt(marks[studentId]);
    if (isNaN(mark) || mark < 0 || mark > 100) {
      alert("Please enter a valid mark between 0 and 100");
      return;
    }

    try {
      await axios.post(`${backendBase}/evaluate`, {
        studentId,
        module,
        day,
        mark
      });
      fetchSubmissions(); // Refresh list
    } catch (err) {
      console.error("Failed to submit evaluation:", err);
      alert("Error submitting marks.");
    }
  };

  if (loading) return <p className="text-center mt-8 text-gray-500">Loading submissions...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">
        Pending Assignment Evaluation – {decodeURIComponent(title)}
      </h2>

      {submissions.length === 0 ? (
        <p className="text-gray-600">No submissions found yet.</p>
      ) : (
        <table className="w-full table-auto border border-gray-300 shadow">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Student Name</th>
              <th className="p-3 border">Download Link</th>
              <th className="p-3 border">Marks</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, index) => (
              <tr key={index} className="text-sm">
                <td className="p-3 border text-center">{index + 1}</td>
                <td className="p-3 border">{sub.studentName}</td>
                <td className="p-3 border text-blue-600 hover:underline text-center">
                  <a href={sub.answerLink} target="_blank" rel="noopener noreferrer">
                    View PDF
                  </a>
                </td>
                <td className="p-3 border text-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 p-1 border rounded"
                    value={marks[sub.studentId] || ''}
                    onChange={(e) => handleMarkChange(sub.studentId, e.target.value)}
                  />
                </td>
                <td className="p-3 border text-center">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    onClick={() => handleEvaluate(sub.studentId)}
                  >
                    Evaluate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
