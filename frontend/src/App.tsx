// frontend/src/App.tsx

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignUpPage/SignUpPage';
import TimeTrackingPage from './pages/TimeTrackingPage/TimeTrackingPage';
import './styles/global.css'; 

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingInitialAuth, setLoadingInitialAuth] = useState(true); 
  useEffect(() => {

    const storedUserId = localStorage.getItem('ilumeo_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    setLoadingInitialAuth(false);
  }, []);

  const handleLoginSuccess = (id: string) => { 
    setUserId(id);
    localStorage.setItem('ilumeo_user_id', id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('ilumeo_user_id');
  };


  if (loadingInitialAuth) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
            Carregando...
        </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          userId ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
        } />

        <Route path="/signup" element={
          userId ? <Navigate to="/dashboard" replace /> : <SignupPage />
        } />

        <Route path="/dashboard" element={
          userId ? <TimeTrackingPage userId={userId} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;