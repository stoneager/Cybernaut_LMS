// Sidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaChalkboardTeacher, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Sidebar = ({ children }) => {
  const navigate = useNavigate();

 const handleLogout = async () => {
  const token = localStorage.getItem("token");

  try {
    await axios.post(
      "http://localhost:5000/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    localStorage.removeItem("token");
    toast.success("Logged out");
    window.location.href = "http://localhost:3000/login";
  } catch (error) {
    console.error("Logout failed:", error);
    // Even if logout fails, still force logout
    console.log("Login Failed");

  }
};


  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-800 text-white flex flex-col shadow-lg">
        <div className="text-2xl font-bold px-6 py-4 border-b border-gray-700">
          LMS Panel
        </div>
        <nav className="flex-1 px-4 py-4 space-y-4">
          <NavLink to="/" className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
          }>
            <FaHome className="mr-3" /> Home
          </NavLink>

          <NavLink to="/batches" className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
          }>
            <FaChalkboardTeacher className="mr-3" /> My Batches
          </NavLink>

          <NavLink to="/students" className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
          }>
            <FaUsers className="mr-3" /> My Students
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
          }>
            <FaCog className="mr-3" /> Settings
          </NavLink>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white w-full"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default Sidebar;
