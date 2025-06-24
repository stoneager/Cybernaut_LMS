import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaChalkboardTeacher,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaComments
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '' });

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("token");
      toast.success("Logged out");
      window.location.href = "http://localhost:3000/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5002/api/dashboard/lecturer", {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
      .then(res => {
        const { name, email } = res.data.stats;
        setProfile({ name, email });
      })
      .catch(err => {
        console.error("Sidebar profile fetch error:", err);
        setProfile({ name: 'Lecturer', email: 'user@example.com' }); // fallback
      });
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-72 bg-[#1e2b47] text-white flex flex-col shadow-lg">
        
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6 border-b border-[#2c3d61]">
          <FaUserCircle className="text-6xl text-gray-300" />
          <h2 className="text-lg font-semibold mt-3">{profile.name || 'Loading...'}</h2>
          <p className="text-sm text-gray-400">{profile.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-5 py-6 space-y-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition duration-200 ${
                isActive ? 'bg-[#324266]' : 'hover:bg-[#2a395c]'
              }`
            }
          >
            <FaHome /> Home
          </NavLink>

          <NavLink
            to="/batches"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition duration-200 ${
                isActive ? 'bg-[#324266]' : 'hover:bg-[#2a395c]'
              }`
            }
          >
            <FaChalkboardTeacher /> My Batches
          </NavLink>

          <NavLink
            to="/students"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition duration-200 ${
                isActive ? 'bg-[#324266]' : 'hover:bg-[#2a395c]'
              }`
            }
          >
            <FaUsers /> My Students
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition duration-200 ${
                isActive ? 'bg-[#324266]' : 'hover:bg-[#2a395c]'
              }`
            }
          >
            <FaCog /> Settings
          </NavLink>

          <NavLink
            to="/superadmin-chat"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition duration-200 ${
                isActive ? 'bg-[#324266]' : 'hover:bg-[#2a395c]'
              }`
            }
          >
            <FaComments /> SuperAdmin Chat
          </NavLink>
        </nav>

        {/* Logout Button */}
        <div className="px-5 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default Sidebar;
