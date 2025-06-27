import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaHome, FaBook, FaUser, FaUsers, FaChartBar, FaFolderPlus,
  FaMoneyBill, FaCog, FaEnvelope, FaSignOutAlt , FaChartPie
} from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import {toast} from "react-toastify";

const menuItems = [
  { id: "dashboard", icon: <FaHome />, label: "Dashboard", path: "/superadmin" },
  { id: "admins", icon: <FaUser />, label: "Admin Management", path: "/superadmin/admins" },
  { id: "courses", icon: <FaBook />, label: "Course Management", path: "/superadmin/courses" },
  { id: "batches", icon: <FaFolderPlus />, label: "Batch Management", path: "/superadmin/batches" },
  { id: "students", icon: <FaUsers />, label: "Student Management", path: "/superadmin/students" },
  { id: "salary", icon: <FaMoneyBill />, label: "Salary Management", path: "/superadmin/salary" },
  { id: "communication", icon: <FaEnvelope />, label: "Communication", path: "/superadmin/communication" },
  { id: "analytics", icon: <FaChartPie />, label: "Analytics", path: "/superadmin/analytics" },
  { id: "setings", icon: <FaCog />, label: "Settings", path: "/superadmin/settings" },
];


export default function Sidebar({ onHover }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
  const currentPath = location.pathname;
  const current = menuItems.find(item => currentPath.endsWith(item.path));
  setActive(current?.id || "");
}, [location]);

  useEffect(() => {
    const fetchSuperAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:5000/auth/superadmin/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const superAdmin = res.data?.[0]; 
        if (superAdmin) {
          setUserEmail(superAdmin.email || "admin@lms.com");
        }
      } catch (error) {
        console.error("Error fetching super admin:", error);
      }
    };
    fetchSuperAdmin();
  }, []);

const handleLogout = async () => {
  const token = localStorage.getItem("token");
  try {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setTimeout(() => {
      navigate("/login");
    }, 500);
  } catch (error) {
    console.error("Logout failed:", error);
    toast.error("Logout failed");
  }
};


  return (
    <aside
      onMouseEnter={() => {
        setExpanded(true);
        onHover(true);
      }}
      onMouseLeave={() => {
        setExpanded(false);
        onHover(false);
      }}
      className={`h-[98vh] ${expanded ? "w-64" : "w-18"} bg-white border-r border-gray-200 shadow-sm flex flex-col justify-between fixed top-0 left-0 z-50 transition-all duration-300`}
    >
      <div>
        <div className="flex items-center gap-2 p-2 border-b">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">LMS</div>
          {expanded && (
            <div>
              <p className="text-sm text-gray-700">Super Admin</p>
              <h1 className="font-semibold text-gray-800">LMS Portal</h1>
            </div>
          )}
        </div>

        <div className="border-b p-4">
  {expanded ? (
    <div className="flex items-center gap-3 bg-red-50 px-3 py-2 rounded-lg">
      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
        <FaUser />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-700">Super Admin</p>
        <p className="text-xs text-gray-700">{userEmail}</p>
      </div>
    </div>
  ) : (
    <div className="flex justify-center">
      <div
        className="h-10 w-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-lg"
        title={userEmail}
      >
        <FaUser />
      </div>
    </div>
  )}
</div>

        <nav className="flex flex-col px-2 py-4">
          {menuItems.map(({ id, icon, label, path }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => navigate(path)}
                className={`flex items-center gap-4 px-4 py-3 my-1 rounded-lg text-left transition-all ${
                  isActive
                    ? "bg-blue-700 text-white shadow"
                    : "hover:bg-blue-50 text-gray-700"
                }`}
              >
                <span className={`text-lg ${isActive ? "text-white" : "text-blue-700"}`}>
                  {icon}
                </span>
                {expanded && <span className="text-sm font-medium">{label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t flex flex-col gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-sm text-red-600 hover:text-red-800"
        >
          <FaSignOutAlt className="text-lg" />
          {expanded && "Logout"}
        </button>
      </div>
    </aside>
  );
}