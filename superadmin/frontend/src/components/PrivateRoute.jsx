import { useEffect, useState } from 'react';
import axios from 'axios';

const PrivateRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token"); // ✅ use correct key

      if (!token) {
  setCheckingAuth(false);
  setIsAuthenticated(false);
  return;
}


  try {
  await axios.get("http://localhost:5000/auth/verify", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  setIsAuthenticated(true);
} catch (err) {
  localStorage.removeItem("token");
  setIsAuthenticated(false); // add this!
} finally {
  setCheckingAuth(false); // make sure it's always reached
}

    };

    verifyToken();
  }, []);

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default PrivateRoute;
