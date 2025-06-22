import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../api'; // your axios instance

const PrivateRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        await API.get('/auth/verify'); // A lightweight protected endpoint
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyToken();
  }, []);

  if (checkingAuth) return null; // or a loading spinner

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
