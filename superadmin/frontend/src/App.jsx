import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Topbar from './components/topbar';
import Home from './components/home';
import Admins from './components/admin';
import Batches from './components/batches';
import Payment from './components/payment';
import AnalyticsPage from './components/analyticspage';
import Courses from './components/courses';
import Student from './components/student';
import SuperAdminChat from './components/superadminchat';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const routeTitles = {
  '/': 'Dashboard',
  '/admins': 'Admin Management',
  '/salary': 'Salary Management',
  '/batches': 'Batch Management',
  '/courses': 'Course Management',
  '/students': 'Student Management',
  '/analytics': 'Analytics',
  '/communication': 'Communication',
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = routeTitles[location.pathname] || 'Dashboard';
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // ✅ Token and role storage on login via URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role');

    if (token && role) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      window.history.replaceState(null, '', '/'); // Clean up the URL
      toast.success('Login successful');
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onHover={setIsSidebarExpanded} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'ml-64' : 'ml-20'
        }`}
      >
        <Topbar pageTitle={pageTitle} />
        <ToastContainer position="top-right" autoClose={3000} />
        <main className="flex-1 transition-all duration-300 ease-in-out p-2">
          <Routes>
            {/* ✅ Private Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/admins"
              element={
                <PrivateRoute>
                  <Admins />
                </PrivateRoute>
              }
            />
            <Route
              path="/batches"
              element={
                <PrivateRoute>
                  <Batches />
                </PrivateRoute>
              }
            />
            <Route
              path="/students"
              element={
                <PrivateRoute>
                  <Student />
                </PrivateRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <PrivateRoute>
                  <Courses />
                </PrivateRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <PrivateRoute>
                  <Payment />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <AnalyticsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/communication"
              element={
                <PrivateRoute>
                  <SuperAdminChat />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
