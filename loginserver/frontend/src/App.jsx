import PrivateRoute from './components/PrivateRoute'
import PublicRoute from './components/PublicRoute' 
import Login from './components/Login'
import Register from './components/Register'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

// In your App component (or AdminLayout if global)




function App() {
  return (
    <Router>
      <Routes>
        <Route
        path="/login" element={
          <PublicRoute>
             <Login />
          </PublicRoute>
        }/>
        
        <Route 
        path="/" element ={
          <PrivateRoute>
            <>Hello</>
          </PrivateRoute>
        } />
        
        
      </Routes>
    </Router>
  )
}

export default App
