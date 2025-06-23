import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Topbar from './components/topbar';
import Home from './components/home';
import Admins from './components/admin';
import Salary from './components/salary';
import Batches from './components/batches';
import Payment from './components/payment';
import AnalyticsPage from './components/analyticspage';
import Courses from './components/courses';
import Student from './components/student';
import SuperAdminChat from './components/superadminchat';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const routeTitles = {
  '/': 'Dashboard',
  '/admins': 'Admin Management',
  '/salary': 'Salary Management',
  '/batches': 'Batch Management',
  '/courses': 'Course Management',
  '/students': 'Student Management',
  '/analytics': 'Analytics',
};

const AppContent = () => {
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || 'Dashboard';
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

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
            <Route path="/" element={<Home />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/students" element={<Student />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/salary" element={<Payment />} />
            <Route path="/analytics" element={<AnalyticsPage />}/>
            <Route path='/communication' element = {<SuperAdminChat/>} />
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