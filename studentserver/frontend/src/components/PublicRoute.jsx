// components/AdminPublicRoute.jsx
import { useEffect, useState } from "react";

const AdminPublicRoute = ({ children }) => {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      // Optional: verify token via API here
      window.location.href = "http://localhost:3002/admin/dashboard"; // full redirect
    } else {
      setCanRender(true);
    }
  }, []);

  return canRender ? children : null; // or a spinner
};

export default AdminPublicRoute;
