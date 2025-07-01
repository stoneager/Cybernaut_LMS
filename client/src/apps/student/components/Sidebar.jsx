import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaChalkboardTeacher,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaComments,
  FaChartBar, // <-- Added for Quiz Reports
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Topbar from "./Topbar";

const Sidebar = ({ children, pageTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState(null);
  const [batchId, setBatchId] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/");

        const res = await axios.get("http://localhost:5000/auth/student/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudent(res.data);
        setBatchId(res.data.batch);
      } catch (error) {
        console.error("Failed to load student data:", error);
        toast.error("Failed to load profile");
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

  return (
    <div className="flex h-screen bg-[#f4f7fa]">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm relative">
        {/* Profile */}
        <div className="border-b border-gray-200 h-20 flex items-center px-4 py-6">
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-100 w-full">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                <FaUserCircle className="text-lg" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {student?.user?.name || "Student"}
              </p>
              <p className="text-xs text-gray-500 font-medium">{student?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 my-1 rounded-xl transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-gray-900 text-white shadow-lg"
                  : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
              }`
            }
          >
            <FaHome className="text-lg" />
            <span className="text-sm font-semibold tracking-wide">Dashboard</span>
          </NavLink>

          {batchId && (
            <>
              <NavLink
                to={`/student/batch/${batchId}`}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 my-1 rounded-xl transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-gray-900 text-white shadow-lg"
                      : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
                  }`
                }
              >
                <FaChalkboardTeacher className="text-lg" />
                <span className="text-sm font-semibold tracking-wide">My Course</span>
              </NavLink>

              <NavLink
                to={`/student/chat?type=forum&batch=${batchId}`}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 my-1 rounded-xl transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-gray-900 text-white shadow-lg"
                      : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
                  }`
                }
              >
                <FaComments className="text-lg" />
                <span className="text-sm font-semibold tracking-wide">Chat</span>
              </NavLink>

              <NavLink
                to="/student/reports"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 my-1 rounded-xl transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-gray-900 text-white shadow-lg"
                      : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
                  }`
                }
              >
                <FaChartBar className="text-lg" />
                <span className="text-sm font-semibold tracking-wide">Quiz Reports</span>
              </NavLink>
            </>
          )}

          <NavLink
            to="/student/settings"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 my-1 rounded-xl transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-gray-900 text-white shadow-lg"
                  : "hover:bg-blue-50 text-gray-700 hover:shadow-sm"
              }`
            }
          >
            <FaCog className="text-lg" />
            <span className="text-sm font-semibold tracking-wide">Settings</span>
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

      {/* Main Content with Topbar */}
      <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
        <Topbar pageTitle={pageTitle} userName={student?.user?.name || "Student"} />
        <div className="pt-4 px-6 pb-6">{children}</div>
      </div>
    </div>
  );
};

export default Sidebar;
