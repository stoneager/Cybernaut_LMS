import { useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import StudentHome from './pages/StudentHome';
import StudentChat from './pages/StudentChat';
import { ToastContainer, toast } from 'react-toastify';
import StudentBatch from './pages/StudentBatch';

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      window.history.replaceState(null, '', '/');
      toast.success('Login successful');
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <StudentHome />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat/:module/:type"
          element={
            <PrivateRoute>
              <StudentChat />
            </PrivateRoute>
          }
        />

        <Route path="/student/batch/:batchId" 
          element={
            <PrivateRoute>
                <StudentBatch />
            </PrivateRoute>} />
        
        <Route path="/student/chat" element={<StudentChat />} />

      </Routes>


    </>
  );
}

export default AppRoutes;
