// components/AdminPublicRoute.jsx
import { useEffect, useState } from "react";

const PublicRoute = ({ children }) => {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      // Optional: verify token via API here
      window.location.href = "http://localhost:3003"; // full redirect
    } else {
      setCanRender(true);
    }
  }, []);

  return canRender ? children : null; // or a spinner
};

export default PublicRoute;
