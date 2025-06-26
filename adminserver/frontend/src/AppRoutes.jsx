import { useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminHome from "./components/AdminHome";
import EvaluationPage from './pages/EvaluationPage';
import ReportPage from "./pages/ReportPage";
import LessonPlan from './pages/LessonPlan';
import AdminChat from './pages/AdminChat';
import StudentList from './pages/studentList';
import SuperAdminChat from './pages/SuperAdminChat';
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from './components/Sidebar';
import Settings from './pages/Settings';

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
              <Sidebar>
              <AdminDashboard />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/batches"
          element={
            <PrivateRoute>
              <Sidebar>
              <AdminHome />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/students"
          element={
            <PrivateRoute>
              <Sidebar>
              <StudentList />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/superadmin-chat"
          element={
            <PrivateRoute>
              <Sidebar>
              <SuperAdminChat />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/batch/:batchId/lesson-plan"
          element={
            <PrivateRoute>
              <Sidebar>
              <LessonPlan />
              </Sidebar>
            </PrivateRoute>
          }
        />
        <Route
          path="/evaluate/:batch/:module/:title/:day"
          element={
            <PrivateRoute>
              <Sidebar>
              <EvaluationPage />
              </Sidebar>
            </PrivateRoute>
          }
        />
        <Route
          path="/batch/:batchId/report"
          element={
            <PrivateRoute>
              <Sidebar>
              <ReportPage />
              </Sidebar>
            </PrivateRoute>
          }
        />
        <Route
          path="/batch/:batchId/chat"
          element={
            <PrivateRoute>
              <Sidebar>
              <AdminChat />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Sidebar>
              <Settings />
              </Sidebar>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default AppRoutes;