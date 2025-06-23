import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import UserContext from '../context/UserContext';

export default function EvaluationPage() {
  const { batchName, title } = useParams();
  const { userData } = useContext(UserContext);
  const [submissions, setSubs] = useState([]);

  useEffect(() => {
     axios.get(`http://localhost:5002/evaluate/${batchName}/${userData.domain}/${encodeURIComponent(title)}`)
       .then(res => setSubs(res.data))
       .catch(console.error);
  }, [batchName, userData, title]);

  const markStudent = (student, value) => {
    axios.post('http://localhost:5002/mark', {
    batch: batchName,
    module: userData.domain,
    notetitle: title,
       student,
      mark: Number(value),
      type: 'assignment'
     }).then(() => {
      setSubs(prev => prev.filter(s => s.student !== student));
     }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        📋 Evaluation – {title}
      </h2>
      {submissions.length === 0
        ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl text-gray-600 font-medium">No submissions pending.</p>
          </div>
        )
        : (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900 flex items-center gap-2">
                      👤 Student
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">
                      📄 View Answer
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">
                      🏆 Enter Mark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, index) => (
                    <tr 
                      key={sub.student} 
                      className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          <span className="font-medium text-gray-900">{sub.student}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <a 
                          href={sub.answerLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                        >
                          <span>View PDF</span>
                          <div className="transform group-hover:translate-x-1 transition-transform duration-200">
                            🔗
                          </div>
                        </a>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
                            🎯
                          </div>
                          <input
                            type="number"
                            max={50}
                            min={0}
                            onBlur={e => markStudent(sub.student, e.target.value.trim())}
                            className="pl-10 pr-4 py-3 w-24 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white shadow-sm text-gray-900 font-medium transition-all duration-300 hover:shadow-md"
                            placeholder="0-50"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
