import { useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import StudentHome from './pages/StudentHome';
import StudentChat from './pages/StudentChat';
import { ToastContainer, toast } from 'react-toastify';
import StudentBatch from './pages/StudentBatch';

function AppRoutes() {

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

        <Route path="/batch/:batchId" 
          element={
            <PrivateRoute>
                <StudentBatch />
            </PrivateRoute>} />
        
        <Route path="/chat" element={<StudentChat />} />

      </Routes>


    </>
  );
}

export default AppRoutes;
