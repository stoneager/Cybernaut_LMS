import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaClipboardList, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedModule, setSelectedModule] = useState("All");
  const [selectedDay, setSelectedDay] = useState("All");

  const [selectedReport, setSelectedReport] = useState(null);
  const [quizDetail, setQuizDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");

        const profileRes = await axios.get("http://localhost:5000/auth/student/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const studentId = profileRes.data._id;

        const res = await axios.get(
          `http://localhost:5003/api/quizreports/quiz-attempts?studentId=${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReports(res.data);
        setFilteredReports(res.data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = [...reports];

    if (selectedModule !== "All") {
      filtered = filtered.filter((r) => r.module === selectedModule);
    }

    if (selectedDay !== "All") {
      filtered = filtered.filter((r) => r.day === parseInt(selectedDay));
    }

    setFilteredReports(filtered);
  }, [selectedModule, selectedDay, reports]);

  const openModal = async (noteId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5003/api/quizreports/quiz-detail/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedReport(noteId);
      setQuizDetail(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch quiz details:", err);
    }
  };

  const closeModal = () => {
    setSelectedReport(null);
    setQuizDetail(null);
    setModalOpen(false);
  };

  const uniqueModules = ["All", ...new Set(reports.map((r) => r.module))];
  const uniqueDays = ["All", ...new Set(reports.map((r) => r.day))];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <FaClipboardList /> Quiz Reports
      </h2>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded"
        >
          {uniqueModules.map((mod, idx) => (
            <option key={idx} value={mod}>
              Module: {mod}
            </option>
          ))}
        </select>

        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded"
        >
          {uniqueDays.map((d, idx) => (
            <option key={idx} value={d}>
              Day: {d}
            </option>
          ))}
        </select>
      </div>

      {filteredReports.length === 0 ? (
        <p className="text-gray-500">No reports found.</p>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report, index) => (
            <div
              key={index}
              className="border border-gray-200 p-4 rounded-md flex items-center justify-between bg-gray-50"
            >
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  Module: {report.module}
                </h3>
                <p className="text-sm text-gray-600">Day {report.day}</p>
              </div>
              <button
                onClick={() => openModal(report.noteId)}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && quizDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg p-6 relative">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">Quiz Review</h3>
            <p className="mb-2 text-gray-600 font-medium">
              Score: {quizDetail.score} / {quizDetail.total}
            </p>

            {quizDetail.detail.map((item, idx) => {
              const { question, options, selected, correct } = item;

              return (
                <div key={idx} className="border-b border-gray-200 py-4 space-y-2">
                  <p className="font-medium text-gray-800">
                    {idx + 1}. {question}
                  </p>
                  {["A", "B", "C", "D"].map((opt) => (
                    <div
                      key={opt}
                      className={`text-sm px-3 py-2 rounded border 
                        ${
                          selected === opt
                            ? opt === correct
                              ? "bg-green-100 border-green-500"
                              : "bg-red-100 border-red-500"
                            : opt === correct
                            ? "bg-green-50 border-green-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                    >
                      <strong>{opt}.</strong> {options[opt]}
                      {selected === opt && (
                        <span className="ml-2">
                          {opt === correct ? (
                            <FaCheckCircle className="inline text-green-600" />
                          ) : (
                            <FaTimesCircle className="inline text-red-600" />
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;
