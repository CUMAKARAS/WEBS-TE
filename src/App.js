import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { analyzeCrypto, login, register } from './services/api';
import './App.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactForm from './components/ContactForm';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const data = await analyzeCrypto();
        setAnalysis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      setUser(response.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register(email, password);
      setUser(response.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
        
        {/* Örnek korumalı rota */}
        <Route 
          path="/dashboard" 
          element={user ? (
            <div className="App">
              <header className="App-header">
                <h1>Hoş Geldiniz, {user?.fullName || user?.email}</h1>
                <p className="aciklama">
                  Kullanıcı paneline başarıyla giriş yaptınız!
                </p>
                <button className="btn" onClick={() => setUser(null)}>Çıkış Yap</button>
              </header>
              
              <main className="App-main">
                <section className="hakkimda">
                  <h2>Hakkımda</h2>
                  <p>
                    Bu bölümde kendim hakkında bilgiler paylaşabilirim. Bu site React ile geliştirilmiştir.
                  </p>
                  <button className="btn" onClick={() => alert('Merhaba!')}>Selam Ver</button>
                </section>
                
                <section className="beceriler">
                  <h2>Becerilerim</h2>
                  <ul>
                    <li>HTML</li>
                    <li>CSS</li>
                    <li>JavaScript</li>
                    <li>React</li>
                  </ul>
                </section>
                
                <section className="iletisim">
                  <ContactForm />
                </section>
              </main>
              
              <footer className="App-footer">
                <p>&copy; 2025 Benim Web Sitem</p>
              </footer>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )}
        />

        {/* Olmayan sayfalar için yönlendirme */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 