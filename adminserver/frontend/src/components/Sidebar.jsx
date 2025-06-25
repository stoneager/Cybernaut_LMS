import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaChalkboardTeacher,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaComments,
  FaChevronDown,
  FaBook,
  FaClipboardCheck,
  FaFileAlt,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [showBatchSubmenu, setShowBatchSubmenu] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [manuallyToggled, setManuallyToggled] = useState(false);

  // Fetch profile once on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5002/api/dashboard/lecturer", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((res) => {
        const { name, email } = res.data.stats;
        setProfile({ name, email });
      })
      .catch((err) => {
        console.error("Sidebar profile fetch error:", err);
        setProfile({ name: "Lecturer", email: "user@example.com" });
      });
  }, []);

  // Detect batch route change
  useEffect(() => {
    const match = location.pathname.match(/^\/batch\/([^/]+)/);
    if (match) {
      setSelectedBatchId(match[1]);
      if (!manuallyToggled) setShowBatchSubmenu(true);
    } else {
      setSelectedBatchId(null);
      if (!manuallyToggled) setShowBatchSubmenu(false);
    }
  }, [location.pathname, manuallyToggled]);

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

  const toggleBatchSubmenu = () => {
    setManuallyToggled(true);
    setShowBatchSubmenu((prev) => !prev);
    if (!showBatchSubmenu && !selectedBatchId) {
      navigate("/batches");
    }
  };

return (
  <div className="flex h-screen bg-[#f4f7fa]">
    {/* Sidebar */}
    <div className="group flex flex-col shadow-xl transition-all duration-300 ease-in-out w-16 hover:w-72 bg-gradient-to-b from-[#1f2e49] to-[#293b5f] text-white relative overflow-hidden">

      {/* Profile */}
      <div className="flex flex-col items-center justify-center py-6 border-b border-blue-900 bg-[#1a253b] transition-all duration-300 ease-in-out">
        <FaUserCircle className="text-3xl group-hover:text-5xl text-gray-300" />
        <h2 className="text-[0px] group-hover:text-lg font-semibold mt-1 transition-all duration-300 ease-in-out">
          {profile.name}
        </h2>
        <p className="text-[0px] group-hover:text-xs text-gray-400 transition-all duration-300 ease-in-out">
          {profile.email}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 group-hover:px-5 py-6 space-y-2 text-sm font-medium transition-all">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition ${
              isActive ? "bg-[#395886]" : "hover:bg-[#2c3f64]"
            }`
          }
        >
          <FaHome className="text-base" />
          <span className="hidden group-hover:inline">Home</span>
        </NavLink>

        {/* Batches */}
        <div>
          <div
            onClick={toggleBatchSubmenu}
            className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-[#2c3f64] transition"
          >
            <FaChalkboardTeacher />
            <span className="hidden group-hover:inline">Batches</span>
            <FaChevronDown
              className={`ml-auto transition-transform ${
                showBatchSubmenu ? "rotate-180" : ""
              } hidden group-hover:inline`}
            />
          </div>

          {/* Subtopics if inside a batch */}
          {showBatchSubmenu && selectedBatchId && (
            <div className="ml-4 mt-2 border-l-2 border-blue-700 pl-2 space-y-1 text-sm text-blue-100 hidden group-hover:block">
              <NavLink
                to={`/batch/${selectedBatchId}/lesson-plan`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-1 rounded-md ${
                    isActive ? "bg-[#476da4]" : "hover:bg-[#3b578c]"
                  }`
                }
              >
                <FaBook className="text-sm" />
                <span>Lesson Plan</span>
              </NavLink>
              <NavLink
                to={`/batch/${selectedBatchId}/report`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-1 rounded-md ${
                    isActive ? "bg-[#476da4]" : "hover:bg-[#3b578c]"
                  }`
                }
              >
                <FaFileAlt className="text-sm" />
                <span>Report</span>
              </NavLink>
              <NavLink
                to={`/batch/${selectedBatchId}/evaluation`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-1 rounded-md ${
                    isActive ? "bg-[#476da4]" : "hover:bg-[#3b578c]"
                  }`
                }
              >
                <FaClipboardCheck className="text-sm" />
                <span>Evaluation</span>
              </NavLink>
              <NavLink
                to={`/batch/${selectedBatchId}/chat`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-1 rounded-md ${
                    isActive ? "bg-[#476da4]" : "hover:bg-[#3b578c]"
                  }`
                }
              >
                <FaComments className="text-sm" />
                <span>Chat</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Students */}
        <NavLink
          to="/students"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition ${
              isActive ? "bg-[#395886]" : "hover:bg-[#2c3f64]"
            }`
          }
        >
          <FaUsers />
          <span className="hidden group-hover:inline">My Students</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition ${
              isActive ? "bg-[#395886]" : "hover:bg-[#2c3f64]"
            }`
          }
        >
          <FaCog />
          <span className="hidden group-hover:inline">Settings</span>
        </NavLink>

        {/* SuperAdmin Chat */}
        <NavLink
          to="/superadmin-chat"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition ${
              isActive ? "bg-[#395886]" : "hover:bg-[#2c3f64]"
            }`
          }
        >
          <FaComments />
          <span className="hidden group-hover:inline">SuperAdmin Chat</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="px-2 group-hover:px-5 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center group-hover:justify-start gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition"
        >
          <FaSignOutAlt />
          <span className="hidden group-hover:inline">Logout</span>
        </button>
      </div>
    </div>

    {/* Main content */}
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6">{children}</div>
  </div>
);
}

export default Sidebar;
