import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Simple Route Guard to protect routes and route admin vs user/doctor
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  if (loading) {
    return <div className="text-center py-5"><h4>Loading...</h4></div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Get role from context or local storage
  const currentUser = user || JSON.parse(localStorage.getItem('userData') || '{}');
  const role = currentUser.role || (currentUser.type === 'admin' ? 'admin' : (currentUser.isdoctor ? 'doctor' : 'user'));

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserHome />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/userhome" 
        element={
          <ProtectedRoute>
            <UserHome />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
