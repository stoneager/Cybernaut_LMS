import { useEffect, useState } from 'react';
import API from '../api';

const PrivateRoute = () => {
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || !role) {
        window.location.href = '/login';
        return;
      }

      try {
        // Verify token is still valid
        await API.get('/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Redirect based on role
        if (role === 'superadmin') {
          window.location.href = `http://localhost:5173/superadmin?token=${token}&role=${role}`;
        } else if (role === 'admin') {
          window.location.href = `http://localhost:5173/admin?token=${token}&role=${role}`;
        } else if (role === 'student') {
          window.location.href = `http://localhost:5173/student?token=${token}&role=${role}`;
        } else {
          alert('Unknown user role');
          localStorage.clear();
          window.location.href = '/login';
        }

      } catch (err) {
        // Token invalid or expired
        console.error('Token invalid:', err);
        localStorage.clear();
        window.location.href = '/login';
      }
    };

    checkAuthAndRedirect();
  }, []);

  return null; // No UI rendered
};

export default PrivateRoute;
