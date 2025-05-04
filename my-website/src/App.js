import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CryptoAnalysis from './components/CryptoAnalysis';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getCurrentUser } from './services/firebase';

// AppContent bileşeni - Router içinde kullanılacak
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  
  // Firebase kullanıcı durumunu izle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Kullanıcı oturum açmış
          console.log('Firebase kullanıcısı:', firebaseUser);
          
          // Depolanan kullanıcı bilgilerini al (localStorage'dan)
          let userData = JSON.parse(localStorage.getItem('user')) || {};
          
          // Kullanıcı nesnesini oluştur/güncelle
          const user = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: userData.user?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
            lastName: userData.user?.lastName || firebaseUser.displayName?.split(' ')[1] || '',
          };
          
          setUser(user);
          setUserData(userData);
        } catch (error) {
          console.error('Kullanıcı bilgileri alınırken hata:', error);
          setUser(null);
          setUserData(null);
        }
      } else {
        // Kullanıcı oturum açmamış
        console.log('Kullanıcı giriş yapmamış');
        setUser(null);
        setUserData(null);
        localStorage.removeItem('user');
      }
      
      setLoading(false);
    });
    
    // Temizleme fonksiyonu
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUser(userData);
    }
  }, []);
  
  // Korumalı rota bileşeni
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="loading">Yükleniyor...</div>;
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userData');
    navigate('/login');
  };
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage user={user} />
          </ProtectedRoute>
        } />
        <Route path="/crypto-analysis" element={
          <ProtectedRoute>
            <CryptoAnalysis />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

// Ana App bileşeni - Router'ı içerir
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
