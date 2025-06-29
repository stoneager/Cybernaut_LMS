import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import StudentHome from './pages/StudentHome';
import StudentChat from './pages/StudentChat';
import StudentBatch from './pages/StudentBatch';
import Sidebar from './components/Sidebar';
import { ToastContainer } from 'react-toastify';
import Settings from './pages/Settings';

function AppRoutes() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Sidebar>
                <StudentHome />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/chat/:module/:type"
          element={
            <PrivateRoute>
              <Sidebar>
                <StudentChat />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/batch/:batchId"
          element={
            <PrivateRoute>
              <Sidebar>
                <StudentBatch />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Sidebar>
                <StudentChat />
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
