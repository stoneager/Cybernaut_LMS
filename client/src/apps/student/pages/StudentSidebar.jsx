import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaComments,
  FaSignOutAlt,
  FaUserCircle,
  FaChalkboardTeacher,
  FaCog,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const StudentSidebar = ({ children }) => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  
  // Fetch student & batch data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/");

        const res = await axios.get("http://localhost:5000/auth/student/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const batchRes = await axios.get(
          `http://localhost:5003/student/batch/by-id/${res.data.batch}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBatch(batchRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch student/batch info", error);
        toast.error("Unable to load student data");
        navigate("/");
      }
    };

    fetchStudentData();
  }, [navigate]);

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
      window.location.href = "http://localhost:5173";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading sidebar...</div>;
  }

  return (
     <div className="flex h-screen bg-[#f4f7fa]">
      {/* Static Sidebar with white background and shadows */}
      <div className="flex flex-col shadow-lg w-72 bg-white text-gray-800">
        {/* Profile Section */}
        <div className="flex flex-col items-center justify-center py-6 border-b border-gray-200 bg-white">
          <FaUserCircle className="text-5xl text-gray-500" />
          <h2 className="text-lg font-semibold mt-1">{profile.name}</h2>
          <p className="text-xs text-gray-500">{profile.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-5 py-6 space-y-2 text-sm font-medium">
          {/* Dashboard */}
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                isActive
                  ? 'bg-[#4086F4] text-white'
                  : 'hover:bg-[#e3edfd] text-gray-800'
              }`
            }
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          {/* Chat */}
          {batch && batch._id && (
            <NavLink
              to={`/student/chat?type=forum&batch=${batch._id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                  isActive
                    ? 'bg-[#4086F4] text-white'
                    : 'hover:bg-[#e3edfd] text-gray-800'
                }`
              }
            >
              <FaComments />
              <span>Chat</span>
            </NavLink>
          )}

          {/* My Course */}
          {batch && batch._id && (
            <NavLink
              to={`/student/batch/${batch._id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                  isActive
                    ? 'bg-[#4086F4] text-white'
                    : 'hover:bg-[#e3edfd] text-gray-800'
                }`
              }
            >
              <FaChalkboardTeacher />
              <span>My Course</span>
            </NavLink>
          )}

          <NavLink
              to="/student/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                  isActive
                    ? 'bg-[#4086F4] text-white'
                    : 'hover:bg-[#e3edfd] text-gray-800'
                }`
              }
            >
              <FaCog />
              <span>Settings</span>
            </NavLink>
        </nav>

        {/* Logout */}
        <div className="px-5 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6">{children}</div>
    </div>
  );
};

export default StudentSidebar;
