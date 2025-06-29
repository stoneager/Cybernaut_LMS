import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';

const typeLabels = ['Coding', 'Quiz', 'Assignment'];

function NotesWidget({ studentId }) {
  const [missingNotes, setMissingNotes] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`http://localhost:5003/api/reports/${studentId}`);
        const reports = res.data || [];

        const missing = [];

        for (const report of reports) {
          report.marksObtained.forEach((mark, index) => {
            if (mark === -2) {
              missing.push({
                id: `${report._id}-${index}`,
                text: `Day ${report.day} - ${report.module} - ${typeLabels[index]} not submitted`
              });
            }
          });
        }

        setMissingNotes(missing);
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    if (studentId) fetchReports();
  }, [studentId]);

  const deleteNote = (id) => {
    setMissingNotes(missingNotes.filter((note) => note.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-md shadow max-w-sm mx-auto mt-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Reminders</h3>

      <ul className="space-y-3">
        {missingNotes.length === 0 ? (
          <li className="text-sm text-gray-400">No missing work 🎉</li>
        ) : (
          missingNotes.map((note) => (
            <li
              key={note.id}
              className="flex justify-between items-start p-3 border rounded-md bg-gray-50"
            >
              <span className="text-sm text-gray-800 break-words">{note.text}</span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-700 ml-2"
                title="Dismiss"
              >
                <FaTrash />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default NotesWidget;