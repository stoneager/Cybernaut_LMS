import React, { useState, useEffect, useRef } from "react";
import { FaBook, FaClipboardCheck, FaFileAlt, FaComments, FaUser } from "react-icons/fa";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.JPG";
import API from "../api";
import axios from 'axios';


const AdminLayout = ({ children }) => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const logoutRef = useRef(null);
  const [batchInfo, setBatchInfo] = useState(null);
  const [showLogout, setShowLogout] = useState(false);

  const menuItems = [
    { id: "lesson-plan", label: "Lesson Plan", icon: <FaBook />, path: `/batch/${batchId}/lesson-plan` },
    { id: "evaluation", label: "Evaluation", icon: <FaClipboardCheck />, path: `/batch/${batchId}/evaluation` },
    { id: "report", label: "Report", icon: <FaFileAlt />, path: `/batch/${batchId}/report` },
    { id: "chat", label: "Chat", icon: <FaComments />, path: `/batch/${batchId}/chat` },
  ];

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        const res = await API.get(`/admin-batches/${batchId}`);
        setBatchInfo(res.data);
      } catch (err) {
        console.error("Error fetching batch details:", err);
      }
    };

    if (batchId) {
      fetchBatchDetails();
    }
  }, [batchId]);

const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // ✅ Redirect to full URL
    window.location.href = "http://localhost:3000/login";
  } catch (err) {
    console.error("Logout failed:", err);
  }
};



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoutRef.current && !logoutRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderBatchTitle = () => {
    if (!batchInfo) return "Loading...";
    const courseName = batchInfo?.course?.courseName || "Course";
    const batchName = batchInfo?.batchName || "Batch";
    const startDate = new Date(batchInfo?.startDate);
    const monthYear = startDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    return `${courseName} - ${monthYear} - ${batchName}`;
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 flex flex-col items-center">
          <img src={logo} alt="Logo" className="h-20 w-auto" />
          <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#13d8fb]">Cybernaut</h1>
        </div>

        <nav className="flex-1 mt-6 space-y-1">
          {menuItems.map(({ id, label, icon, path }) => (
            <NavLink
              key={id}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 w-full transition-colors duration-300 rounded-lg ${
                  isActive
                    ? "bg-gradient-to-r from-[#4086f4] via-[#00a3ff] to-[#12d8fa] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <div className="text-lg">{icon}</div>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-gradient-to-r from-[#00a3ff] via-[#12d8fa] to-[#13d8fb] text-white py-5 px-10 flex justify-between items-center shadow-md">
          <h2 className="font-semibold text-2xl tracking-wide">{renderBatchTitle()}</h2>

          <div className="relative" ref={logoutRef}>
            <button
              onClick={() => setShowLogout((prev) => !prev)}
              className="flex items-center gap-2 text-white text-sm font-semibold focus:outline-none"
            >
              <span>Admin</span>
              <FaUser size={24} />
            </button>

            {showLogout && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg text-gray-700 z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white rounded-md"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-10 bg-white flex-1 overflow-y-auto rounded-tr-3xl rounded-br-3xl shadow-inner">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
