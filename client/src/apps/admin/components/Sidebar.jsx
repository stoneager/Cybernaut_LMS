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
import Topbar from "./Topbar";

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
        navigate("/admin/")
      })
      .catch((err) => {
        console.error("Sidebar profile fetch error:", err);
        setProfile({ name: "Lecturer", email: "user@example.com" });
      });
  }, []);

  // Detect batch route change
  useEffect(() => {
    const match = location.pathname.match(/^\/admin\/batch\/([^/]+)/);

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
      window.location.href = "http://localhost:5173";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleBatchSubmenu = () => {
    setManuallyToggled(true);
    setShowBatchSubmenu((prev) => !prev);
    if (!showBatchSubmenu && !selectedBatchId) {
      navigate("/admin/batches");
    }
  };

  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin/" || path === "/admin") return "Dashboard";
    if (path === "/admin/batches") return "My Batches";
    if (path === "/admin/students") return "My Students";
    if (path === "/admin/settings") return "Settings";
    if (path === "/admin/superadmin-chat") return "SuperAdmin Chat";
    if (path.includes("/lesson-plan")) return "Lesson Plan";
    if (path.includes("/evaluation")) return "Evaluation";
    if (path.includes("/report")) return "Report";
    if (path.includes("/chat")) return "Batch Chat";
    return "Admin Dashboard";
  };

return (
  <div className="flex h-screen bg-[#f4f7fa]">
    {/* Sidebar */}
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm relative">

      {/* Profile */}
      <div className="border-b border-gray-200 h-20 flex items-center px-4">
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-100 w-full">
          <div className="relative">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
              <FaUserCircle className="text-lg" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{profile.name || "Admin User"}</p>
            <p className="text-xs text-gray-500 font-medium">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        {/* Home */}
        <NavLink
          to="/admin/"
          end
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 my-1 rounded-xl text-left transition-all duration-200 ease-in-out ${
              isActive ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FaHome className={`text-lg ${isActive ? "text-white" : "text-slate-600"}`} />
              <span className={`text-sm font-semibold tracking-wide ${isActive ? "text-white" : "text-gray-700"}`}>Dashboard</span>
            </>
          )}
        </NavLink>


        {/* Batches */}
<div>
  <div
    onClick={() => {
      toggleBatchSubmenu();
      navigate("/admin/batches"); // always navigate to batches on click
    }}
    className={`flex items-center gap-4 px-4 py-3 my-1 rounded-xl cursor-pointer transition-all duration-200 ease-in-out ${
      location.pathname.startsWith("/admin/batch/")
        ? "bg-gray-200 text-gray-800"
        : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
    }`}
  >
    <FaChalkboardTeacher className="text-lg text-slate-600" />
    <span className="text-sm font-semibold tracking-wide">My Batches</span>
    <FaChevronDown
      className={`ml-auto transition-transform duration-200 text-slate-600 ${
        showBatchSubmenu ? "rotate-180" : ""
      }`}
    />
  </div>

  {/* Subtopics if inside a batch */}
  {showBatchSubmenu && selectedBatchId && (
    <div className="ml-8 mt-2 space-y-1">
      <NavLink
        to={`/admin/batch/${selectedBatchId}/lesson-plan`}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2 my-1 rounded-lg transition-all duration-200 ${
            isActive ? "bg-gray-900 text-white shadow-md" : "hover:bg-blue-50 text-gray-600 hover:text-gray-700"
          }`
        }
      >
        <FaBook className="text-sm" />
        <span className="text-sm font-medium">Lesson Plan</span>
      </NavLink>
      <NavLink
        to={`/admin/batch/${selectedBatchId}/report`}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2 my-1 rounded-lg transition-all duration-200 ${
            isActive ? "bg-gray-900 text-white shadow-md" : "hover:bg-blue-50 text-gray-600 hover:text-gray-700"
          }`
        }
      >
        <FaFileAlt className="text-sm" />
        <span className="text-sm font-medium">Report</span>
      </NavLink>
      <NavLink
        to={`/admin/batch/${selectedBatchId}/chat`}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2 my-1 rounded-lg transition-all duration-200 ${
            isActive ? "bg-gray-900 text-white shadow-md" : "hover:bg-blue-50 text-gray-600 hover:text-gray-700"
          }`
        }
      >
        <FaComments className="text-sm" />
        <span className="text-sm font-medium">Chat</span>
      </NavLink>
    </div>
  )}
</div>


        {/* Students */}
        <NavLink
          to="/admin/students"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 my-1 rounded-xl text-left transition-all duration-200 ease-in-out ${
              isActive ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FaUsers className={`text-lg ${isActive ? "text-white" : "text-slate-600"}`} />
              <span className={`text-sm font-semibold tracking-wide ${isActive ? "text-white" : "text-gray-700"}`}>My Students</span>
            </>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 my-1 rounded-xl text-left transition-all duration-200 ease-in-out ${
              isActive ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FaCog className={`text-lg ${isActive ? "text-white" : "text-slate-600"}`} />
              <span className={`text-sm font-semibold tracking-wide ${isActive ? "text-white" : "text-gray-700"}`}>Settings</span>
            </>
          )}
        </NavLink>

        {/* SuperAdmin Chat */}
        <NavLink
          to="/admin/superadmin-chat"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 my-1 rounded-xl text-left transition-all duration-200 ease-in-out ${
              isActive ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FaComments className={`text-lg ${isActive ? "text-white" : "text-slate-600"}`} />
              <span className={`text-sm font-semibold tracking-wide ${isActive ? "text-white" : "text-gray-700"}`}>Super Admin Chat</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 border-2 border-red-600 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-red-600/25 transform hover:scale-105"
        >
          <FaSignOutAlt className="text-xl" />
          <span className="tracking-wide">Sign Out</span>
        </button>
      </div>
    </div>

    {/* Main content area with Topbar */}
    <div className="flex-1 flex flex-col h-full">
  <Topbar pageTitle={getPageTitle()} adminName={profile.name} />
  <div className="flex-1 overflow-y-auto bg-[#f8fafc]">{children}</div>
</div>

  </div>
);
}

export default Sidebar;