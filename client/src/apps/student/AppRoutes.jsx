import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import StudentHome from './pages/StudentHome';
import StudentChat from './pages/StudentChat';
import StudentBatch from './pages/StudentBatch';
import StudentSidebar from './pages/StudentSidebar';
import { ToastContainer } from 'react-toastify';

function AppRoutes() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <StudentSidebar>
                <StudentHome />
              </StudentSidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/chat/:module/:type"
          element={
            <PrivateRoute>
              <StudentSidebar>
                <StudentChat />
              </StudentSidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/batch/:batchId"
          element={
            <PrivateRoute>
              <StudentSidebar>
                <StudentBatch />
              </StudentSidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <StudentSidebar>
                <StudentChat />
              </StudentSidebar>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default AppRoutes;
