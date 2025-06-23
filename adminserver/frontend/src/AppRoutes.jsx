import { useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

import AdminHome from "./components/AdminHome";
import EvaluationPage from './pages/EvaluationPage';
import ReportPage from "./pages/ReportPage";
import LessonPlan from './pages/LessonPlan';
import AdminChat from './pages/AdminChat';

import { ToastContainer, toast } from 'react-toastify';

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role');

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      window.history.replaceState(null, '', '/'); // Clean URL
      toast.success("Login successful");           // ✅ Show success toast
      navigate('/');                               // ✅ Redirect to home
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
              <AdminHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/batch/:batchId/lesson-plan"
          element={
            <PrivateRoute>
              <LessonPlan />
            </PrivateRoute>
          }
        />
        <Route
          path="/batch/:batchId/evaluation"
          element={
            <PrivateRoute>
              <EvaluationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/batch/:batchId/report"
          element={
            <PrivateRoute>
              <ReportPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/batch/:batchId/chat"
          element={
            <PrivateRoute>
              <AdminChat />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default AppRoutes;